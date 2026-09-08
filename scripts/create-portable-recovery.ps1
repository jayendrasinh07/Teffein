[CmdletBinding()]
param(
  [string]$BackupDirectory = (Join-Path $env:OneDrive 'TEFFEIN Secure Backups'),
  [string]$RecoveryCardPath = (Join-Path $env:USERPROFILE 'TEFFEIN Recovery Code - PRINT AND STORE.txt')
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
Import-Module (Join-Path $PSScriptRoot 'TeffeinBackupCrypto.psm1') -Force

$windowsKey = Join-Path $BackupDirectory '.teffein-backup-key.dpapi'
$portableKey = Join-Path $BackupDirectory '.teffein-portable-key.tefkey'
if (-not (Test-Path -LiteralPath $windowsKey)) { throw 'Windows-protected TEFFEIN backup key was not found.' }
if (Test-Path -LiteralPath $portableKey) { throw 'Portable recovery key already exists. Rotate it deliberately instead of overwriting it.' }
if (Test-Path -LiteralPath $RecoveryCardPath) { throw 'Recovery card path already exists. Move it to a safe place before creating another.' }

Export-TeffeinPortableRecovery -WindowsKeyPath $windowsKey -PortableKeyPath $portableKey -RecoveryCardPath $RecoveryCardPath
Write-Host "Portable encrypted key created: $portableKey"
Write-Host "Recovery card created separately: $RecoveryCardPath"
Write-Host 'Print or move the recovery card to a password manager/USB, then delete this local plaintext copy.'
