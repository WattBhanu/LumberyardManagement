USE lumberyard_db;

-- 1. Insert Admin and Managers into 'users' and their respective joined tables
-- Password for all is 'admin123' (hashed: $2a$10$HkWLUjHvQG1N2UWUicFh7O4q1RCNjG/lG7XCpKXuvjhXNS9PRY2Aa)

-- Admin User
INSERT INTO users (email, name, password, phone, role, status)
VALUES ('admin@lumberyard.com', 'System Admin', '$2a$10$HkWLUjHvQG1N2UWUicFh7O4q1RCNjG/lG7XCpKXuvjhXNS9PRY2Aa', '000-000-0000', 'ADMIN', 1);
SET @admin_id = LAST_INSERT_ID();
INSERT INTO admins (user_id) VALUES (@admin_id);

-- Inventory Operations Manager
INSERT INTO users (email, name, password, phone, role, status)
VALUES ('inventory_manager@lumberyard.com', 'Inventory Manager', '$2a$10$HkWLUjHvQG1N2UWUicFh7O4q1RCNjG/lG7XCpKXuvjhXNS9PRY2Aa', '111-222-3333', 'INVENTORY_OPERATIONS_MANAGER', 1);
SET @inv_id = LAST_INSERT_ID();
INSERT INTO inventory_operations_managers (user_id) VALUES (@inv_id);

-- Labor Manager
INSERT INTO users (email, name, password, phone, role, status)
VALUES ('labor_manager@lumberyard.com', 'Labor Manager', '$2a$10$HkWLUjHvQG1N2UWUicFh7O4q1RCNjG/lG7XCpKXuvjhXNS9PRY2Aa', '444-555-6666', 'LABOR_MANAGER', 1);
SET @labor_id = LAST_INSERT_ID();
INSERT INTO labor_managers (user_id) VALUES (@labor_id);

-- Finance Manager
INSERT INTO users (email, name, password, phone, role, status)
VALUES ('finance_manager@lumberyard.com', 'Finance Manager', '$2a$10$HkWLUjHvQG1N2UWUicFh7O4q1RCNjG/lG7XCpKXuvjhXNS9PRY2Aa', '777-888-9999', 'FINANCE_MANAGER', 1);
SET @finance_id = LAST_INSERT_ID();
INSERT INTO finance_managers (user_id) VALUES (@finance_id);

-- 2. Insert Workers
INSERT INTO workers (first_name, last_name, email, phone, position, department, status, hire_date, date_of_birth, home_address)
VALUES 
('John', 'Doe', 'john.doe@email.com', '555-0001', 'Sawyer', 'Production', 'Active', '2025-01-10', '1990-05-15', '123 Main St'),
('Jane', 'Smith', 'jane.smith@email.com', '555-0002', 'Stackman', 'Operations', 'Active', '2025-02-15', '1992-08-20', '456 Oak Ave'),
('Alice', 'Johnson', 'alice.j@email.com', '555-0003', 'Loader', 'Logistics', 'Active', '2025-03-01', '1988-11-10', '789 Pine Rd'),
('Bob', 'Wilson', 'bob.w@email.com', '555-0004', 'Driver', 'Logistics', 'Active', '2025-03-20', '1985-02-28', '321 Elm St'),
('Charlie', 'Brown', 'charlie.b@email.com', '555-0005', 'Manager Associate', 'HR', 'Active', '2025-04-05', '1995-12-05', '654 Cedar Ln');

-- 3. Insert Attendance
INSERT INTO attendance (worker_id, date, status, note, arrival_time, departure_time, worked_hours)
VALUES 
(1, CURDATE(), 'Present', 'On time', '08:00:00', '16:00:00', 8.0),
(2, CURDATE(), 'Present', 'On time', '08:00:00', '16:00:00', 8.0),
(3, CURDATE(), 'Present', 'On time', '08:00:00', '16:00:00', 8.0),
(4, CURDATE(), 'Absent', 'Sick leave', NULL, NULL, 0.0),
(5, CURDATE(), 'Present', 'On time', '08:00:00', '16:00:00', 8.0),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Present', 'Overtime', '08:00:00', '18:00:00', 10.0),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Present', 'On time', '08:00:00', '16:00:00', 8.0),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Present', 'On time', '08:00:00', '16:00:00', 8.0);

-- 4. Insert Inventory
-- Logs
INSERT INTO logs (log_code, name, length, cubic_feet, quantity)
VALUES 
('L001', 'Teak Log', 10.0, 50.0, 20),
('L002', 'Mahogany Log', 12.0, 65.0, 15),
('L003', 'Pine Log', 15.0, 80.0, 30);

-- Timber
INSERT INTO timber (timber_code, name, status, length, width, thickness, long_feet, price, quantity)
VALUES 
('T001', 'Teak Plank 8ft', 'Available', 8.0, 2.0, 0.1, 16.0, 150.0, 100),
('T002', 'Mahogany Beam 10ft', 'Available', 10.0, 4.0, 0.4, 40.0, 300.0, 50),
('T003', 'Pine Rafter 12ft', 'Low Stock', 12.0, 2.0, 0.2, 24.0, 80.0, 10);

-- Chemicals
INSERT INTO chemical (chemical_code, name, quantity, status)
VALUES 
('C001', 'Wood Preservative', 25.5, 'Available'),
('C002', 'Varnish High Gloss', 10.0, 'Low Stock'),
('C003', 'Anti-Termite Solution', 50.0, 'Available');

-- 5. Insert Production
INSERT INTO production (timber_id, start_time, end_time, status, process_type, amount)
VALUES 
(1, DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW(), 'FINISHED', 'Planing 4x2', 10.0),
(2, DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, 'STARTED', 'Sawing 8x8', 5.0),
(3, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), 'FINISHED', 'Assembly Unit 1', 2.0);
