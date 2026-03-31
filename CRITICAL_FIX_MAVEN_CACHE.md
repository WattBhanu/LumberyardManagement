# 🚨 CRITICAL BUILD ISSUE - Maven Reading Wrong Directory!

## 🔍 Root Cause Identified:

The compilation error shows:
```
/C:/Users/Praveen/OneDrive/Documents/SCRUM-133/LumberyardManagement/...
```

But you're working in:
```
C:\Users\Dinuga\untitled\LumberyardManagement\...
```

**Maven is reading from a CACHED/SYMLINKED location!**

---

## ✅ SOLUTION - Follow These Steps EXACTLY:

### Option 1: Use the Clean Script (EASIEST)

1. **Double-click this file**:
   ```
   C:\Users\Dinuga\untitled\LumberyardManagement\lumberyard-backend\clean-build.bat
   ```

2. Wait for it to complete

3. If successful, run:
   ```powershell
   mvn spring-boot:run
   ```

---

### Option 2: Manual Nuclear Clean

#### Step 1: Close EVERYTHING
- Close VS Code
- Close IntelliJ/Eclipse
- Close all terminal windows
- Close any Java applications

#### Step 2: Kill Java Processes

Open PowerShell as Administrator:
```powershell
taskkill /F /IM java.exe
```

#### Step 3: Navigate to ACTUAL Project Location

```powershell
cd C:\Users\Dinuga\untitled\LumberyardManagement\lumberyard-backend
```

#### Step 4: Verify You're in Right Place

```powershell
# Should show your actual files
dir src\main\java\com\lumberyard_backend\service\AttendanceService.java
```

Check the output path - it MUST say `C:\Users\Dinuga\...` NOT `C:\Users\Praveen\...`

#### Step 5: Delete Target Manually

```powershell
# Force delete
Remove-Item -Recurse -Force target -ErrorAction SilentlyContinue

# Verify deleted
if (Test-Path target) { 
    Write-Host "ERROR: Target still exists!" 
} else { 
    Write-Host "Target deleted successfully" 
}
```

#### Step 6: Check for Symlinks or Junction Points

```powershell
# Check if current directory is a symlink
fsutil reparsepoint query . 2>$null

# If it says "This is not a reparse point" -> GOOD
# If it shows symlink info -> THAT'S THE PROBLEM
```

#### Step 7: Clean Build with Verbose Output

```powershell
# Run with full error details
mvn clean compile -U -e -X 2>&1 | Out-File -FilePath build-log.txt
```

This creates `build-log.txt` with full details.

#### Step 8: Check Build Log

Open `build-log.txt` and search for:
- "Building LumberyardBackend"
- Check the path shown - should be YOUR path, not Praveen's path

---

## 🐛 Why This Happens:

### Possible Causes:

1. **OneDrive Syncing**: OneDrive might be syncing to old location
2. **Maven Settings**: `settings.xml` might have old paths
3. **IDE Cache**: IDE might have cached old project location
4. **Symlink/Junction**: Directory might be symlinked to old location
5. **Environment Variable**: `MAVEN_HOME` or similar pointing elsewhere

---

## 🔍 Diagnostic Commands:

Run these to identify the issue:

```powershell
# 1. Check current directory
pwd

# 2. Check Maven version and config
mvn -version

# 3. Check for symlinks
fsutil reparsepoint query .

# 4. List all Java processes
Get-Process java

# 5. Check Maven local repo
echo $env:USERPROFILE\.m2\repository

# 6. Verify file actually exists at YOUR location
Test-Path "C:\Users\Dinuga\untitled\LumberyardManagement\lumberyard-backend\src\main\java\com\lumberyard_backend\service\AttendanceService.java"
```

---

## 💡 Quick Fixes to Try:

### Fix 1: Clear Maven Cache Completely

```powershell
# Delete entire Maven local repo cache
Remove-Item -Recurse -Force "$env:USERPROFILE\.m2\repository\com\lumberyard" -ErrorAction SilentlyContinue
```

### Fix 2: Update Maven Settings

Check if you have custom Maven settings:
```powershell
# Check for global settings
Test-Path "$env:M2_HOME\conf\settings.xml"

# Check for user settings  
Test-Path "$env:USERPROFILE\.m2\settings.xml"
```

If they exist and contain old paths, update them.

### Fix 3: Re-import Project in IDE

If using VS Code or IntelliJ:
1. Close IDE
2. Delete `.vscode` or `.idea` folders
3. Reopen IDE
4. Re-import/re-open project

### Fix 4: Copy Project to New Location

As last resort:
```powershell
# Copy entire project to completely new location
Copy-Item -Path "C:\Users\Dinuga\untitled\LumberyardManagement" `
          -Destination "C:\Temp\LumberyardManagement-Fresh" -Recurse

# Try building from there
cd C:\Temp\LumberyardManagement-Fresh\lumberyard-backend
mvn clean compile -U
```

---

## ✅ Expected Behavior After Fix:

When you run `mvn clean compile`, you should see:

```
[INFO] Building jar: C:\Users\Dinuga\untitled\LumberyardManagement\lumberyard-backend\target\lumberyard-backend-0.0.1-SNAPSHOT.jar
[INFO] BUILD SUCCESS
```

NOT:
```
[INFO] Building jar: C:\Users\Praveen\OneDrive\Documents\SCRUM-133\...
```

---

## 📝 Next Steps After Successful Build:

```powershell
# 1. Verify compiled classes exist
ls target\classes\com\lumberyard_backend\entity\Worker.class

# 2. Run the application
mvn spring-boot:run

# 3. Test job creation endpoint
# (Use Postman or frontend)
```

---

## 🆘 If STILL Failing:

Share these outputs:

1. **Output of `pwd`** - Shows current directory
2. **First 20 lines of build-log.txt** - Shows what Maven is building
3. **Output of `fsutil reparsepoint query .`** - Shows if symlinked
4. **Full error message** from latest build attempt

The key is ensuring Maven is building from YOUR directory, not a cached/symlinked location!
