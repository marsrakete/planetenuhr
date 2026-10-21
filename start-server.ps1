param(
  [ValidateRange(1, 65535)]
  [int]$Port = 5020,
  [ValidateNotNullOrEmpty()]
  [string]$ListenAddress = "localhost"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://${ListenAddress}:$Port/")
$listener.Start()

Write-Host "Planetenuhr laeuft auf http://localhost:$Port/"
Write-Host "Netzwerkbindung: http://${ListenAddress}:$Port/"
if ($ListenAddress -eq "+" -or $ListenAddress -eq "*") {
  Write-Host "Im Heimnetz: http://<IP-Adresse dieses Rechners>:$Port/"
}
Write-Host "Zum Beenden Strg+C druecken."

$contentTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".svg" = "image/svg+xml"
  ".png" = "image/png"
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = $context.Request.Url.AbsolutePath.TrimStart("/")

    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = "index.html"
    }

    try {
      $safePath = [System.Uri]::UnescapeDataString($requestPath).Replace("/", "\")
      $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $safePath))
    }
    catch {
      $context.Response.StatusCode = 400
      $context.Response.Close()
      continue
    }
    $rootPrefix = $root.TrimEnd("\") + "\"

    # Network clients may read project files, but not parent folders or hidden metadata.
    if (-not $filePath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or
        ($safePath.Split("\") | Where-Object { $_.StartsWith(".") })) {
      $context.Response.StatusCode = 403
      $context.Response.Close()
      continue
    }

    if (-not (Test-Path $filePath -PathType Leaf)) {
      $context.Response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 - Datei nicht gefunden")
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.Close()
      continue
    }

    $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
    $contentType = $contentTypes[$extension]
    if (-not $contentType) {
      $contentType = "application/octet-stream"
    }

    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $context.Response.ContentType = $contentType
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
