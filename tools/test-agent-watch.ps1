param(
  [int]$IntervalSeconds = 10
)

$ErrorActionPreference = "Continue"
$repo = Split-Path -Parent $PSScriptRoot
$runner = Join-Path $PSScriptRoot "test-agent.ps1"
$lastSignature = ""

Write-Output "Test Agent watcher läuft. Prüfe Änderungen alle $IntervalSeconds Sekunden."
while ($true) {
  $files = Get-ChildItem -LiteralPath (Join-Path $repo "src") -Recurse -File | Sort-Object FullName
  $signature = ($files | ForEach-Object { "$($_.FullName):$($_.LastWriteTimeUtc.Ticks):$($_.Length)" }) -join "|"
  if ($lastSignature -and $signature -ne $lastSignature) { & powershell -ExecutionPolicy Bypass -File $runner }
  $lastSignature = $signature
  Start-Sleep -Seconds $IntervalSeconds
}
