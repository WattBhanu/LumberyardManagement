# Build and Run Script for Lumberyard Backend
# Copy this entire script and paste it into PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Lumberyard Backend Build & Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = "C:\Users\Dinuga\untitled\LumberyardManagement\lumberyard-backend"

Write-Host "Navigating to: $backendPath" -ForegroundColor Yellow
Set-Location $backendPath

Write-Host "`nCleaning previous build..." -ForegroundColor Yellow
mvn clean

Write-Host "`nCompiling and building project..." -ForegroundColor Yellow
mvn install -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting Spring Boot Application..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
    Write-Host ""
    mvn spring-boot:run
} else {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Missing dependencies" -ForegroundColor Yellow
    Write-Host "  - Java version mismatch (need Java 21)" -ForegroundColor Yellow
    Write-Host "  - Code compilation errors" -ForegroundColor Yellow
    Write-Host ""
    pause
}
