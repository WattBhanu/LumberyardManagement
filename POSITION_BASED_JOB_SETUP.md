# Position-Based Job Assignment System - Setup Guide

## Problem Solved
The system now supports creating jobs with multiple position types (e.g., 3 Sawyers, 5 Employees, 2 Forklift Operators) instead of just "employees" and "supervisors".

## Database Migration Required

### Step 1: Run the Migration Script
Execute this SQL script in your database:

```sql
-- Migration to remove NOT NULL constraint from legacy columns
-- and allow position-based job creation

-- Step 1: Update existing records to have default values (if any NULLs exist)
UPDATE job_assignments 
SET required_employees = COALESCE(required_employees, 0),
    required_supervisors = COALESCE(required_supervisors, 0);

-- Step 2: Modify columns to allow NULL (or set DEFAULT 0)
ALTER TABLE job_assignments 
MODIFY required_employees INT NULL DEFAULT 0,
MODIFY required_supervisors INT NULL DEFAULT 0;
```

**Location:** `lumberyard-backend/migration_fix_defaults.sql`

### Step 2: Verify the Changes
After running the migration, verify:
```sql
DESCRIBE job_assignments;
```
You should see that `required_employees` and `required_supervisors` now allow NULL.

## How the New System Works

### 1. Creating a Job
When creating a new job, you'll see:
- A list of all 10 positions (Employee, Sawyer, Forklift Operator, Team Lead, Supervisor, etc.)
- Each position has **+** and **-** buttons to adjust quantity
- Real-time total counter at the bottom

**Example:** Create a job needing:
- 3 Sawyers
- 5 Employees  
- 2 Forklift Operators
- 1 Quality Inspector

### 2. Viewing Jobs
In the Select Jobs page:
- Shows total workers needed per job
- Displays individual buttons for each position type
- Example buttons: "Add Sawyers (2/3)", "Add Employees (1/5)", "Add Forklift Operators (0/2)"

### 3. Assigning Workers
When you click "Add [Position]":
- Opens worker selector filtered to show ONLY workers with that exact position
- Shows how many are required vs already assigned
- You can select and assign workers with that specific position

### 4. Tracking Progress
The system tracks:
- How many of each position are required
- How many of each position are already assigned
- Which workers are assigned to which positions

## Technical Details

### Frontend Changes
- **CreateJobModal.js**: Position selection UI with +/- controls
- **SelectJobs.js**: Dynamic buttons for each position type
- **WorkerSelector.js**: Filters workers by exact position match

### Backend Changes
- **JobCreateDTO.java**: Added `positionRequirements` (Map<String, Integer>)
- **JobAssignment.java**: Added `positionRequirements` field stored in separate table
- **JobAssignmentDTO.java**: Added `assignedPositionsCount` (Map<String, Long>)
- **JobAssignmentService.java**: Logic to handle position-based requirements

### Data Structure
Position requirements are stored in a new table:
```sql
job_position_requirements (
    job_id BIGINT,
    position_name VARCHAR(255),
    quantity INT
)
```

This allows flexible storage of any number of position types per job.

## Backward Compatibility
The system still supports old-style jobs that use `required_employees` and `required_supervisors`. Both formats work simultaneously.

## Testing Checklist
- [ ] Run database migration script
- [ ] Create a new job with multiple positions (e.g., 3 Sawyers, 2 Employees)
- [ ] Verify job appears in Select Jobs with correct position buttons
- [ ] Click "Add Sawyers" and verify only Sawyer-position workers are shown
- [ ] Assign workers and verify count updates correctly
- [ ] Test that old employee/supervisor jobs still work

## Troubleshooting

### Error: "Column 'required_employees' cannot be null"
**Solution:** Run the migration script above to make the column nullable.

### Workers Not Showing When Selecting
**Check:** The worker's `position` field must exactly match the position name (case-insensitive).
- Example: If selecting "Sawyer", worker.position must be "Sawyer"

### Position Counts Not Updating
**Verify:** The `assignedPositionsCount` map is being populated in the DTO conversion.

## Future Enhancements (Optional)
If you want to completely remove the legacy columns after testing:
```sql
ALTER TABLE job_assignments DROP COLUMN required_employees;
ALTER TABLE job_assignments DROP COLUMN required_supervisors;
```

Then update the Java entities to remove those fields completely.
