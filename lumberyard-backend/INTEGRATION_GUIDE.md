# 🚀 Quick Integration Guide - Attendance Tracking

## Step-by-Step Integration

### Backend Integration (5 minutes)

#### 1. Files Already Created ✅
All backend files are ready in the correct locations:
```
✅ entity/Attendance.java
✅ repository/AttendanceRepository.java
✅ service/AttendanceService.java
✅ controller/AttendanceController.java
✅ security/SecurityConfig.java (updated)
```

#### 2. Verify Compilation
```bash
cd lumberyard-backend
./mvnw clean compile
```

**Expected:** No errors, all classes compiled successfully

#### 3. Update Database Schema
Spring Data JPA will auto-create the `attendance` table when you run the application.

If you need manual creation:
```sql
CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_id BIGINT NOT NULL,
    date DATE NOT NULL,
    is_present BOOLEAN NOT NULL,
    hours_worked DOUBLE NOT NULL,
    daily_wage DOUBLE NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY unique_worker_date (worker_id, date),
    FOREIGN KEY (worker_id) REFERENCES users(user_id)
);
```

#### 4. Run Backend
```bash
./mvnw spring-boot:run
```

**Expected Output:**
```
Started LumberyardBackend in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

---

### Frontend Integration (10 minutes)

#### 1. Files Already Created ✅
```
✅ pages/AttendancePage.js
✅ pages/AttendancePage.css
✅ services/attendanceService.js
✅ services/workerService.js
```

#### 2. Add Route to App.js

Open: `lumberyard-frontend/src/App.js` or `App.jsx`

Add import:
```javascript
import AttendancePage from './pages/AttendancePage';
```

Add route inside `<Routes>`:
```jsx
<Route path="/attendance" element={<AttendancePage />} />
```

**Example:**
```jsx
<Routes>
  {/* Existing routes */}
  <Route path="/" element={<Dashboard />} />
  <Route path="/workers" element={<WorkerPage />} />
  
  {/* NEW: Attendance route */}
  <Route path="/attendance" element={<AttendancePage />} />
</Routes>
```

#### 3. Add Navigation Link

Add to your sidebar/menu component:

```jsx
<nav>
  {/* Existing menu items */}
  <a href="/dashboard">Dashboard</a>
  <a href="/workers">Workers</a>
  
  {/* NEW: Attendance link */}
  <a href="/attendance">Attendance Tracking</a>
</nav>
```

Or if using React Router's `Link`:
```jsx
<Link to="/attendance">Attendance Tracking</Link>
```

#### 4. Install Dependencies (if needed)
```bash
cd lumberyard-frontend
npm install
```

#### 5. Start Frontend
```bash
npm start
```

**Expected:** Application opens at `http://localhost:3000`

---

## 🧪 Testing the Integration

### Test 1: Access Attendance Page
1. Open browser: `http://localhost:3000/attendance`
2. Should see: "Attendance Tracking & Salary Management" header
3. Three tabs visible: Record, View, Salary Reports

### Test 2: Record Attendance
1. Login as ADMIN or LABOR_MANAGER
2. Go to **Record Attendance** tab
3. Select a worker
4. Choose today's date
5. Mark as Present
6. Enter hours: 8
7. Click **Record Attendance**
8. **Expected:** Success message appears

### Test 3: Prevent Duplicate
1. Try recording again for same worker and date
2. **Expected:** Error: "Attendance already recorded for this worker on this date!"

### Test 4: View Attendance
1. Go to **View Attendance** tab
2. Select today's date
3. Click **Load Attendance**
4. **Expected:** Table shows the record you just created

### Test 5: Generate Salary Report
1. Go to **Salary Reports** tab
2. Select current year and month
3. Click **Generate Report**
4. **Expected:** Table shows salary calculations for all workers

---

## 🔐 User Roles Required

### To Access Features:

| Feature | Required Role |
|---------|--------------|
| Record Attendance | ADMIN or LABOR_MANAGER |
| View Attendance | ADMIN or LABOR_MANAGER |
| Generate Salary Reports | ADMIN, LABOR_MANAGER, or FINANCE_MANAGER |

### Create Test Users (if needed):

```sql
-- Insert test user with LABOR_MANAGER role
INSERT INTO users (name, email, password, role, phone, status) 
VALUES ('Test Labor Manager', 'labor@test.com', '$2a$10$...', 'LABOR_MANAGER', '+1234567890', true);
```

**Note:** Password must be BCrypt encoded

---

## 📊 API Endpoints Available

Base URL: `http://localhost:8080/api/attendance`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/record` | POST | Record new attendance |
| `/update/{id}` | PUT | Update existing record |
| `/date?date=YYYY-MM-DD` | GET | Get by specific date |
| `/today` | GET | Get today's attendance |
| `/worker/{id}/range` | GET | Worker's attendance in date range |
| `/salary/worker/{id}` | GET | Monthly salary for worker |
| `/salary/all` | GET | All salary reports |
| `/worker/{id}/history` | GET | Complete history |

**Headers Required:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## 🎨 UI Customization

### Change Theme Colors

Edit: `AttendancePage.css`

Find and replace these colors:
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Button color */
background: #667eea;

/* Hover color */
background: #5568d3;
```

Replace with your brand colors.

### Modify Wage Rate

Edit: `AttendanceService.java`

Find line:
```java
private static final double DAILY_WAGE_RATE = 8000.0; // Rs. 8000 per day
```

Change to your rate:
```java
private static final double DAILY_WAGE_RATE = 10000.0; // New rate
```

Update frontend label in `AttendancePage.js`:
```jsx
<li>Daily wage rate: Rs. 10,000</li>
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Page Not Found (404)
**Cause:** Route not added to App.js  
**Solution:** Add `<Route path="/attendance" element={<AttendancePage />} />`

### Issue 2: Cannot Record Attendance
**Cause:** Missing JWT token or wrong role  
**Solution:** Login as ADMIN or LABOR_MANAGER, ensure token is in localStorage

### Issue 3: Workers Dropdown Empty
**Cause:** Worker service error or no workers in database  
**Solution:** Check console logs, ensure workers exist

### Issue 4: Duplicate Entry Error
**Cause:** Trying to record twice for same date  
**Solution:** Use update instead of create, or delete existing record first

### Issue 5: Salary Shows Zero
**Cause:** Worker has no hourly rate set  
**Solution:** System defaults to Rs. 8,000/day, or update worker's hourlyRate field

---

## 📁 Project Structure After Integration

```
lumberyard-backend/
├── src/main/java/com/lumberyard_backend/
│   ├── entity/
│   │   ├── Attendance.java ✅ NEW
│   │   └── ... other entities
│   ├── repository/
│   │   ├── AttendanceRepository.java ✅ NEW
│   │   └── ... other repositories
│   ├── service/
│   │   ├── AttendanceService.java ✅ NEW
│   │   └── ... other services
│   ├── controller/
│   │   ├── AttendanceController.java ✅ NEW
│   │   └── ... other controllers
│   └── security/
│       └── SecurityConfig.java ✅ UPDATED

lumberyard-frontend/
├── src/
│   ├── pages/
│   │   ├── AttendancePage.js ✅ NEW
│   │   ├── AttendancePage.css ✅ NEW
│   │   └── ... other pages
│   └── services/
│       ├── attendanceService.js ✅ NEW
│       ├── workerService.js ✅ NEW
│       └── ... other services
```

---

## ✅ Integration Checklist

### Backend
- [ ] Files compiled without errors
- [ ] Database table created (auto or manual)
- [ ] Application starts successfully
- [ ] Can access Swagger/API docs
- [ ] Test endpoint with Postman/curl

### Frontend
- [ ] Route added to App.js
- [ ] Navigation link added
- [ ] Page loads without errors
- [ ] Can see three tabs
- [ ] Workers dropdown populated
- [ ] Can record attendance
- [ ] Can view attendance
- [ ] Can generate salary reports

---

## 🎉 Success Indicators

You've successfully integrated when:

✅ Backend runs on `http://localhost:8080`  
✅ Frontend runs on `http://localhost:3000`  
✅ Attendance page accessible at `/attendance`  
✅ Can record attendance without errors  
✅ Duplicate prevention works  
✅ Salary reports generate correctly  
✅ No console errors in browser  

---

## 📞 Need Help?

### Debugging Steps:
1. **Check Console Logs** - Both browser and server
2. **Verify Token** - Ensure JWT token present in localStorage
3. **Test API Directly** - Use Postman or curl
4. **Check Database** - Verify data is being saved
5. **Review Network Tab** - See actual HTTP requests/responses

### Quick Health Check:
```bash
# Test backend health
curl http://localhost:8080/api/users/test

# Should return: "Backend is running and accessible!"
```

---

## 🚀 Next Steps

After successful integration:

1. **Test thoroughly** with different scenarios
2. **Customize UI** to match your brand
3. **Add to production** deployment pipeline
4. **Train users** on how to use the feature
5. **Monitor usage** and gather feedback
6. **Plan enhancements** based on user needs

---

## 📚 Additional Resources

- **Full Documentation:** `ATTENDANCE_TRACKING_README.md`
- **API Documentation:** Test endpoints via Swagger UI at `/swagger-ui.html` (if enabled)
- **Code Examples:** See controller methods for request/response formats

---

**Congratulations!** Your Attendance Tracking system is ready to use! 🎊
