Set-StrictMode -Version Latest

$script:Magic = [Text.Encoding]::ASCII.GetBytes('TEFFEINBKP1')
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
      throw 'Not a TEFFEIN encrypted backup.'
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

Export-ModuleMember -Function Protect-TeffeinFile,Unprotect-TeffeinFile,Get-TeffeinWindowsProtectedPassphrase
