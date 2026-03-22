# Worker Management API Documentation

## Overview
The Worker Management system allows Labor Managers and Admins to manage worker profiles through RESTful APIs.

---

## Authentication
All endpoints require authentication with one of these roles:
- `LABOR_MANAGER`
- `ADMIN`

---

## Endpoints

### 1. **Add/Create Worker**

#### Option A: Using `/api/workers/add` (Recommended for Frontend)
```http
POST /api/workers/add
Content-Type: application/json
Authorization: Bearer {your-token}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Kumar",
  "email": "john.kumar@lumberyard.com",
  "phoneNumber": "+91-9876543210",
  "position": "Sawyer",
  "department": "Sawmill",
  "salary": 45000,
  "status": "ACTIVE",
  "hireDate": "2024-03-18",
  "dateOfBirth": "1990-05-15",
  "address": "123 Main St, City",
  "skills": "Woodworking, Machine Operation",
  "certifications": "Safety Level 1",
  "isAvailable": true
}
```

**Success Response (201 Created):**
```json
{
  "workerId": 1,
  "name": "John Kumar",
  "email": "john.kumar@lumberyard.com",
  "phone": "+91-9876543210",
  "position": "Sawyer",
  "department": "Sawmill",
  "hourlyRate": 281.25,
  "status": "ACTIVE",
  "hireDate": "2024-03-18",
  "dateOfBirth": "1990-05-15",
  "isAvailable": true,
  "createdAt": "2024-03-18T10:30:00Z"
}
```

#### Option B: Using `/api/workers/create` (Direct Entity)
```http
POST /api/workers/create
Content-Type: application/json
Authorization: Bearer {your-token}
```

**Request Body:**
```json
{
  "name": "John Kumar",
  "email": "john.kumar@lumberyard.com",
  "phone": "+91-9876543210",
  "position": "Sawyer",
  "department": "Sawmill",
  "hourlyRate": 281.25,
  "status": "ACTIVE",
  "hireDate": "2024-03-18",
  "dateOfBirth": "1990-05-15",
  "isAvailable": true
}
```

---

### 2. **Get All Workers**

```http
GET /api/workers/all
Authorization: Bearer {your-token}
```

**Response (200 OK):**
```json
[
  {
    "workerId": 1,
    "name": "John Kumar",
    "email": "john.kumar@lumberyard.com",
    "position": "Sawyer",
    "department": "Sawmill",
    "status": "ACTIVE"
  },
  {
    "workerId": 2,
    "name": "Priya Singh",
    "email": "priya.singh@lumberyard.com",
    "position": "Team Lead",
    "department": "Sawmill",
    "status": "ACTIVE"
  }
]
```

---

### 3. **Get Worker by ID**

```http
GET /api/workers/{id}
Authorization: Bearer {your-token}
```

**Response (200 OK):**
```json
{
  "workerId": 1,
  "name": "John Kumar",
  "email": "john.kumar@lumberyard.com",
  "phone": "+91-9876543210",
  "position": "Sawyer",
  "department": "Sawmill",
  "hourlyRate": 281.25,
  "status": "ACTIVE",
  "hireDate": "2024-03-18",
  "dateOfBirth": "1990-05-15",
  "isAvailable": true
}
```

**404 Not Found:**
```json
{
  "error": "Worker not found with id: 999"
}
```

---

### 4. **Update Worker**

```http
PUT /api/workers/update/{id}
Content-Type: application/json
Authorization: Bearer {your-token}
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Kumar",
  "email": "john.kumar@lumberyard.com",
  "phoneNumber": "+91-9876543210",
  "position": "Senior Sawyer",
  "department": "Sawmill",
  "salary": 50000,
  "status": "ACTIVE",
  "hireDate": "2024-03-18",
  "dateOfBirth": "1990-05-15",
  "isAvailable": true
}
```

---

### 5. **Delete Worker (Hard Delete)**

```http
DELETE /api/workers/delete/{id}
Authorization: Bearer {your-token}
```

**Success Response (200 OK):**
No content returned

---

### 6. **Soft Delete Worker (Set to Inactive)**

```http
DELETE /api/workers/soft-delete/{id}
Authorization: Bearer {your-token}
```

**Response (200 OK):**
```json
{
  "workerId": 1,
  "name": "John Kumar",
  "status": "INACTIVE",
  "isAvailable": false
}
```

---

### 7. **Get Workers by Department**

```http
GET /api/workers/department/{department}
Authorization: Bearer {your-token}
```

**Example:**
```http
GET /api/workers/department/Sawmill
```

---

### 8. **Get Workers by Status**

```http
GET /api/workers/status/{status}
Authorization: Bearer {your-token}
```

**Valid Status Values:**
- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`
- `TERMINATED`

**Example:**
```http
GET /api/workers/status/ACTIVE
```

---

### 9. **Get Available Workers**

```http
GET /api/workers/available
Authorization: Bearer {your-token}
```

---

## Labor Manager Endpoints (Alternative Routes)

All the above endpoints are also available under `/api/labor/workers/`:

- `POST /api/labor/workers/add` - Add worker
- `POST /api/labor/workers/create` - Create worker
- `GET /api/labor/workers/all` - Get all workers
- `GET /api/labor/workers/{id}` - Get worker by ID
- `PUT /api/labor/workers/update/{id}` - Update worker
- `DELETE /api/labor/workers/delete/{id}` - Delete worker
- `DELETE /api/labor/workers/soft-delete/{id}` - Soft delete worker
- `GET /api/labor/workers/department/{department}` - Filter by department
- `GET /api/labor/workers/available` - Get available workers

---

## Field Mappings

### Frontend → Backend Mapping

| Frontend Field | Backend Field | Notes |
|----------------|---------------|-------|
| `firstName` + `lastName` | `name` | Combined automatically |
| `phoneNumber` | `phone` | Direct mapping |
| `salary` | `hourlyRate` | Converted: hourlyRate = salary / 160 |
| `hireDate` | `hireDate` | Format: YYYY-MM-DD |
| `dateOfBirth` | `dateOfBirth` | Format: YYYY-MM-DD |
| `status` | `status` | ACTIVE, INACTIVE, SUSPENDED, TERMINATED |

---

## Validation Rules

### Required Fields
- ✅ Name (or firstName + lastName)
- ✅ Email (must be unique, valid format)
- ✅ Position
- ✅ Department
- ✅ Hire Date (cannot be in future)
- ✅ Date of Birth (cannot be in future)
- ✅ Hourly Rate (must be > 0)

### Optional Fields
- Phone (must be unique if provided)
- Address
- Skills
- Certifications
- Status (defaults to ACTIVE)
- isAvailable (defaults to true)

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Worker with email john.kumar@lumberyard.com already exists"
}
```

```json
{
  "error": "Invalid email format: invalid-email"
}
```

```json
{
  "error": "Hire date cannot be in the future"
}
```

### 403 Forbidden
```json
{
  "error": "Access Denied",
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Worker not found with id: 999"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error creating worker: Database connection failed"
}
```

---

## Testing with cURL

### Add New Worker
```bash
curl -X POST http://localhost:8080/api/workers/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "Rajesh",
    "lastName": "Patel",
    "email": "rajesh.patel@lumberyard.com",
    "phoneNumber": "+91-9123456789",
    "position": "Forklift Operator",
    "department": "Logistics",
    "salary": 50000,
    "status": "ACTIVE",
    "hireDate": "2024-03-15",
    "dateOfBirth": "1988-07-22"
  }'
```

### Get All Workers
```bash
curl -X GET http://localhost:8080/api/workers/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Worker
```bash
curl -X PUT http://localhost:8080/api/workers/update/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "Rajesh",
    "lastName": "Patel",
    "email": "rajesh.patel@lumberyard.com",
    "position": "Senior Forklift Operator",
    "department": "Logistics",
    "salary": 55000,
    "status": "ACTIVE",
    "hireDate": "2024-03-15",
    "dateOfBirth": "1988-07-22"
  }'
```

---

## Complete Example Workflow

### Step 1: Login and Get Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "labor_manager@lumberyard.com",
    "password": "password123"
  }'
```

Response will include a JWT token.

### Step 2: Add Worker
Use the token from Step 1 to add a worker.

### Step 3: Verify Worker Added
```bash
curl -X GET http://localhost:8080/api/workers/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 4: Update Worker (if needed)
```bash
curl -X PUT http://localhost:8080/api/workers/update/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "Rajesh",
    "lastName": "Patel",
    "email": "rajesh.patel@lumberyard.com",
    "position": "Senior Forklift Operator",
    "department": "Logistics",
    "salary": 55000,
    "status": "ACTIVE",
    "hireDate": "2024-03-15",
    "dateOfBirth": "1988-07-22"
  }'
```

---

## Notes

1. **Salary Conversion**: The frontend `salary` field is assumed to be monthly salary. It's automatically converted to `hourlyRate` by dividing by 160 (standard monthly work hours).

2. **Name Handling**: The backend stores name as a single field. If you send `firstName` and `lastName`, they'll be combined with a space.

3. **Date Format**: All dates should be in `YYYY-MM-DD` format (e.g., `"2024-03-18"`).

4. **Status Enum**: Valid values are case-insensitive: `active`, `ACTIVE`, `Active` all work.

5. **Duplicate Prevention**: Email and phone must be unique across all workers.

6. **Soft Delete**: Recommended over hard delete to maintain historical records.

---

## Support

For issues or questions, check the error messages returned by the API. All validation errors are clearly communicated in the response body.
