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

-- Optional Step 3: If you want to completely remove these columns later (after testing):
-- ALTER TABLE job_assignments DROP COLUMN required_employees;
-- ALTER TABLE job_assignments DROP COLUMN required_supervisors;
