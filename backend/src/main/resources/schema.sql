-- ===================================================================
-- VitalPulse Emergency Blood Network - H2 Database Schema Initialization
-- Section 7: Database Design (DDL)
-- ===================================================================

DROP TABLE IF EXISTS access_logs;
DROP TABLE IF EXISTS donation_history;
DROP TABLE IF EXISTS request_responses;
DROP TABLE IF EXISTS blood_requests;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS users;

-- 1. Users Table (Authentication & RBAC: DONOR / HOSPITAL / ADMIN)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'DONOR', 'HOSPITAL', 'ADMIN'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Donors Profile Table (Blood Group, Location & Cooldown Tracking)
CREATE TABLE donors (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    blood_group VARCHAR(10) NOT NULL, -- 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,      -- 'MALE', 'FEMALE', 'OTHER'
    city VARCHAR(100) NOT NULL,
    home_lat DOUBLE NOT NULL,
    home_lng DOUBLE NOT NULL,
    live_lat DOUBLE,
    live_lng DOUBLE,
    live_updated_at TIMESTAMP,
    share_live BOOLEAN DEFAULT TRUE,
    available BOOLEAN DEFAULT TRUE,
    last_donation_date DATE,
    total_donations INT DEFAULT 0,
    CONSTRAINT fk_donor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Hospitals Table (Clinical Facilities, Licensing & Verification)
CREATE TABLE hospitals (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    hospital_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    license_no VARCHAR(100) NOT NULL UNIQUE,
    verified BOOLEAN DEFAULT FALSE,
    contact_person VARCHAR(150),
    CONSTRAINT fk_hospital_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Blood Requests Table (Urgent Broadcasts Raised by Hospitals)
CREATE TABLE blood_requests (
    id VARCHAR(50) PRIMARY KEY,
    hospital_id VARCHAR(50) NOT NULL,
    hospital_name VARCHAR(150) NOT NULL,
    hospital_city VARCHAR(100) NOT NULL,
    lat DOUBLE NOT NULL,
    lng DOUBLE NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    units_needed INT NOT NULL,
    urgency VARCHAR(20) NOT NULL, -- 'CRITICAL', 'URGENT', 'NORMAL'
    patient_notes TEXT,
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'ACCEPTED', 'FULFILLED', 'EXPIRED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fulfilled_at TIMESTAMP,
    CONSTRAINT fk_request_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- 5. Request Responses Table (Donor Responses: NOTIFIED / ACCEPTED / DECLINED)
CREATE TABLE request_responses (
    id VARCHAR(50) PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL,
    donor_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'NOTIFIED', 'ACCEPTED', 'DECLINED'
    responded_at TIMESTAMP,
    CONSTRAINT fk_resp_request FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_resp_donor FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
);

-- 6. Donation History Table (Completed Verified Transfusions)
CREATE TABLE donation_history (
    id VARCHAR(50) PRIMARY KEY,
    donor_id VARCHAR(50) NOT NULL,
    request_id VARCHAR(50),
    hospital_id VARCHAR(50) NOT NULL,
    hospital_name VARCHAR(150) NOT NULL,
    donated_on DATE NOT NULL,
    units INT NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    notes TEXT,
    CONSTRAINT fk_history_donor FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
);

-- 7. Access Logs Table (Cryptographic Privacy Audit Trail - Section 6 & 10)
CREATE TABLE access_logs (
    id VARCHAR(50) PRIMARY KEY,
    hospital_id VARCHAR(50) NOT NULL,
    hospital_name VARCHAR(150) NOT NULL,
    donor_id VARCHAR(50) NOT NULL,
    donor_name VARCHAR(150) NOT NULL,
    request_id VARCHAR(50) NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
