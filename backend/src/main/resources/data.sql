-- ===================================================================
-- VitalPulse Emergency Blood Network - H2 Seed Data Initialization (data.sql)
-- ===================================================================

-- 1. Insert Users (BCrypt hashed password for 'password123': $2a$10$wJ2t5x... or plaintext for dev)
INSERT INTO users (id, name, email, password_hash, phone, role, created_at) VALUES
('user-admin-1', 'Dr. Evelyn Reed (CMO)', 'admin@vitalpulse.org', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3eq', '+1 (555) 019-2831', 'ADMIN', CURRENT_TIMESTAMP),
('user-hosp-1', 'City Care Trauma & Multi-Specialty', 'er@citycare.org', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3eq', '+1 (555) 234-8901', 'HOSPITAL', CURRENT_TIMESTAMP),
('user-hosp-2', 'St. Jude Children & General Hospital', 'bloodbank@stjude-health.org', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3eq', '+1 (555) 456-7890', 'HOSPITAL', CURRENT_TIMESTAMP),
('user-hosp-3', 'Metropolitan Community Clinic', 'contact@metroclinic.med', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3eq', '+1 (555) 789-1234', 'HOSPITAL', CURRENT_TIMESTAMP),
('user-donor-1', 'Rahul Sharma', 'rahul.donor@gmail.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3eq', '+1 (555) 912-3456', 'DONOR', CURRENT_TIMESTAMP),
('user-donor-2', 'Priya Patel', 'priya.patel@outlook.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3eq', '+1 (555) 823-4567', 'DONOR', CURRENT_TIMESTAMP),
('user-donor-3', 'David Chen', 'david.chen@gmail.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3eq', '+1 (555) 734-5678', 'DONOR', CURRENT_TIMESTAMP);

-- 2. Insert Hospitals
INSERT INTO hospitals (id, user_id, hospital_name, address, city, lat, lng, license_no, verified, contact_person) VALUES
('hosp-1', 'user-hosp-1', 'City Care Trauma & Multi-Specialty', '452 Healthcare Boulevard', 'Central Metro', 12.9836, 77.5866, 'MED-REG-89241-A', TRUE, 'Dr. Sarah Connor'),
('hosp-2', 'user-hosp-2', 'St. Jude Children & General Hospital', '108 Hope Way, North Hills', 'North District', 13.0166, 77.6196, 'MED-REG-77312-B', TRUE, 'Marcus Vance, RN'),
('hosp-3', 'user-hosp-3', 'Metropolitan Community Clinic', '77 West Market Street', 'West Suburbs', 12.9336, 77.5526, 'CLINIC-PEND-90123', FALSE, 'Dr. Anita Desai');

-- 3. Insert Donors
INSERT INTO donors (id, user_id, blood_group, age, gender, city, home_lat, home_lng, live_lat, live_lng, live_updated_at, share_live, available, last_donation_date, total_donations) VALUES
('donor-1', 'user-donor-1', 'O-', 28, 'MALE', 'Central Metro', 12.9916, 77.5796, 12.9856, 77.5856, CURRENT_TIMESTAMP, TRUE, TRUE, DATEADD('DAY', -110, CURRENT_DATE), 6),
('donor-2', 'user-donor-2', 'A+', 32, 'FEMALE', 'North District', 13.0196, 77.6226, 13.0196, 77.6226, DATEADD('MINUTE', -45, CURRENT_TIMESTAMP), TRUE, TRUE, DATEADD('DAY', -125, CURRENT_DATE), 4),
('donor-3', 'user-donor-3', 'B+', 24, 'MALE', 'Central Metro', 12.9566, 77.6046, NULL, NULL, NULL, FALSE, TRUE, DATEADD('DAY', -35, CURRENT_DATE), 3);

-- 4. Insert Blood Requests
INSERT INTO blood_requests (id, hospital_id, hospital_name, hospital_city, lat, lng, blood_group, units_needed, urgency, patient_notes, status, created_at) VALUES
('req-1', 'hosp-1', 'City Care Trauma & Multi-Specialty', 'Central Metro', 12.9836, 77.5866, 'O-', 2, 'CRITICAL', 'Emergency ICU: Severe trauma collision victim requiring immediate O- transfusion.', 'OPEN', CURRENT_TIMESTAMP),
('req-2', 'hosp-2', 'St. Jude Children & General Hospital', 'North District', 13.0166, 77.6196, 'A+', 3, 'URGENT', 'Pediatric cardiac surgery. Reserve stock needed.', 'ACCEPTED', DATEADD('HOUR', -2, CURRENT_TIMESTAMP));

-- 5. Insert Request Responses
INSERT INTO request_responses (id, request_id, donor_id, status, responded_at) VALUES
('resp-1', 'req-1', 'donor-1', 'NOTIFIED', NULL),
('resp-2', 'req-2', 'donor-2', 'ACCEPTED', DATEADD('MINUTE', -50, CURRENT_TIMESTAMP));

-- 6. Insert Donation History
INSERT INTO donation_history (id, donor_id, request_id, hospital_id, hospital_name, donated_on, units, blood_group, notes) VALUES
('hist-1', 'donor-1', NULL, 'hosp-1', 'City Care Trauma & Multi-Specialty', DATEADD('DAY', -110, CURRENT_DATE), 1, 'O-', 'Whole blood donation drive. Hemoglobin 14.2 g/dL.'),
('hist-2', 'donor-2', NULL, 'hosp-2', 'St. Jude Children & General Hospital', DATEADD('DAY', -125, CURRENT_DATE), 1, 'A+', 'Elective surgery replacement donation.');

-- 7. Insert Access Logs
INSERT INTO access_logs (id, hospital_id, hospital_name, donor_id, donor_name, request_id, viewed_at) VALUES
('log-1', 'hosp-2', 'St. Jude Children & General Hospital', 'donor-2', 'Priya Patel', 'req-2', DATEADD('MINUTE', -48, CURRENT_TIMESTAMP));
