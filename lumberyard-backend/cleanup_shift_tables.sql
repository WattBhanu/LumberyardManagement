-- SQL script to clean up shift-related tables
-- Run this in MySQL before restarting the backend

USE lumberyard_db;

-- Drop tables in correct order (child tables first)
DROP TABLE IF EXISTS shift_worker_assignments;
DROP TABLE IF EXISTS shifts;

-- Verify tables are dropped
SHOW TABLES LIKE 'shift%';
