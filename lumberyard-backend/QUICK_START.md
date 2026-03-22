# Quick Start Guide - Lumberyard Backend

## 🚀 Run the Application

```powershell
cd C:\Users\Praveen\Downloads\LumberyardManagement-feature-ProductionProcessManagement\LumberyardManagement-feature-ProductionProcessManagement\lumberyard-backend
./mvnw clean spring-boot:run
```

**Server will start on:** `http://localhost:8080`

---

## 🔑 Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@example.com",
    "password": "admin123"
  }'
```

**Save the token from response!**

---

## ✅ Test Worker Update (PUT Request)

```bash
# Replace YOUR_TOKEN_HERE with actual token from login
curl -X PUT http://localhost:8080/api/workers/update/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Updated Worker Name",
    "email": "updated@example.com",
    "phone": "9999999999",
    "position": "Manager",
    "department": "Production",
    "hourlyRate": 30.0,
    "status": "ACTIVE"
  }'
```

---

## 📋 All Endpoints by Role

### ADMIN (All Access)
✅ Can access ALL endpoints

### LABOR_MANAGER
✅ `/api/labor/**` - Labor dashboard and operations
✅ `/api/workers/**` - Worker management (CRUD)

### INVENTORY_OPERATIONS_MANAGER
✅ `/api/inventory/**` - Inventory dashboard
✅ `/api/timber/**` - Timber management
✅ `/api/logs/**` - Logs management
✅ `/api/chemical/**` - Chemical management
✅ `/api/production/**` - Production management

### FINANCE_MANAGER
✅ `/api/finance/**` - Finance dashboard

---

## 🎯 Common Operations

### Get All Workers
```bash
curl http://localhost:8080/api/workers/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Worker
```bash
curl -X POST http://localhost:8080/api/workers/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "New Worker",
    "email": "worker@example.com",
    "phone": "1234567890",
    "position": "Carpenter",
    "department": "Production",
    "hourlyRate": 20.0,
    "status": "ACTIVE"
  }'
```

### Delete Worker
```bash
curl -X DELETE http://localhost:8080/api/workers/delete/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Worker by ID
```bash
curl http://localhost:8080/api/workers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Debug Tips

### If you get "Access denied":
1. Check if token is valid and not expired
2. Verify user has correct role
3. Token format: `Authorization: Bearer <token>`

### If you get "PUT not supported":
1. Check HTTP method is PUT (not POST or GET)
2. URL should be: `/api/workers/update/{id}`
3. Content-Type header must be: `application/json`

### If you get compilation error:
```bash
# Check Java version
java -version

# Should be Java 21
# If not, set JAVA_HOME:
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
```

---

## 📝 What Was Fixed

✅ **WorkerController** - Added security to all endpoints including PUT /update/{id}
✅ **LaborController** - Added security to dashboard endpoint
✅ **InventoryController** - Added security to dashboard endpoint  
✅ **FinanceController** - Added security to dashboard endpoint
✅ **UserController** - Added security to register and getAll endpoints

**All controllers now have proper @PreAuthorize annotations!**

---

## 🎉 Success Indicators

After running, you should see:
```
Started LumberyardBackend in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

Then test:
1. ✅ Login returns token
2. ✅ PUT request updates worker successfully
3. ✅ No "Access denied" errors for ADMIN users
4. ✅ All CRUD operations work correctly

---

For detailed information, see: **FIXES_SUMMARY.md**
