Set-StrictMode -Version Latest

$script:Magic = [Text.Encoding]::ASCII.GetBytes('TEFFEINBKP1')
$script:PortableMagic = [Text.Encoding]::ASCII.GetBytes('TEFFEINKEY1')
$script:Iterations = 600000

function Get-PlainText([Security.SecureString]$SecureValue) {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Get-TeffeinKeys([string]$Passphrase, [byte[]]$Salt, [int]$Iterations) {
  $kdf = [Security.Cryptography.Rfc2898DeriveBytes]::new(
    $Passphrase,
    $Salt,
    $Iterations,
    [Security.Cryptography.HashAlgorithmName]::SHA256
  )
  try {
    $material = $kdf.GetBytes(64)
    [pscustomobject]@{
      Encryption = $material[0..31]
      Authentication = $material[32..63]
    }
  } finally {
    $kdf.Dispose()
  }
}

function Get-TeffeinWindowsProtectedPassphrase {
  param([Parameter(Mandatory)][string]$KeyPath)

  Add-Type -AssemblyName System.Security.Cryptography.ProtectedData
  $entropy = [Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes('TEFFEIN production backup key v1'))
  if (Test-Path -LiteralPath $KeyPath) {
    $wrapped = [Convert]::FromBase64String((Get-Content -LiteralPath $KeyPath -Raw).Trim())
    $secret = [Security.Cryptography.ProtectedData]::Unprotect(
      $wrapped,
      $entropy,
      [Security.Cryptography.DataProtectionScope]::CurrentUser
    )
  } else {
    $secret = [byte[]]::new(48)
    [Security.Cryptography.RandomNumberGenerator]::Fill($secret)
    $wrapped = [Security.Cryptography.ProtectedData]::Protect(
      $secret,
      $entropy,
      [Security.Cryptography.DataProtectionScope]::CurrentUser
    )
    [Convert]::ToBase64String($wrapped) | Set-Content -LiteralPath $KeyPath -Encoding ascii -NoNewline
  }
  try {
    ConvertTo-SecureString ([Convert]::ToBase64String($secret)) -AsPlainText -Force
  } finally {
    [Security.Cryptography.CryptographicOperations]::ZeroMemory($secret)
  }
}

function Export-TeffeinPortableRecovery {
  param(
    [Parameter(Mandatory)][string]$WindowsKeyPath,
    [Parameter(Mandatory)][string]$PortableKeyPath,
    [Parameter(Mandatory)][string]$RecoveryCardPath
  )

  Add-Type -AssemblyName System.Security.Cryptography.ProtectedData
  $entropy = [Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes('TEFFEIN production backup key v1'))
  $wrapped = [Convert]::FromBase64String((Get-Content -LiteralPath $WindowsKeyPath -Raw).Trim())
  $secret = [Security.Cryptography.ProtectedData]::Unprotect(
    $wrapped,
    $entropy,
    [Security.Cryptography.DataProtectionScope]::CurrentUser
  )
  $recoveryBytes = [byte[]]::new(32)
  [Security.Cryptography.RandomNumberGenerator]::Fill($recoveryBytes)
  $recoveryCode = ([Convert]::ToHexString($recoveryBytes).ToLowerInvariant() -split '(.{8})' | Where-Object { $_ }) -join '-'
  $salt = [byte[]]::new(16); [Security.Cryptography.RandomNumberGenerator]::Fill($salt)
  $iv = [byte[]]::new(16); [Security.Cryptography.RandomNumberGenerator]::Fill($iv)
  $keys = Get-TeffeinKeys $recoveryCode $salt $script:Iterations
  $aes = [Security.Cryptography.Aes]::Create()
  try {
    $aes.KeySize = 256
    $aes.Mode = [Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [Security.Cryptography.PaddingMode]::PKCS7
    $aes.Key = $keys.Encryption
    $aes.IV = $iv
    $encryptor = $aes.CreateEncryptor()
    try { $cipher = $encryptor.TransformFinalBlock($secret, 0, $secret.Length) }
    finally { $encryptor.Dispose() }

    $memory = [IO.MemoryStream]::new()
    try {
      $memory.Write($script:PortableMagic, 0, $script:PortableMagic.Length)
      foreach ($number in @([int]1, [int]$script:Iterations)) {
        $bytes = [BitConverter]::GetBytes($number)
        $memory.Write($bytes, 0, $bytes.Length)
      }
      $memory.Write($salt, 0, $salt.Length)
      $memory.Write($iv, 0, $iv.Length)
      $memory.Write($cipher, 0, $cipher.Length)
      $authenticated = $memory.ToArray()
    } finally { $memory.Dispose() }

    $hmac = [Security.Cryptography.HMACSHA256]::new($keys.Authentication)
    try { $tag = $hmac.ComputeHash($authenticated) } finally { $hmac.Dispose() }
    $output = [byte[]]::new($authenticated.Length + $tag.Length)
    [Array]::Copy($authenticated, 0, $output, 0, $authenticated.Length)
    [Array]::Copy($tag, 0, $output, $authenticated.Length, $tag.Length)
    [IO.File]::WriteAllBytes($PortableKeyPath, $output)

    @"
THALIMITRA PORTABLE RECOVERY CARD

RECOVERY-CODE: $recoveryCode

This code unlocks the portable key stored with the encrypted Thalimitra backup.
Keep this card separate from OneDrive. Print it or save it in a trusted password manager.
Never send this code in chat, email, Notion, or GitHub.
"@ | Set-Content -LiteralPath $RecoveryCardPath -Encoding utf8NoBOM
  } finally {
    $aes.Dispose()
    [Security.Cryptography.CryptographicOperations]::ZeroMemory($secret)
    [Security.Cryptography.CryptographicOperations]::ZeroMemory($recoveryBytes)
    $recoveryCode = $null
  }
}

function Get-TeffeinPortablePassphrase {
  param(
    [Parameter(Mandatory)][string]$PortableKeyPath,
    [Parameter(Mandatory)][Security.SecureString]$RecoveryCode
  )

  $code = Get-PlainText $RecoveryCode
  $all = [IO.File]::ReadAllBytes($PortableKeyPath)
  $minimum = $script:PortableMagic.Length + 4 + 4 + 16 + 16 + 16 + 32
  if ($all.Length -lt $minimum) { throw 'Portable recovery key is incomplete.' }
  $authenticatedLength = $all.Length - 32
  [byte[]]$expectedTag = $all[$authenticatedLength..($all.Length - 1)]
  $offset = 0
  [byte[]]$magic = $all[$offset..($offset + $script:PortableMagic.Length - 1)]; $offset += $script:PortableMagic.Length
  if (-not [Security.Cryptography.CryptographicOperations]::FixedTimeEquals($magic, $script:PortableMagic)) {
    throw 'Not a compatible Thalimitra portable recovery key.'
  }
  $version = [BitConverter]::ToInt32($all, $offset); $offset += 4
  if ($version -ne 1) { throw 'Unsupported portable recovery key version.' }
  $iterations = [BitConverter]::ToInt32($all, $offset); $offset += 4
  [byte[]]$salt = $all[$offset..($offset + 15)]; $offset += 16
  [byte[]]$iv = $all[$offset..($offset + 15)]; $offset += 16
  [byte[]]$cipher = $all[$offset..($authenticatedLength - 1)]
  $keys = Get-TeffeinKeys $code $salt $iterations
  $hmac = [Security.Cryptography.HMACSHA256]::new($keys.Authentication)
  try { $actualTag = $hmac.ComputeHash($all, 0, $authenticatedLength) } finally { $hmac.Dispose() }
  if (-not [Security.Cryptography.CryptographicOperations]::FixedTimeEquals($actualTag, $expectedTag)) {
    throw 'Portable recovery authentication failed. The recovery code is wrong or the key file changed.'
  }

  $aes = [Security.Cryptography.Aes]::Create()
  try {
    $aes.KeySize = 256
    $aes.Mode = [Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [Security.Cryptography.PaddingMode]::PKCS7
    $aes.Key = $keys.Encryption
    $aes.IV = $iv
    $decryptor = $aes.CreateDecryptor()
    try { $secret = $decryptor.TransformFinalBlock($cipher, 0, $cipher.Length) }
    finally { $decryptor.Dispose() }
    try { ConvertTo-SecureString ([Convert]::ToBase64String($secret)) -AsPlainText -Force }
    finally { [Security.Cryptography.CryptographicOperations]::ZeroMemory($secret) }
  } finally {
    $aes.Dispose()
    $code = $null
  }
}

function Protect-TeffeinFile {
  param(
    [Parameter(Mandatory)][string]$InputPath,
    [Parameter(Mandatory)][string]$OutputPath,
    [Parameter(Mandatory)][Security.SecureString]$Passphrase
  )

  $plain = Get-PlainText $Passphrase
  $salt = [byte[]]::new(16)
  $iv = [byte[]]::new(16)
  [Security.Cryptography.RandomNumberGenerator]::Fill($salt)
  [Security.Cryptography.RandomNumberGenerator]::Fill($iv)
  $keys = Get-TeffeinKeys $plain $salt $script:Iterations
  $partial = "$OutputPath.partial"

  try {
    $aes = [Security.Cryptography.Aes]::Create()
    $aes.KeySize = 256
    $aes.Mode = [Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [Security.Cryptography.PaddingMode]::PKCS7
    $aes.Key = $keys.Encryption
    $aes.IV = $iv

    $out = [IO.File]::Create($partial)
    try {
      $out.Write($script:Magic, 0, $script:Magic.Length)
      $version = [BitConverter]::GetBytes([int]1)
      $rounds = [BitConverter]::GetBytes([int]$script:Iterations)
      $out.Write($version, 0, $version.Length)
      $out.Write($rounds, 0, $rounds.Length)
      $out.Write($salt, 0, $salt.Length)
      $out.Write($iv, 0, $iv.Length)
      $encryptor = $aes.CreateEncryptor()
      $crypto = [Security.Cryptography.CryptoStream]::new($out, $encryptor, [Security.Cryptography.CryptoStreamMode]::Write, $true)
      try {
        $input = [IO.File]::OpenRead($InputPath)
        try { $input.CopyTo($crypto) } finally { $input.Dispose() }
        $crypto.FlushFinalBlock()
      } finally {
        $crypto.Dispose()
        $encryptor.Dispose()
      }
    } finally {
      $out.Dispose()
      $aes.Dispose()
    }

    $hmac = [Security.Cryptography.HMACSHA256]::new($keys.Authentication)
    try {
      $read = [IO.File]::OpenRead($partial)
      try { $tag = $hmac.ComputeHash($read) } finally { $read.Dispose() }
    } finally { $hmac.Dispose() }
    $append = [IO.File]::Open($partial, [IO.FileMode]::Append, [IO.FileAccess]::Write)
    try { $append.Write($tag, 0, $tag.Length) } finally { $append.Dispose() }
    Move-Item -LiteralPath $partial -Destination $OutputPath -Force
  } finally {
    $plain = $null
    if (Test-Path -LiteralPath $partial) { Remove-Item -LiteralPath $partial -Force }
  }
}

function Unprotect-TeffeinFile {
  param(
    [Parameter(Mandatory)][string]$InputPath,
    [Parameter(Mandatory)][string]$OutputPath,
    [Parameter(Mandatory)][Security.SecureString]$Passphrase
  )

  $plain = Get-PlainText $Passphrase
  $cipherTemp = "$OutputPath.cipher.partial"
  $outputTemp = "$OutputPath.partial"
  $input = [IO.File]::OpenRead($InputPath)
  try {
    $magic = [byte[]]::new($script:Magic.Length)
    if ($input.Read($magic, 0, $magic.Length) -ne $magic.Length -or
        -not [Security.Cryptography.CryptographicOperations]::FixedTimeEquals($magic, $script:Magic)) {
      throw 'Not a compatible Thalimitra encrypted backup.'
    }
    $intBytes = [byte[]]::new(4)
    [void]$input.Read($intBytes, 0, 4)
    if ([BitConverter]::ToInt32($intBytes, 0) -ne 1) { throw 'Unsupported backup format version.' }
    [void]$input.Read($intBytes, 0, 4)
    $iterations = [BitConverter]::ToInt32($intBytes, 0)
    $salt = [byte[]]::new(16); [void]$input.Read($salt, 0, 16)
    $iv = [byte[]]::new(16); [void]$input.Read($iv, 0, 16)
    $headerLength = $input.Position
    $cipherLength = $input.Length - $headerLength - 32
    if ($cipherLength -le 0) { throw 'Encrypted backup is incomplete.' }
    $input.Position = $input.Length - 32
    $expectedTag = [byte[]]::new(32); [void]$input.Read($expectedTag, 0, 32)
    $keys = Get-TeffeinKeys $plain $salt $iterations

    $input.Position = 0
    $hmac = [Security.Cryptography.HMACSHA256]::new($keys.Authentication)
    try {
      $remaining = $input.Length - 32
      $buffer = [byte[]]::new(1048576)
      while ($remaining -gt 0) {
        $take = [Math]::Min($buffer.Length, $remaining)
        $read = $input.Read($buffer, 0, $take)
        if ($read -le 0) { throw 'Encrypted backup ended unexpectedly.' }
        [void]$hmac.TransformBlock($buffer, 0, $read, $null, 0)
        $remaining -= $read
      }
      [void]$hmac.TransformFinalBlock([byte[]]::new(0), 0, 0)
      if (-not [Security.Cryptography.CryptographicOperations]::FixedTimeEquals($hmac.Hash, $expectedTag)) {
        throw 'Backup authentication failed. The passphrase is wrong or the file was changed.'
      }
    } finally { $hmac.Dispose() }

    $input.Position = $headerLength
    $cipherOut = [IO.File]::Create($cipherTemp)
    try {
      $remaining = $cipherLength
      $buffer = [byte[]]::new(1048576)
      while ($remaining -gt 0) {
        $take = [Math]::Min($buffer.Length, $remaining)
        $read = $input.Read($buffer, 0, $take)
        if ($read -le 0) { throw 'Encrypted backup ended unexpectedly.' }
        $cipherOut.Write($buffer, 0, $read)
        $remaining -= $read
      }
    } finally { $cipherOut.Dispose() }

    $aes = [Security.Cryptography.Aes]::Create()
    $aes.KeySize = 256
    $aes.Mode = [Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [Security.Cryptography.PaddingMode]::PKCS7
    $aes.Key = $keys.Encryption
    $aes.IV = $iv
    try {
      $encrypted = [IO.File]::OpenRead($cipherTemp)
      $plainOut = [IO.File]::Create($outputTemp)
      $decryptor = $aes.CreateDecryptor()
      $crypto = [Security.Cryptography.CryptoStream]::new($encrypted, $decryptor, [Security.Cryptography.CryptoStreamMode]::Read)
      try { $crypto.CopyTo($plainOut) }
      finally { $crypto.Dispose(); $decryptor.Dispose(); $plainOut.Dispose(); $encrypted.Dispose() }
    } finally { $aes.Dispose() }
    Move-Item -LiteralPath $outputTemp -Destination $OutputPath -Force
  } finally {
    $input.Dispose()
    $plain = $null
    foreach ($path in @($cipherTemp, $outputTemp)) {
      if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Force }
    }
  }
}

Export-ModuleMember -Function Protect-TeffeinFile,Unprotect-TeffeinFile,Get-TeffeinWindowsProtectedPassphrase,Export-TeffeinPortableRecovery,Get-TeffeinPortablePassphrase
