param(
  [int]$MaxAttempts = 3
)

$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo
$report = Join-Path $repo "test-agent-report.txt"
$nodeExe = "C:\Users\bakr1\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$viteCli = Join-Path $repo "node_modules\vite\bin\vite.js"
$eslintCli = Join-Path $repo "node_modules\eslint\bin\eslint.js"
$success = $false

for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
  "Test Agent attempt $attempt/$MaxAttempts - $(Get-Date -Format o)" | Set-Content -LiteralPath $report
  try {
    & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "test-agent-data.ps1") *>> $report
    if (-not (Test-Path -LiteralPath $nodeExe)) { throw "Gebündeltes Node.js nicht gefunden: $nodeExe" }
    if (-not (Test-Path -LiteralPath $viteCli)) { throw "Vite nicht installiert: $viteCli" }
    if (-not (Test-Path -LiteralPath $eslintCli)) { throw "ESLint nicht installiert: $eslintCli" }
    & $nodeExe $eslintCli . 2>&1 | Tee-Object -FilePath $report -Append
    $lintExit = $LASTEXITCODE
    if ($lintExit -ne 0) { "LINT_WARN: ESLint/Prettier meldet $lintExit (Build wird trotzdem geprüft)." | Add-Content -LiteralPath $report }
    $previousErrorAction = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & $nodeExe $viteCli build 2>&1 | Tee-Object -FilePath $report -Append
    $ErrorActionPreference = $previousErrorAction
    if ($LASTEXITCODE -ne 0) { throw "Vite build fehlgeschlagen (Exit $LASTEXITCODE)" }
    if (Test-Path -LiteralPath (Join-Path $repo ".git")) { git diff --check *>> $report }
    $success = $true
    "PASS" | Add-Content -LiteralPath $report
    break
  } catch {
    "FAIL: $($_.Exception.Message)" | Add-Content -LiteralPath $report
    if ($attempt -lt $MaxAttempts) { Start-Sleep -Seconds 2 }
  }
}

if (-not $success) { Write-Error "Test Agent failed after $MaxAttempts attempts. See $report"; exit 1 }
Write-Output "Test Agent passed. Report: $report"
