# 🏗️ SYSTEM ARCHITECTURE DIAGRAM

## Lumberyard Management System - Attendance & Salary Module

---

## 📊 HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                      (React Frontend)                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Record     │  │    View      │  │   Salary     │         │
│  │ Attendance   │  │ Attendance   │  │   Reports    │         │
│  │    Tab       │  │     Tab      │  │     Tab      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│              AttendancePage.js + attendanceService.js           │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                         │
│                    (Spring Security + JWT)                      │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │          SecurityConfig.java                       │        │
│  │  - Authentication (JWT)                            │        │
│  │  - Authorization (Role-based)                      │        │
│  │  - CORS Configuration                              │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                           │
│                   (REST API Endpoints)                          │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │         AttendanceController.java                  │        │
│  │                                                    │        │
│  │  POST   /api/attendance/record                     │        │
│  │  PUT    /api/attendance/update/{id}                │        │
│  │  GET    /api/attendance/date                       │        │
│  │  GET    /api/attendance/today                      │        │
│  │  GET    /api/attendance/worker/{id}/range          │        │
│  │  GET    /api/attendance/salary/worker/{id}         │        │
│  │  GET    /api/attendance/salary/all                 │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                             │
│                    (Business Logic)                             │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │          AttendanceService.java                    │        │
│  │                                                    │        │
│  │  • recordAttendance()                              │        │
│  │  • updateAttendance()                              │        │
│  │  • getAttendanceByDate()                           │        │
│  │  • calculateMonthlySalary()                        │        │
│  │  • checkDuplicate() ← Business Rule                │        │
│  │  • calculateWage() ← Rs. 8,000/day default         │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      REPOSITORY LAYER                           │
│                    (Data Access)                                │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │       AttendanceRepository.java                    │        │
│  │                                                    │        │
│  │  • findByWorkerIdAndDate()                         │        │
│  │  • findByDate()                                    │        │
│  │  • findByWorkerIdBetweenDates()                    │        │
│  │  • findByMonth()                                   │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                 │
│                      (MySQL/H2)                                 │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐        │
│  │              ATTENDANCE TABLE                      │        │
│  │                                                    │        │
│  │  id (PK)          BIGINT AUTO_INCREMENT            │        │
│  │  worker_id (FK)   BIGINT → users(user_id)          │        │
│  │  date             DATE NOT NULL                    │        │
│  │  is_present       BOOLEAN NOT NULL                 │        │
│  │  hours_worked     DOUBLE DEFAULT 8.0               │        │
│  │  daily_wage       DOUBLE DEFAULT 8000.0            │        │
│  │  status           VARCHAR(50)                      │        │
│  │  notes            VARCHAR(500)                     │        │
│  │  created_at       TIMESTAMP                        │        │
│  │  updated_at       TIMESTAMP                        │        │
│  │                                                    │        │
│  │  UNIQUE (worker_id, date) ← Duplicate Prevention   │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 ATTENDANCE RECORDING FLOW

```
User (Labor Manager/Admin)
    ↓
1. Login → Get JWT Token
    ↓
2. Navigate to Attendance Page
    ↓
3. Fill Record Attendance Form:
   - Select Worker
   - Choose Date
   - Mark Present/Absent
   - Enter Hours
   - Add Notes
    ↓
4. Click "Record Attendance"
    ↓
5. Frontend validates form
    ↓
6. POST /api/attendance/record
   Headers: Authorization: Bearer <TOKEN>
   Body: { workerId, date, isPresent, hoursWorked, notes }
    ↓
7. Spring Security validates JWT token
    ↓
8. AttendanceController.recordAttendance()
    ↓
9. AttendanceService.recordAttendance()
    ├─ Check for duplicate (same worker, same date)
    ├─ If exists → Throw RuntimeException (409 Conflict)
    └─ If not exists → Continue
    ↓
10. Create Attendance Entity
    ↓
11. AttendanceRepository.save()
    ↓
12. Database INSERT with UNIQUE constraint
    ↓
13. Return Success Response (201 Created)
    ↓
14. Display success message to user
```

---

## 💰 SALARY CALCULATION FLOW

```
User (Admin/Labor Manager/Finance Manager)
    ↓
1. Navigate to Salary Reports tab
    ↓
2. Select Year and Month
    ↓
3. Click "Generate Report"
    ↓
4. GET /api/attendance/salary/all?year=2024&month=3
    ↓
5. AttendanceController.getAllSalaryReports()
    ↓
6. AttendanceService.calculateMonthlySalary()
    ├─ Get all workers
    ├─ For each worker:
    │   ├─ Query attendance records for month
    │   ├─ Count present days
    │   ├─ Count absent days
    │   ├─ Sum total hours
    │   ├─ Calculate attendance %
    │   └─ Calculate salary:
    │       • If hourly rate exists: hours × rate
    │       • Else: present days × 8000
    └─ Return list of SalaryReport objects
    ↓
7. Display salary table:
   Worker | Present | Absent | Hours | % | Salary
```

---

## 🔐 SECURITY FLOW

```
┌─────────────────────────────────────────────────────────┐
│           REQUEST INTERCEPTED BY JwtRequestFilter       │
└─────────────────────────────────────────────────────────┘
                        ↓
            Extract JWT from Authorization header
                        ↓
            Validate JWT token signature
                        ↓
            Extract username from token
                        ↓
            Load user via CustomUserDetailsService
                        ↓
            Create Authentication object
                        ↓
            Check @PreAuthorize annotation
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
   Has required role?              No required role?
        ↓                               ↓
   ✅ Allow request              ❌ Return 403 Forbidden
```

---

## 🎯 ROLE-BASED ACCESS MATRIX

```
┌──────────────────────────────────────────────────────────────┐
│                    ENDPOINT PERMISSIONS                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Endpoint                          ADMIN  LAB_MGR  FIN_MGR  │
│  ─────────────────────────────────────────────────────────  │
│  POST   /api/attendance/record      ✅      ✅       ❌     │
│  PUT    /api/attendance/update      ✅      ✅       ❌     │
│  GET    /api/attendance/date        ✅      ✅       ✅     │
│  GET    /api/attendance/today       ✅      ✅       ✅     │
│  GET    /api/attendance/worker      ✅      ✅       ✅     │
│  GET    /api/attendance/salary/*    ✅      ✅       ✅     │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Legend:
✅ = Allowed
❌ = Denied
```

---

## 📱 FRONTEND COMPONENT HIERARCHY

```
App.js (Router)
│
├── Login
│
└── Protected Routes
    │
    ├── AdminDashboard
    │   └── Navigate to /labor → LaborManagerDashboard
    │
    ├── LaborManagerDashboard
    │   ├── Worker Management Card → /labor/workers
    │   ├── Attendance Tracking Card → /attendance
    │   └── Salary Reports Card → /attendance
    │
    ├── FinanceManagerDashboard
    │   └── Navigate to salary reports
    │
    └── AttendancePage (Main Feature)
        │
        ├── Tab 1: Record Attendance
        │   ├── Worker dropdown
        │   ├── Date picker
        │   ├── Status selector
        │   ├── Hours input
        │   ├── Notes textarea
        │   └── Submit button
        │
        ├── Tab 2: View Attendance
        │   ├── Date filter
        │   └── Attendance table
        │       ├── Worker name
        │       ├── Date
        │       ├── Status badge
        │       ├── Hours
        │       ├── Wage
        │       └── Notes
        │
        └── Tab 3: Salary Reports
            ├── Year/Month filters
            └── Salary table
                ├── Worker name
                ├── Present days
                ├── Absent days
                ├── Total hours
                ├── Attendance %
                └── Total salary
```

---

## 🗄️ DATABASE RELATIONSHIPS

```
┌─────────────────┐
│    USERS        │
│    (Workers)    │
│                 │
│  user_id (PK)   │◄───────┐
│  name           │        │
│  position       │        │
│  role           │        │ ForeignKey
│  hourly_rate    │        │
└─────────────────┘        │
                           │
                           │ One-to-Many
                           │ (One worker can have many attendance records)
                           │
                           ▼
┌─────────────────────────────────────────┐
│           ATTENDANCE                    │
│                                         │
│  id (PK)                                │
│  worker_id (FK) ────────────────────────┘
│  date                                   │
│  is_present                             │
│  hours_worked                           │
│  daily_wage                             │
│  status                                 │
│  notes                                  │
│  created_at                             │
│  updated_at                             │
│                                         │
│  UNIQUE: (worker_id, date)              │
└─────────────────────────────────────────┘
```

---

## 🎨 UI COMPONENT STRUCTURE

```
AttendancePage
│
├── Header Section
│   └── "Attendance Tracking & Salary Management"
│
├── Tabs Navigation
│   ├── Record Attendance (active)
│   ├── View Attendance
│   └── Salary Reports
│
├── Message Display (Success/Error)
│
└── Content Area (based on active tab)
    │
    ├── Record Attendance Tab
    │   ├── Form
    │   │   ├── Select Worker
    │   │   ├── Date Input
    │   │   ├── Status Select
    │   │   ├── Hours Input
    │   │   ├── Notes Textarea
    │   │   └── Submit Button
    │   └── Rules Info Box
    │
    ├── View Attendance Tab
    │   ├── Filter Controls
    │   │   ├── Date Input
    │   │   └── Load Button
    │   └── Attendance Table
    │
    └── Salary Reports Tab
        ├── Filter Controls
        │   ├── Year Input
        │   ├── Month Select
        │   └── Generate Button
        └── Salary Table
```

---

## 🔄 STATE MANAGEMENT FLOW

```
AttendancePage Component State
│
├── activeTab ('record' | 'view' | 'salary')
├── workers []
├── selectedDate (YYYY-MM-DD)
├── attendanceRecords []
├── loading (boolean)
├── message (string)
├── messageType ('success' | 'error')
│
├── attendanceForm {
│   ├── workerId
│   ├── isPresent
│   ├── hoursWorked
│   └── notes
│ }
│
├── salaryYear
├── salaryMonth
└── salaryReports []
```

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────┐
│   Browser   │
│   (React)   │
└──────┬──────┘
       │ HTTP Request
       │ (with JWT)
       ▼
┌─────────────┐
│   Spring    │
│  Security   │
│  (JWT Auth) │
└──────┬──────┘
       │ Validated
       ▼
┌─────────────┐
│ Controller  │
│  (REST API) │
└──────┬──────┘
       │ DTO
       ▼
┌─────────────┐
│   Service   │
│ (Business   │
│   Logic)    │
└──────┬──────┘
       │ Entity
       ▼
┌─────────────┐
│ Repository  │
│  (JPA)      │
└──────┬──────┘
       │ SQL
       ▼
┌─────────────┐
│  Database   │
│  (MySQL)    │
└─────────────┘
```

---

## 🎯 BUSINESS RULES IMPLEMENTATION

```
┌─────────────────────────────────────────────────────────┐
│                  BUSINESS RULES ENGINE                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. DUPLICATE PREVENTION                                │
│     └─ Check: EXISTS(worker_id, date)                   │
│     └─ If exists → Reject (409 Conflict)                │
│                                                         │
│  2. STANDARD WORK DAY                                   │
│     └─ Default hours: 8                                 │
│     └─ Daily wage: Rs. 8,000                            │
│     └─ Hourly rate: Rs. 1,000 (8000/8)                  │
│                                                         │
│  3. SALARY CALCULATION                                  │
│     └─ Method 1: Hours × Hourly Rate                    │
│     └─ Method 2: Days Present × 8000                    │
│     └─ Use whichever is available                       │
│                                                         │
│  4. WORK WEEK REQUIREMENT                               │
│     └─ Required: 5 days per week                        │
│     └─ Tracked via attendance percentage                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

```
┌──────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐         ┌────────────────┐         │
│  │   React App    │         │  Spring Boot   │         │
│  │   (Nginx/      │◄───────►│   Application  │         │
│  │    Apache)     │  REST   │   (JAR file)   │         │
│  │   Port 80/443 │  API    │   Port 8080    │         │
│  └────────────────┘         └───────┬────────┘         │
│                                     │                   │
│                                     ▼                   │
│                            ┌────────────────┐          │
│                            │    MySQL       │          │
│                            │   Database     │          │
│                            │   Port 3306    │          │
│                            └────────────────┘          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

**This architecture provides:**
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ Performance
- ✅ Reliability

**Status: PRODUCTION READY** ✅
