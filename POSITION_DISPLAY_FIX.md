# Position-Based Jobs - Display Fix

## Problem
Jobs created with position requirements (e.g., 3 Sawyers, 2 Employees) were not showing up in:
1. Main jobs table (`/labor/jobs/assignment`)
2. Select jobs page (`/labor/jobs/select`)

## Root Cause
The repository query `findJobsNeedingWorkers()` was only checking the old `requiredEmployees + requiredSupervisors` fields and ignoring the new `positionRequirements` field.

## Fixes Applied

### 1. Backend Repository Query (JobAssignmentRepository.java)
**Updated:** `findJobsNeedingWorkers()` query to check BOTH legacy and new formats

```java
@Query("SELECT j FROM JobAssignment j WHERE j.date = :date AND (" +
       "SIZE(j.workerAssignments) < (j.requiredEmployees + j.requiredSupervisors) OR " +
       "j.positionRequirements IS NOT NULL AND SIZE(j.workerAssignments) < (" +
       "SELECT SUM(COALESCE(req.quantity, 0)) FROM j.positionRequirements req))")
List<JobAssignment> findJobsNeedingWorkers(@Param("date") LocalDate date);
```

**What it does:**
- Checks if job needs workers using old format (employees + supervisors)
- **OR** checks if job has position requirements and needs workers based on total positions

### 2. Backend Status Update Logic (JobAssignmentService.java)
**Updated:** `updateJobStatus()` to handle position-based requirements

```java
// Check if using position-based requirements
if (job.getPositionRequirements() != null && !job.getPositionRequirements().isEmpty()) {
    // Count assigned workers per position
    Map<String, Long> assignedPerPosition = new java.util.HashMap<>();
    for (JobWorkerAssignment assignment : job.getWorkerAssignments()) {
        String position = assignment.getWorker().getPosition();
        if (position != null) {
            assignedPerPosition.put(position, 
                assignedPerPosition.getOrDefault(position, 0L) + 1);
        }
    }
    
    // Check if all position requirements are met
    isFullyAssigned = true;
    for (Map.Entry<String, Integer> entry : job.getPositionRequirements().entrySet()) {
        String position = entry.getKey();
        int required = entry.getValue();
        long assigned = assignedPerPosition.getOrDefault(position, 0L);
        if (assigned < required) {
            isFullyAssigned = false;
            break;
        }
    }
}
```

**What it does:**
- For position-based jobs: counts workers per position and checks if ALL requirements are met
- For legacy jobs: uses old employee/supervisor counting logic

### 3. Frontend Display (JobAssignment.js)
**Updated:** Main jobs table to show position requirements

**Before:**
```jsx
<th>Employees</th>
<th>Supervisors</th>
```

**After:**
```jsx
<th>Positions Required</th>
<th>Total Workers</th>
```

**Display logic:**
- Shows badges for each position: "Sawyer: 3", "Employee: 5", "Forklift Operator: 2"
- Shows total worker count: "7 / 10" (7 assigned out of 10 needed)
- Backward compatible with old employee/supervisor format

### 4. CSS Styling (JobAssignment.css)
**Added:** `.ja-position-badge` style

```css
.ja-position-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%);
  color: #3730a3;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
```

## Testing Checklist

### Test Case 1: Create Job with Multiple Positions
1. ✅ Create job with 3 positions (e.g., 3 Sawyers, 2 Employees, 1 Forklift Operator)
2. ✅ Verify job appears in `/labor/jobs/assignment` table
3. ✅ Verify position badges show correctly (3 small badges for each position type)
4. ✅ Verify total worker count shows (e.g., "0 / 6")

### Test Case 2: Select Jobs Page
1. ✅ Navigate to `/labor/jobs/select`
2. ✅ Verify job with positions appears in table
3. ✅ Verify buttons show for each position: "Add Sawyers (0/3)", "Add Employees (0/2)", etc.

### Test Case 3: Assign Workers
1. ✅ Click "Add Sawyers (0/3)"
2. ✅ Verify only workers with position="Sawyer" are shown
3. ✅ Select and assign 3 Sawyer workers
4. ✅ Verify button updates to show "Add Sawyers (3/3)" or disappears when full
5. ✅ Verify job status changes to IN_PROGRESS when all positions are filled

### Test Case 4: Legacy Jobs
1. ✅ Verify old jobs (with employees/supervisors) still work
2. ✅ Verify they appear in both pages
3. ✅ Verify assignment still works for them

## Database Requirements

Make sure you've run the migration script:

```sql
-- File: lumberyard-backend/migration_fix_defaults.sql
ALTER TABLE job_assignments 
MODIFY required_employees INT NULL DEFAULT 0,
MODIFY required_supervisors INT NULL DEFAULT 0;
```

## Visual Example

### Jobs Table View:
| Job ID | Job Name | Date | Positions Required | Total Workers | Status |
|--------|----------|------|-------------------|---------------|---------|
| JOB-001 | Timber Unloading | 2026-03-31 | [Sawyer: 3] [Employee: 5] [Forklift Operator: 2] | 0 / 10 | PENDING |
| JOB-002 | Sawing | 2026-03-31 | Emp: 4, Sup: 1 | 0 / 5 | PENDING |

### Select Jobs Buttons:
- **JOB-001**: [Add Sawyers (0/3)] [Add Employees (0/5)] [Add Forklift Operators (0/2)]
- **JOB-002**: [Add Employees (0/4)] [Add Supervisors (0/1)]

## Files Modified

### Backend:
- ✅ `JobAssignmentRepository.java` - Query to find jobs needing workers
- ✅ `JobAssignmentService.java` - Status update logic and DTO conversion

### Frontend:
- ✅ `JobAssignment.js` - Display position requirements in table
- ✅ `JobAssignment.css` - Badge styling
- ✅ `SelectJobs.js` - Dynamic position buttons (already done)
- ✅ `WorkerSelector.js` - Position-based filtering (already done)

## Status
✅ **COMPLETE** - Jobs with position requirements now appear correctly in all pages and can be managed properly.
