# 🔧 "Failed to Create Job" - Troubleshooting Guide

## 🚨 Most Likely Cause: Backend Not Running or Not Compiled

The error "Failed to create job" and "Failed to load jobs" means the frontend can't reach the backend API.

---

## ✅ Step-by-Step Fix:

### Step 1: Check if Backend is Running

Open browser and go to:
```
http://localhost:8080/api/jobs
```

**If you see:**
- `{"error":"Unauthorized","message":"...}` → ✅ Backend is running! (Authentication issue)
- Browser shows "This site can't be reached" → ❌ Backend is NOT running

---

### Step 2: Restart Backend with Clean Build

Since we added new JobAssignment entities, we need to recompile:

#### In PowerShell (Run as Administrator if needed):

```powershell
# Navigate to backend directory
cd C:\Users\Dinuga\untitled\LumberyardManagement\lumberyard-backend

# Stop current backend (Ctrl+C if running in terminal)

# Clean and rebuild
mvn clean package -DskipTests

# Run the application
mvn spring-boot:run
```

Wait for message: `Started LumberyardBackendApplication in X seconds`

---

### Step 3: Verify Database Tables Created

After backend starts, check MySQL:

```sql
USE lumberyard_db;

-- Check if job tables exist
SHOW TABLES LIKE '%job%';

-- Should see:
-- job_assignments
-- job_worker_assignments
```

If tables don't exist, add this to `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=update
```

Then restart backend.

---

### Step 4: Test API Directly

With backend running, test in browser:

1. **First login** at `http://localhost:8080/api/auth/login` (using Postman/curl)
   ```json
   {
     "username": "admin@lumberyard.com",
     "password": "password"
   }
   ```

2. **Then test jobs endpoint** with the JWT token:
   ```
   GET http://localhost:8080/api/jobs
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

Or use Postman to test the full flow.

---

## 🐛 Common Issues:

### Issue 1: Compilation Errors

**Symptom**: Backend won't start  
**Solution**: 
```bash
cd C:\Users\Dinuga\untitled\LumberyardManagement\lumberyard-backend
mvn clean compile
```

Check for errors in output. If you see:
- `cannot find symbol` → Missing imports or Lombok issue
- `package does not exist` → Dependency issue

---

### Issue 2: Port Already in Use

**Symptom**: Backend fails to start with "Port 8080 already in use"  
**Solution**:
```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

Then restart backend.

---

### Issue 3: Database Connection Failed

**Symptom**: Backend starts but can't connect to database  
**Solution**: Check `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lumberyard_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

Make sure MySQL is running and password is correct.

---

### Issue 4: CORS Error in Browser Console

**Symptom**: Frontend can't reach backend due to CORS  
**Solution**: Backend should have this in controller:

```java
@CrossOrigin(origins = "*")
```

Already present in JobAssignmentController.java line 22.

---

## 🔍 Debug Checklist:

Run through these checks:

- [ ] Backend compiles without errors (`mvn clean compile`)
- [ ] MySQL database exists (`lumberyard_db`)
- [ ] Backend starts successfully (look for "Started ... Application")
- [ ] Can access `http://localhost:8080/actuator/health` (returns `{"status":"UP"}`)
- [ ] Frontend is running on `http://localhost:3000`
- [ ] Logged in with valid user (ADMIN or LABOR_MANAGER role)
- [ ] Browser console shows no CORS errors

---

## 📝 What Should Happen:

### When Everything Works:

1. **Backend Starts**:
   ```
   .   ____          _            __ _ _
  /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
 ( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
  \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
   '  |____| .__|_| |_|_| |_\__, | / / / /
   =========|_|==============|___/=/_/_/_/
   
   Started LumberyardBackendApplication in 5.123s
   ```

2. **Create Job Flow**:
   ```
   Click "New Job"
        ↓
   Modal opens
        ↓
   Fill form + Submit
        ↓
   POST http://localhost:8080/api/jobs
        ↓
   Backend returns: 201 Created
   Response: { jobId: "JOB001", jobName: "...", ... }
        ↓
   Success message in UI
        ↓
   Job appears in table
   ```

3. **Load Jobs Flow**:
   ```
   Page loads
        ↓
   GET http://localhost:8080/api/jobs
        ↓
   Backend returns: 200 OK
   Response: [{...}, {...}]
        ↓
   Table displays jobs
   ```

---

## 💡 Quick Test:

If backend is running, this curl command should work:

```bash
# First get token
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin@lumberyard.com\",\"password\":\"password\"}"

# Then use the token to get jobs
curl http://localhost:8080/api/jobs ^
  -H "Authorization: Bearer YOUR_TOKEN_FROM_LOGIN"
```

Should return: `[]` (empty array if no jobs) or `[...]` (array of jobs)

---

## 🎯 Next Steps:

1. **Stop backend** (Ctrl+C)
2. **Rebuild**: `mvn clean package -DskipTests`
3. **Restart**: `mvn spring-boot:run`
4. **Wait** for "Started ... Application" message
5. **Try creating job again** from frontend

If still failing, share:
- Backend startup logs
- Browser console errors (F12 → Console tab)
- Any error messages from backend terminal

This will help diagnose further!
