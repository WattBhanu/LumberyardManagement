@echo off
cd /d "%~dp0"
echo Building Lumberyard Backend...
mvn clean install -DskipTests
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Starting Spring Boot Application...
    mvn spring-boot:run
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo Please check the errors above.
    pause
)
