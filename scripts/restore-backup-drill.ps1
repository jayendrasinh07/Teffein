[CmdletBinding()]
param(
  [Parameter(Mandatory)][string]$BackupPath,
  [int]$Port = 55432,
  [switch]$UseWindowsProtectedKey,
  [string]$PortableKeyPath,
  [string]$RecoveryCardPath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Import-Module (Join-Path $PSScriptRoot 'TeffeinBackupCrypto.psm1') -Force

$pgBin = Split-Path (Get-Command pg_restore -ErrorAction Stop).Source
$tempRoot = Join-Path $env:TEMP ('teffein-restore-drill-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$cluster = Join-Path $tempRoot 'postgres'
$zipPath = Join-Path $tempRoot 'backup.zip'
$extract = Join-Path $tempRoot 'files'
$log = Join-Path $tempRoot 'postgres.out.log'
$errorLog = Join-Path $tempRoot 'postgres.error.log'
$started = $false
$serverProcess = $null
New-Item -ItemType Directory -Path $tempRoot,$extract -Force | Out-Null

try {
  if ($UseWindowsProtectedKey) {
    $passphrase = Get-TeffeinWindowsProtectedPassphrase -KeyPath (Join-Path (Split-Path $BackupPath) '.teffein-backup-key.dpapi')
  } elseif ($PortableKeyPath) {
    if ($RecoveryCardPath) {
      $card = Get-Content -LiteralPath $RecoveryCardPath -Raw
      $match = [regex]::Match($card, '(?m)^RECOVERY-CODE:\s*(\S+)\s*$')
      if (-not $match.Success) { throw 'Recovery card does not contain a recovery code.' }
      $code = ConvertTo-SecureString $match.Groups[1].Value -AsPlainText -Force
    } else {
      $code = Read-Host 'Portable recovery code' -AsSecureString
    }
    $passphrase = Get-TeffeinPortablePassphrase -PortableKeyPath $PortableKeyPath -RecoveryCode $code
  } else {
    $passphrase = Read-Host 'Backup encryption passphrase' -AsSecureString
  }
  Unprotect-TeffeinFile -InputPath $BackupPath -OutputPath $zipPath -Passphrase $passphrase
  Expand-Archive -LiteralPath $zipPath -DestinationPath $extract
  $manifest = Get-Content -LiteralPath (Join-Path $extract 'manifest.json') -Raw | ConvertFrom-Json

  & (Join-Path $pgBin 'initdb.exe') --auth trust --username postgres --encoding UTF8 --pgdata $cluster | Out-Null
  if ($LASTEXITCODE) { throw 'Disposable PostgreSQL cluster initialization failed.' }
  $serverProcess = Start-Process -FilePath (Join-Path $pgBin 'postgres.exe') `
    -ArgumentList @('-D',$cluster,'-p',"$Port",'-h','127.0.0.1') `
    -RedirectStandardOutput $log -RedirectStandardError $errorLog -WindowStyle Hidden -PassThru
  foreach ($attempt in 1..30) {
    & (Join-Path $pgBin 'pg_isready.exe') --host 127.0.0.1 --port $Port --username postgres | Out-Null
    if ($LASTEXITCODE -eq 0) { $started = $true; break }
    Start-Sleep -Milliseconds 500
  }
  if (-not $started) { throw 'Disposable PostgreSQL cluster did not start.' }

  $env:PGHOST='127.0.0.1'; $env:PGPORT="$Port"; $env:PGUSER='postgres'; $env:PGDATABASE='postgres'
  & (Join-Path $pgBin 'psql.exe') --set ON_ERROR_STOP=1 --file (Join-Path $PSScriptRoot '..\tests\bootstrap.sql') | Out-Null
  if ($LASTEXITCODE) { throw 'Supabase auth bootstrap failed.' }
  & (Join-Path $pgBin 'psql.exe') --set ON_ERROR_STOP=1 --command 'drop schema public cascade;' | Out-Null
  if ($LASTEXITCODE) { throw 'Disposable public schema reset failed.' }
  & (Join-Path $pgBin 'pg_restore.exe') --exit-on-error --no-owner --no-privileges --dbname=postgres (Join-Path $extract 'app-schema.dump') | Out-Null
  if ($LASTEXITCODE) { throw 'Application schema restore failed.' }
  & (Join-Path $pgBin 'pg_restore.exe') --exit-on-error --single-transaction --disable-triggers --no-owner --no-privileges --schema public --schema private --dbname=postgres (Join-Path $extract 'all-data.dump') | Out-Null
  if ($LASTEXITCODE) { throw 'Application data restore failed.' }

  $verifySql = @"
select json_build_object(
  'public_tables', (select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE'),
  'private_tables', (select count(*) from information_schema.tables where table_schema='private' and table_type='BASE TABLE'),
  'orders', (select count(*) from public.orders),
  'menu_days', (select count(*) from public.menu_days),
  'rls_tables', (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity),
  'place_order_secure', exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='place_order_secure')
)::text;
"@
  $result = (& (Join-Path $pgBin 'psql.exe') --tuples-only --no-align --set ON_ERROR_STOP=1 --command $verifySql).Trim() | ConvertFrom-Json
  if ($LASTEXITCODE) { throw 'Restore verification query failed.' }
  if ([int]$result.public_tables -ne [int]$manifest.public_tables -or [int]$result.private_tables -ne [int]$manifest.private_tables -or [int]$result.orders -ne [int]$manifest.orders -or [int]$result.menu_days -ne [int]$manifest.menu_days) {
    throw 'Restored row counts do not match the encrypted backup manifest.'
  }
  if (-not $result.place_order_secure) { throw 'place_order_secure is missing after restore.' }
  Write-Host "RESTORE DRILL PASSED: $($result.public_tables) public tables, $($result.private_tables) private tables, $($result.orders) orders, $($result.menu_days) menu days."
} finally {
  if ($started) {
    $stop = Start-Process -FilePath (Join-Path $pgBin 'pg_ctl.exe') `
      -ArgumentList @('--pgdata',$cluster,'stop','--mode','fast') -WindowStyle Hidden -Wait -PassThru
    if ($stop.ExitCode -ne 0 -and $serverProcess -and -not $serverProcess.HasExited) { Stop-Process -Id $serverProcess.Id -Force }
  }
  foreach ($name in @('PGHOST','PGPORT','PGUSER','PGDATABASE')) { Remove-Item -Path "Env:$name" -ErrorAction SilentlyContinue }
  if (Test-Path -LiteralPath $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
}
