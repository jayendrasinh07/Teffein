[CmdletBinding()]
param(
  [string]$ProjectRef = 'boeceqmjrnxpkmhppblq',
  [string]$Destination = (Join-Path $env:OneDrive 'Thalimitra Secure Backups'),
  [switch]$UseWindowsProtectedKey
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Import-Module (Join-Path $PSScriptRoot 'TeffeinBackupCrypto.psm1') -Force

if (-not $env:OneDrive -and -not $PSBoundParameters.ContainsKey('Destination')) {
  throw 'OneDrive was not found. Pass -Destination with an off-site synced folder.'
}
$pgDump = (Get-Command pg_dump -ErrorAction Stop).Source
$psql = (Get-Command psql -ErrorAction Stop).Source
$supabaseCommand = Get-Command supabase -ErrorAction SilentlyContinue
$supabasePrefix = @()
if ($supabaseCommand) {
  $supabaseExecutable = $supabaseCommand.Source
} else {
  $workRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
  $cachedPattern = Join-Path $workRoot 'npm-cache\_npx\*\node_modules\@supabase\cli-windows-x64\bin\supabase.exe'
  $cachedCli = Get-ChildItem -Path $cachedPattern -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime | Select-Object -First 1
  if ($cachedCli) {
    $supabaseExecutable = $cachedCli.FullName
  } else {
    $supabaseExecutable = (Get-Command npx -ErrorAction Stop).Source
    $supabasePrefix = @('--yes','supabase@2.117.0')
  }
}

function Get-TemporaryDatabaseEnvironment {
  Write-Host 'Creating short-lived Supabase database login...'
  $output = & $supabaseExecutable @supabasePrefix db dump --dry-run --project-ref $ProjectRef --schema public 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) { throw 'Supabase temporary database login could not be created. Run npx supabase login and retry.' }
  $result = @{}
  foreach ($name in @('PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE')) {
    $match = [regex]::Match($output, "export $name=`"([^`"]+)`"")
    if (-not $match.Success) { throw "Supabase did not return $name." }
    $result[$name] = $match.Groups[1].Value
  }
  Write-Host 'Short-lived database login ready.'
  $result
}

New-Item -ItemType Directory -Path $Destination -Force | Out-Null
if ($UseWindowsProtectedKey) {
  $passphrase = Get-TeffeinWindowsProtectedPassphrase -KeyPath (Join-Path $Destination '.teffein-backup-key.dpapi')
} else {
  $passphrase = Read-Host 'Create backup encryption passphrase' -AsSecureString
  $confirm = Read-Host 'Repeat backup encryption passphrase' -AsSecureString
  $p1 = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($passphrase)
  $p2 = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($confirm)
  try {
    if ([Runtime.InteropServices.Marshal]::PtrToStringBSTR($p1) -cne [Runtime.InteropServices.Marshal]::PtrToStringBSTR($p2)) {
      throw 'Passphrases do not match.'
    }
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p1)
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($p2)
  }
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$tempRoot = Join-Path $env:TEMP "thalimitra-backup-$stamp"
$zipPath = Join-Path $env:TEMP "thalimitra-backup-$stamp.zip"
$encryptedPath = Join-Path $Destination "thalimitra-production-$stamp.tefbackup"
New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null

try {
  $db = Get-TemporaryDatabaseEnvironment
  foreach ($name in $db.Keys) { Set-Item -Path "Env:$name" -Value $db[$name] }
  $env:PGSSLMODE = 'require'

  $countsSql = @"
set role postgres;
select json_build_object(
  'created_at_utc', timezone('utc', now()),
  'project_ref', '$ProjectRef',
  'postgres_version', current_setting('server_version'),
  'public_tables', (select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE'),
  'private_tables', (select count(*) from information_schema.tables where table_schema='private' and table_type='BASE TABLE'),
  'auth_users', (select count(*) from auth.users),
  'verified_mfa_factors', (select count(*) from auth.mfa_factors where status='verified'),
  'orders', (select count(*) from public.orders),
  'menu_days', (select count(*) from public.menu_days),
  'migration_versions', (select json_agg(version order by version) from supabase_migrations.schema_migrations)
)::text;
"@
  $manifest = & $psql --quiet --tuples-only --no-align --set ON_ERROR_STOP=1 --command $countsSql
  if ($LASTEXITCODE) { throw 'Backup manifest query failed.' }
  $manifest.Trim() | Set-Content -LiteralPath (Join-Path $tempRoot 'manifest.json') -Encoding utf8NoBOM

  Write-Host 'Dumping application schema...'
  $appSchemaPath = Join-Path $tempRoot 'app-schema.dump'
  & $pgDump --schema-only --format=custom --no-owner --no-privileges --role postgres --schema public --schema private --file $appSchemaPath
  if ($LASTEXITCODE) { throw 'Application schema dump failed.' }
  Write-Host 'Dumping production data...'
  $allDataPath = Join-Path $tempRoot 'all-data.dump'
  & $pgDump --data-only --format=custom --no-owner --no-privileges --role postgres --schema public --schema private --schema auth --schema storage --file $allDataPath
  if ($LASTEXITCODE) { throw 'Production data dump failed.' }

  Write-Host 'Encrypting and checksumming backup...'
  Compress-Archive -Path (Join-Path $tempRoot '*') -DestinationPath $zipPath -CompressionLevel Optimal
  Protect-TeffeinFile -InputPath $zipPath -OutputPath $encryptedPath -Passphrase $passphrase
  $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $encryptedPath).Hash.ToLowerInvariant()
  "$hash  $(Split-Path $encryptedPath -Leaf)" | Set-Content -LiteralPath "$encryptedPath.sha256" -Encoding ascii
  Write-Host "Encrypted backup created: $encryptedPath"
  Write-Host "SHA-256: $hash"
} finally {
  foreach ($name in @('PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE','PGSSLMODE')) { Remove-Item -Path "Env:$name" -ErrorAction SilentlyContinue }
  if (Test-Path -LiteralPath $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
  if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
}
