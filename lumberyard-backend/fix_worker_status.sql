-- Fix worker status values in database
-- This converts any "Active", "active", "Inactive", etc. to uppercase format

USE lumberyard_db;

-- Check current status values
SELECT DISTINCT status FROM workers;

-- Update any variations to proper uppercase format
UPDATE workers SET status = 'ACTIVE' WHERE UPPER(status) = 'ACTIVE';
UPDATE workers SET status = 'INACTIVE' WHERE UPPER(status) = 'INACTIVE';
UPDATE workers SET status = 'SUSPENDED' WHERE UPPER(status) = 'SUSPENDED';
UPDATE workers SET status = 'TERMINATED' WHERE UPPER(status) = 'TERMINATED';

-- Verify the fix
SELECT status, COUNT(*) as count FROM workers GROUP BY status;
