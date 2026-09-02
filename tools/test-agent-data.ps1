param([string]$FixturePath = "$PSScriptRoot/test-agent-fixture.json")
$ErrorActionPreference = "Stop"
$fixture = Get-Content -Raw -LiteralPath $FixturePath | ConvertFrom-Json
if ($fixture.personalDetails.email -notlike "*.invalid") { throw "Fixture must use a non-deliverable email" }
foreach ($fact in $fixture.expectedFacts) { if ($fixture.workExperience[0].rawText -notlike "*$fact*") { throw "Expected fact missing from raw fixture: $fact" } }
if ($fixture.workExperience[0].startDate -ge $fixture.workExperience[0].endDate) { throw "Invalid fixture date range" }
Write-Output "Synthetic Testdaten OK: $($fixture.personalDetails.fullName)"
