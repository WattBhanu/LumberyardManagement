<div align="center">

# 🌙 Lumberyard Management System

Developed for **Wood Moon Enterprises** — Client: Mr. Sigman Shanthapriya

[🔗 Visit Wood Moon Enterprises on Facebook](https://www.facebook.com/p/Wood-Moon-Enterprises-100090445121861/)

<img src="lumberyard-frontend/src/Logo.png" alt="Wood Moon Logo" width="100">

**Developed By**

[![GitHub](https://img.shields.io/badge/GitHub-Wattegamabc-black?logo=github)](https://github.com/Wattegamabc)
[![GitHub](https://img.shields.io/badge/GitHub-PraveenSanjaya-black?logo=github)](https://github.com/PraveenSanjaya)
[![GitHub](https://img.shields.io/badge/GitHub-DinugaRansen-black?logo=github)](https://github.com/DinugaRansen)
[![GitHub](https://img.shields.io/badge/GitHub-oneldesilva-black?logo=github)](https://github.com/oneldesilva)

</div>

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Key Features](#key-features)
- [User Roles & Permissions](#user-roles--permissions)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Project Credits](#project-credits)

---

## 🏢 System Overview

The **Lumberyard Management System** is an enterprise-grade web application built to manage all aspects of modern lumberyard operations for Wood Moon Enterprises. It provides real-time tracking of inventory (timber, logs, and chemicals), manages production workflows from raw material to finished products, oversees timber treatment processes, handles worker attendance and payroll, and maintains comprehensive financial records.

---

## ✨ Key Features

### 📦 Inventory Management
- **Timber Tracking** - Monitor treated and untreated timber stock with unique codes
- **Log Management** - Track raw log inventory with detailed specifications
- **Chemical Inventory** - Manage treatment chemicals and supplies
- **Real-time Search** - Search across all inventory types by code
- **Stock Status Indicators** - Visual indicators for low, medium, and normal stock levels
- **Automatic Stock Deduction** - Materials automatically deducted during production and treatment

### 🏭 Production Management
- **Multi-stage Production Workflow** - Track processes through STARTED → SAWING → PLANING → ASSEMBLY → FINISHED
- **Product Types** - Support for standard and custom doors and windows with specific dimensions
- **Production History** - Complete audit trail of all production activities
- **Material Refund on Cancellation** - Cancelled productions automatically refund materials to inventory
- **Process Tracking** - Real-time visual progress indicators for active productions

### 🧪 Timber Treatment Process
- **Treatment Scheduling** - Manage chemical treatment processes for timber preservation
- **Chemical Usage Tracking** - Monitor chemical consumption per treatment
- **Treatment History** - Complete records of all treatment operations
- **Timber Tracking** - Track timber through treatment stages
- **Automatic Deduction** - Chemicals and timber deducted immediately upon treatment start

### 👥 Labor & Workforce Management
- **Worker Database** - Comprehensive worker profiles with positions, departments, and contact information
- **Attendance Tracking** - Record arrival/departure times with automatic worked hours calculation
- **Job Assignment System** - Assign workers to specific jobs with role-based positioning
- **Shift Scheduling** - Manage worker shifts and schedules
- **Salary Calculation** - Automated salary calculation based on position, experience, and hours worked
- **Daily & Monthly Reports** - Generate detailed salary reports with attendance percentages

### 💰 Financial Management
- **Transaction Recording** - Track all income and expense transactions
- **Expense Management** - Categorize and monitor operational expenses
- **Income Tracking** - Record and categorize revenue streams
- **Profit & Loss Reports** - Generate comprehensive P&L statements
- **Salary Reports** - View consolidated salary expenditures
- **Manager Salary Tracking** - Track manager compensation with history

### 👤 User Management
- **Role-based Access Control** - Four distinct user roles with specific permissions
- **User Registration** - Admin can create and manage all user accounts
- **Manager Salary Configuration** - Set and update daily salary rates for managers
- **Account Management** - View, update, and delete user accounts

---

## 👥 User Roles & Permissions

### 1. ADMIN
**Full System Access**

The Administrator has complete control over all system functions and serves as the superuser.

**Capabilities:**
- ✅ Access all modules: Inventory, Production, Treatment, Labor, Finance
- ✅ Create, update, and delete user accounts across all roles
- ✅ View and modify manager salary configurations
- ✅ Delete all production history records
- ✅ Access comprehensive system reports and analytics
- ✅ Manage all inventory items (timber, logs, chemicals)
- ✅ Oversee all production and treatment processes
- ✅ View all worker attendance and salary data
- ✅ Access complete financial records and reports

**Dashboard:** `/admin`

**How to Use:**
1. **Login:** Navigate to the application URL and enter your admin credentials
2. **Access Admin Dashboard:** After login, you'll be redirected to `/admin`
3. **Create New Users:**
    - Click "User Management" card on dashboard
    - Fill in user details (name, email, phone, password)
    - Select role from dropdown (Finance Manager, Inventory Operations Manager, Labor Manager, Admin)
    - Set daily salary rate for managers
    - Click "Register User"
4. **View All Users:**
    - Scroll down on User Registration page to see user list
    - View user details, roles, and status
    - Delete users if needed (confirmation required)
5. **Access Other Modules:**
    - Use navigation menu to access Inventory (`/main`), Production (`/production`), Treatment (`/treatment`), Labor (`/labor`), or Finance (`/finance`)
    - Perform any operation across all modules
6. **Manager Salary Management:**
    - Go to User Registration page
    - Click "View Manager Salaries" button
    - Update salary rates as needed
7. **Delete Production History:**
    - Navigate to Production page
    - Switch to "History" tab
    - Click "Delete All Productions from History" (requires double confirmation)

---

### 2. INVENTORY_OPERATIONS_MANAGER
**Inventory & Operations Specialist**

Manages all physical inventory and operational processes within the lumberyard.

**Capabilities:**
- ✅ Full access to Inventory Management module
    - Add, edit, and delete timber, logs, and chemicals
    - Monitor stock levels and status
    - Search inventory by product codes
- ✅ Full access to Production Management
    - Start new production processes
    - Track production stages (Started → Sawing → Planing → Assembly → Finished)
    - Finish, cancel, or delete production orders
    - View production history
- ✅ Full access to Treatment Process Management
    - Schedule and manage timber treatments
    - Track chemical usage
    - Monitor treatment status and history
- ✅ View inventory dashboard with stock summaries
- ❌ Cannot access labor management features
- ❌ Cannot access financial management features
- ❌ Cannot create or manage user accounts

**Dashboard:** `/main`

**How to Use:**
1. **Login:** Navigate to the application URL and enter your credentials
2. **Access Main Dashboard:** After login, you'll be redirected to `/main`
3. **Manage Inventory:**
    - Click "Inventory System" card on main page or navigate to `/main`
    - View inventory overview showing timber, logs, and chemical counts
    - Click on specific inventory type (Timber, Logs, Chemicals) to manage
    - **Add New Items:** Click "Add" button, fill in details (code, name, quantity, status), save
    - **Search Items:** Use search bar at top to find items by code across all inventory types
    - **Update Stock:** Edit existing items to modify quantity or status
    - **Monitor Stock Levels:** Color-coded indicators show Low (red), Medium (orange), Normal (green)
4. **Start Production:**
    - Navigate to `/production` from main page
    - Fill in production form:
        - Select process type (Door or Window with dimensions, or Custom)
        - For custom items: enter width and height dimensions
        - Select timber code from dropdown (shows available quantity)
        - Enter amount to process
    - Click "Start Process" and confirm
    - Timber quantity is automatically deducted from inventory
5. **Track Production Progress:**
    - View active productions in "Active Processes" tab
    - Click on stage buttons to update progress: STARTED → SAWING → PLANING → ASSEMBLY → FINISHED
    - Click "Finish" to complete production (moves to history)
    - Click "Cancel" to cancel production (refunds timber to inventory)
    - Click "Delete" to remove production (materials NOT refunded)
6. **View Production History:**
    - Switch to "History" tab on Production page
    - Filter by process type using dropdown
    - View detailed timeline of each production event
7. **Manage Timber Treatment:**
    - Navigate to `/treatment` from main page
    - Start new treatment:
        - Select untreated timber from dropdown
        - Choose chemical type
        - Enter timber quantity and chemical quantity
        - Click "Start Treatment" (both timber and chemicals deducted immediately)
    - Monitor active treatments and update status
    - View treatment history with full details
8. **View Timber Tracking:**
    - On Treatment page, switch to "Timber Tracking" tab
    - Track timber through various stages and treatments

---

### 3. LABOR_MANAGER
**Workforce & Attendance Manager**

Oversees all worker-related operations including attendance, job assignments, and salary reporting.

**Capabilities:**
- ✅ Full access to Worker Management
    - Create, update, and manage worker profiles
    - Track worker positions, departments, and status
    - View worker statistics and summaries
- ✅ Full access to Attendance Tracking
    - Record worker arrival and departure times
    - Automatic calculation of worked hours
    - Mark workers as present or absent
    - View attendance records by date
- ✅ Full access to Job Assignment System
    - Create and manage job assignments
    - Assign workers to specific positions
    - Schedule shifts
    - Track job completion status
- ✅ Access to Salary Reports
    - Generate daily salary reports
    - Generate monthly salary reports
    - View worker compensation details
    - Calculate salaries based on hours worked and position rates
- ✅ View attendance data for finance reporting
- ❌ Cannot access inventory management features
- ❌ Cannot access production or treatment modules
- ❌ Cannot access financial transaction management
- ❌ Cannot create or manage user accounts

**Dashboard:** `/labor`

**How to Use:**
1. **Login:** Navigate to the application URL and enter your credentials
2. **Access Labor Dashboard:** After login, you'll be redirected to `/labor`
3. **View Worker Statistics:**
    - Dashboard shows total workers, active workers, and inactive workers
    - Click on any card to navigate to specific section
4. **Manage Workers:**
    - Click "Workers" card or navigate to `/labor/workers`
    - **Add New Worker:**
        - Click "Add Worker" button
        - Fill in details: First Name, Last Name, Email, Phone, Position, Department
        - Set hire date, date of birth, and home address
        - Select status (Active/Inactive)
        - Click "Save"
    - **Edit Worker:** Click edit icon on worker row, update details, save
    - **View Worker Details:** Click on worker name to see full profile
    - **Filter Workers:** Use search/filter to find workers by name, position, or department
5. **Track Attendance:**
    - Click "Attendance Tracking" card or navigate to `/labor/attendance`
    - Select date using date picker (defaults to today)
    - **Record Arrival:**
        - Select worker from dropdown
        - Status defaults to "Present"
        - Enter arrival time (e.g., 08:00)
        - Add notes if needed
        - Click "Save"
    - **Record Departure:**
        - Find worker's attendance record for the day
        - Click "Edit" on that record
        - Enter departure time (e.g., 17:00)
        - Worked hours calculated automatically
        - Click "Save"
    - **Mark as Absent:**
        - Create attendance record with status "Absent"
        - No arrival/departure times allowed for absent workers
    - **Filter Records:** Use time filter to show all, with time entries, or without time entries
    - **View Summary:** Top section shows total workers present and total hours worked
6. **Generate Salary Reports:**
    - Click "Salary Reports" card or navigate to `/labor/salary`
    - **Daily Report:**
        - Select year, month, and day
        - Click "Generate Report"
        - View all workers with attendance, hours worked, and calculated salary
        - See total payroll and average salary
        - Export to PDF if needed
    - **Monthly Report:**
        - Select year and month
        - Click "Generate Report"
        - View present days, absent days, total hours, and monthly salary per worker
        - Attendance percentage calculated automatically
    - **Salary Calculation:** Based on worker position, experience (hire date), and hours worked
7. **Manage Job Assignments:**
    - Click "Jobs" card or navigate to `/labor/jobs`
    - **Create Job Assignment:**
        - Click "Create Job" or navigate to assignment section
        - Enter job name, date, required employees and supervisors
        - Define position requirements (e.g., 2 Sawyers, 1 Team Lead)
        - Click "Save"
    - **Assign Workers:**
        - Select job assignment
        - Choose workers for each position
        - Assign as Employee or Supervisor role
        - Click "Assign"
    - **Schedule Shifts:**
        - Navigate to Shift Scheduling
        - Create shifts with start/end times
        - Assign workers to shifts
    - **View Jobs:** Use "Select Jobs" to view and manage existing assignments
    - **Track Status:** Monitor job completion and worker assignments

---

### 4. FINANCE_MANAGER
**Financial Operations Manager**

Manages all financial aspects of the lumberyard including transactions, expenses, income, and reporting.

**Capabilities:**
- ✅ Full access to Financial Transaction Management
    - Record income transactions
    - Record expense transactions
    - View all financial transactions
    - Generate transaction reports
- ✅ Full access to Expense Reporting
    - Categorize and track expenses
    - View expense summaries
    - Generate expense reports
- ✅ Full access to Income Recording
    - Record and categorize income
    - Track revenue streams
    - Generate income reports
- ✅ Full access to Profit & Loss Reports
    - Generate comprehensive P&L statements
    - View profit/loss summaries
    - Analyze financial performance
- ✅ Access to Salary Reports
    - View worker daily and monthly salary reports
    - Access consolidated salary summaries
    - Review attendance-based salary calculations
- ✅ View attendance data for salary verification
- ❌ Cannot access inventory management features
- ❌ Cannot access production or treatment modules
- ❌ Cannot manage workers or record attendance
- ❌ Cannot create or manage user accounts

**Dashboard:** `/finance`

**How to Use:**
1. **Login:** Navigate to the application URL and enter your credentials
2. **Access Finance Dashboard:** After login, you'll be redirected to `/finance`
3. **View Dashboard Overview:**
    - Dashboard shows cards for Salary Tracking, Labor Salary Reports, Income Recording, Expense Reporting, and Profit & Loss
    - Click any card to navigate to that section
4. **Record Income:**
    - Click "Income Recording" card or select from navigation
    - Click "Add Income" or similar button
    - Fill in details:
        - Date of transaction
        - Description/source of income
        - Amount received
        - Category (e.g., Product Sales, Services, Other)
    - Click "Save" to record
    - View income history in table below form
5. **Record Expenses:**
    - Click "Expense Reporting" card or select from navigation
    - Click "Add Expense" or similar button
    - Fill in details:
        - Date of expense
        - Description/purpose
        - Amount spent
        - Category (e.g., Materials, Labor, Operations, Utilities)
    - Click "Save" to record
    - View expense history and totals
6. **View Transactions:**
    - Navigate to transactions view
    - See all income and expense records in one place
    - Filter by date range, type (income/expense), or category
    - Edit or delete transactions if needed
    - Generate transaction reports
7. **Generate Profit & Loss Reports:**
    - Click "Profit & Loss" card or select from navigation
    - Select date range (start date and end date)
    - Click "Generate Report"
    - View comprehensive P&L statement showing:
        - Total income for period
        - Total expenses for period
        - Net profit or loss
        - Breakdown by category
    - Export report to PDF if needed
    - View P&L summary for quick overview
8. **View Salary Reports:**
    - **Worker Salaries:**
        - Click "Labor Salary Reports" or navigate to `/labor/salary`
        - Select date for daily report or month for monthly report
        - View worker attendance, hours worked, and calculated salaries
        - See total payroll costs
    - **Manager Salaries:**
        - Click "Salary Tracking" on finance dashboard
        - View consolidated salary summary
        - See daily costs for all present workers and managers
    - **Salary Report History:**
        - Access historical salary reports
        - Compare payroll costs across different periods
9. **Financial Analysis:**
    - Use transaction reports to analyze spending patterns
    - Compare income vs expenses over time
    - Identify major expense categories
    - Track profitability trends
10. **Export Reports:**
    - Most reports can be exported to PDF
    - Look for "Export" or "Download PDF" buttons on report pages
    - Save reports for record-keeping or sharing

---

## 🛠 Technology Stack

### Backend
- **Framework:** Spring Boot 4.0.2 (Java 21)
- **Database:** MySQL (Production) / H2 (Development)
- **ORM:** Spring Data JPA / Hibernate
- **Security:** Spring Security with JWT Authentication
- **Build Tool:** Maven
- **Additional Libraries:**
    - Lombok - Reduce boilerplate code
    - JJWT (0.11.5) - JSON Web Token handling
    - Spring Boot DevTools - Development hot-reload
    - Bean Validation - Input validation

### Frontend
- **Framework:** React 19.2.4
- **Routing:** React Router DOM 7.13.0
- **HTTP Client:** Axios 1.13.5
- **PDF Generation:** jsPDF 4.2.1 + jsPDF-autoTable
- **Styling:** CSS with Tailwind CSS 4.2.0
- **Build Tool:** Create React App (react-scripts 5.0.1)
- **Testing:** React Testing Library + Jest

### Infrastructure
- **Database Hosting:** TiDB Cloud (MySQL-compatible)
- **Backend Deployment:** Render
- **Frontend Deployment:** Netlify
- **Authentication:** JWT (24-hour token expiration)
- **CORS:** Configured for cross-origin requests

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │           React Frontend (Netlify)               │   │
│  │  - Role-based routing & protected routes         │   │
│  │  - Component-based UI                            │   │
│  │  - Axios API client with JWT interceptors        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS / REST API
                          │ (Bearer Token Authentication)
                          ▼
┌─────────────────────────────────────────────────────────┐
│              SPRING BOOT BACKEND (Render)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Security Layer                                   │   │
│  │  - JWT Filter & Authentication                   │   │
│  │  - Role-based Authorization (@PreAuthorize)      │   │
│  │  - CORS Configuration                            │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Controller Layer                                 │   │
│  │  - REST API Endpoints                            │   │
│  │  - Request/Response Handling                     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Service Layer                                    │   │
│  │  - Business Logic                                │   │
│  │  - Data Processing & Validation                  │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Repository Layer                                 │   │
│  │  - Spring Data JPA Repositories                  │   │
│  │  - Database Operations                           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │ JPA / Hibernate
                          ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (TiDB Cloud / MySQL)               │
│  - 29 Entity Tables                                      │
│  - Relational Data Model                                 │
│  - Automatic Schema Updates (ddl-auto=update)           │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns
- **Layered Architecture:** Clear separation between Controller, Service, and Repository layers
- **DTO Pattern:** Data Transfer Objects for API request/response handling
- **Role-Based Security:** Method-level security using `@PreAuthorize` annotations
- **Stateless Authentication:** JWT tokens for authentication (no server-side sessions)
- **RESTful API Design:** Standard HTTP methods and resource-based endpoints

---

## 📡 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/test` | Test endpoint | Public |

### User Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/users/register` | Register new user | ADMIN |
| GET | `/api/users/all` | Get all users | ADMIN |

### Inventory Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/timber/all` | Get all timber | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| POST | `/api/timber` | Add timber | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| GET | `/api/logs/all` | Get all logs | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| POST | `/api/logs` | Add logs | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| GET | `/api/chemical/all` | Get all chemicals | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| POST | `/api/chemical` | Add chemical | ADMIN, INVENTORY_OPERATIONS_MANAGER |

### Production Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/production` | Get active productions | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| POST | `/api/production` | Start production | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| PUT | `/api/production/{id}/status` | Update production status | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| POST | `/api/production/{id}/finish` | Finish production | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| GET | `/api/production/history` | Get production history | ADMIN, INVENTORY_OPERATIONS_MANAGER |

### Treatment Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/treatment` | Get active treatments | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| POST | `/api/treatment` | Start treatment | ADMIN, INVENTORY_OPERATIONS_MANAGER |
| GET | `/api/treatment/history` | Get treatment history | ADMIN, INVENTORY_OPERATIONS_MANAGER |

### Labor Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/workers/all` | Get all workers | ADMIN, LABOR_MANAGER |
| POST | `/api/workers` | Create worker | ADMIN, LABOR_MANAGER |
| POST | `/api/attendance` | Record attendance | ADMIN, LABOR_MANAGER |
| GET | `/api/attendance` | Get attendance records | ADMIN, LABOR_MANAGER, FINANCE_MANAGER |
| GET | `/api/jobs` | Get job assignments | ADMIN, LABOR_MANAGER |
| POST | `/api/jobs` | Create job assignment | ADMIN, LABOR_MANAGER |

### Salary Reports
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/salary/reports/daily` | Daily salary report | ADMIN, LABOR_MANAGER, FINANCE_MANAGER |
| GET | `/api/salary/reports/monthly` | Monthly salary report | ADMIN, LABOR_MANAGER, FINANCE_MANAGER |
| GET | `/api/salary/managers` | Manager salaries | ADMIN only |

### Finance Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/finance/transactions` | Get all transactions | ADMIN, FINANCE_MANAGER |
| POST | `/api/finance/transactions` | Create transaction | ADMIN, FINANCE_MANAGER |
| GET | `/api/finance/expenses` | Get all expenses | ADMIN, FINANCE_MANAGER |
| POST | `/api/finance/expenses` | Create expense | ADMIN, FINANCE_MANAGER |
| GET | `/api/finance/profit-loss-report` | Get P&L report | ADMIN, FINANCE_MANAGER |

---

## 🔒 Security

### Authentication & Authorization
- **JWT-Based Authentication:** Stateless token-based authentication with 24-hour expiration
- **BCrypt Password Encryption:** All passwords are hashed using BCrypt
- **Role-Based Access Control:** Four distinct roles with granular permissions
- **Method-Level Security:** `@PreAuthorize` annotations protect all endpoints
- **CORS Configuration:** Configured to allow requests from deployed frontend

### Security Best Practices
- Environment variables for sensitive configuration
- No hardcoded credentials in source code
- Input validation on all API endpoints
- SQL injection protection via JPA/Hibernate
- XSS protection through React's automatic escaping

### Important Notes
- HTTPS enabled in production
- Regular database backups performed
- JWT secrets rotated periodically

---

## 📊 System Statistics

- **Backend Entities:** 29 database tables
- **REST API Endpoints:** 50+ endpoints
- **Frontend Components:** 40+ React components
- **User Roles:** 4 distinct roles
- **Core Modules:** Inventory, Production, Treatment, Labor, Finance, User Management

<div align="center">

---

## 👥 Development Team

**Wattegambc** | **PraveenSanjaya** | **DinugaRansen** | **oneldesilva**

---

### Built for Wood Moon Enterprises

*Empowering lumberyard operations with modern technology*

[🌐 Wood Moon Enterprises on Facebook](https://www.facebook.com/p/Wood-Moon-Enterprises-100090445121861/)

---

**Version:** 1.0.0  
**Last Updated:** April 2026  
© 2026 Wood Moon Enterprises. All Rights Reserved.

---

</div>

*Thank you for using the Lumberyard Management System!*
