Clear-Host
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " 🕵️‍♂️ EL CHISMOSO FORENSE :: AUDITOR DE CALIDAD DE CÓDIGO GO" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

$ErrorActionPreference = "SilentlyContinue"
$global:hasErrors = $false

function Invoke-GoTool {
    param(
        [string]$Name,
        [string]$Command,
        [string[]]$Arguments
    )

    Write-Host "`n[*] Ejecutando: $Name..." -ForegroundColor Yellow
    & $Command $Arguments
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[-] Fallo en: $Name" -ForegroundColor Red
        $global:hasErrors = $true
    } else {
        Write-Host "[+] Éxito en: $Name" -ForegroundColor Green
    }
}

# 1. Formato del código
Invoke-GoTool -Name "Formato (gofmt)" -Command "gofmt" -Arguments "-l", "."

# 2. Análisis estático (vet)
Invoke-GoTool -Name "Análisis Estático (go vet)" -Command "go" -Arguments "vet", "./..."

# 3. Ejecución de Pruebas
Invoke-GoTool -Name "Pruebas Unitarias (go test)" -Command "go" -Arguments "test", "./...", "-count=1", "-cover"

Write-Host "`n==========================================================================" -ForegroundColor Cyan
if ($global:hasErrors) {
    Write-Host "🔴 VERDICTO: SE ENCONTRARON PROBLEMAS. Revisa los logs de arriba." -ForegroundColor Red
} else {
    Write-Host "🟢 VERDICTO: ¡TODAS LAS VERIFICACIONES DE CALIDAD PASARON CON ÉXITO!" -ForegroundColor Green
}
Write-Host "==========================================================================" -ForegroundColor Cyan
