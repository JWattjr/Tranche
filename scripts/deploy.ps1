param([string]$Step='probe-deploy')
$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$env:TRANCHE_STEP=$Step
$generated=Join-Path (Get-Location) 'deploy\deployScript.compiled.js'
try {
  genlayer deploy
  if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
} finally {
  if(Test-Path -LiteralPath $generated){Remove-Item -LiteralPath $generated}
}
