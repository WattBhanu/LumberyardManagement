@echo off
echo ========================================
echo COMPLETE MAVEN CLEAN FOR LUMBERYARD
echo ========================================
echo.

echo Step 1: Stopping all Java processes...
taskkill /F /IM java.exe 2>nul
if %errorlevel% equ 0 (
    echo Java processes stopped
) else (
    echo No Java processes running
)
echo.

echo Step 2: Deleting target directory...
cd /d "%~dp0"
rmdir /s /q target 2>nul
if exist target (
    echo ERROR: Could not delete target directory
) else (
    echo Target directory deleted
)
echo.

echo Step 3: Deleting Maven cache for this project...
del /q /f pom.xml.tag 2>nul
del /q /f dependency-reduced-pom.xml 2>nul
echo.

echo Step 4: Running Maven clean with force update...
call mvn clean compile -U -e
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo You can now run: mvn spring-boot:run
) else (
    echo.
    echo ========================================
    echo BUILD FAILED - Check errors above
    echo ========================================
)
echo.
pause
