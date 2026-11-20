package com.bloodfinder.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ApiController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "VitalPulse Emergency Blood Network Backend");
        status.put("status", "UP");
        status.put("database", "H2 Embedded In-Memory");
        status.put("jdbcUrl", "jdbc:h2:mem:vitalpulse_db");
        status.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(status);
    }

    @PostMapping("/register/donor")
    public ResponseEntity<Map<String, Object>> registerDonor(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = (String) payload.get("email");
            if (email == null || email.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email address is required.");
                return ResponseEntity.badRequest().body(response);
            }
            email = email.trim().toLowerCase();

            // Check if email already registered
            Integer existingCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE LOWER(email) = ?",
                Integer.class,
                email
            );
            if (existingCount != null && existingCount > 0) {
                response.put("success", false);
                response.put("message", "An account with email " + email + " is already registered.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            String userId = payload.containsKey("userId") && payload.get("userId") != null 
                ? (String) payload.get("userId") 
                : "user-donor-" + UUID.randomUUID().toString().substring(0, 8);
            String donorId = payload.containsKey("donorId") && payload.get("donorId") != null 
                ? (String) payload.get("donorId") 
                : "donor-" + UUID.randomUUID().toString().substring(0, 8);

            String name = (String) payload.getOrDefault("name", "Volunteer Donor");
            String phone = (String) payload.getOrDefault("phone", "+91 9876543210");
            String passwordHash = "$2a$10$demoHashForVitalPulseDonorAccount123456789";

            // 1. Insert into users table
            jdbcTemplate.update(
                "INSERT INTO users (id, name, email, password_hash, phone, role, created_at) VALUES (?, ?, ?, ?, ?, 'DONOR', CURRENT_TIMESTAMP)",
                userId, name, email, passwordHash, phone
            );

            // 2. Extract donor medical profile parameters
            String bloodGroup = (String) payload.getOrDefault("bloodGroup", "O+");
            Integer age = payload.get("age") instanceof Number ? ((Number) payload.get("age")).intValue() : 25;
            String gender = (String) payload.getOrDefault("gender", "OTHER");
            String city = (String) payload.getOrDefault("city", "Bangalore");
            Double homeLat = payload.get("homeLat") instanceof Number ? ((Number) payload.get("homeLat")).doubleValue() : 12.9716;
            Double homeLng = payload.get("homeLng") instanceof Number ? ((Number) payload.get("homeLng")).doubleValue() : 77.5946;
            Boolean shareLive = payload.containsKey("locationConsent") ? Boolean.valueOf(payload.get("locationConsent").toString()) : true;
            String lastDonationDate = (String) payload.get("lastDonationDate");
            int totalDonations = (lastDonationDate != null && !lastDonationDate.trim().isEmpty()) ? 1 : 0;

            // 3. Insert into donors table
            jdbcTemplate.update(
                "INSERT INTO donors (id, user_id, blood_group, age, gender, city, home_lat, home_lng, live_lat, live_lng, live_updated_at, share_live, available, last_donation_date, total_donations) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, TRUE, ?, ?)",
                donorId, userId, bloodGroup, age, gender, city, homeLat, homeLng, homeLat, homeLng, shareLive,
                (lastDonationDate != null && !lastDonationDate.isEmpty() ? java.sql.Date.valueOf(lastDonationDate) : null),
                totalDonations
            );

            response.put("success", true);
            response.put("message", "Donor registered successfully and saved to H2 database!");
            response.put("userId", userId);
            response.put("donorId", donorId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/register/hospital")
    public ResponseEntity<Map<String, Object>> registerHospital(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = (String) payload.get("email");
            if (email == null || email.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email address is required.");
                return ResponseEntity.badRequest().body(response);
            }
            email = email.trim().toLowerCase();

            Integer existingCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE LOWER(email) = ?",
                Integer.class,
                email
            );
            if (existingCount != null && existingCount > 0) {
                response.put("success", false);
                response.put("message", "An account with email " + email + " is already registered.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            String userId = payload.containsKey("userId") && payload.get("userId") != null 
                ? (String) payload.get("userId") 
                : "user-hosp-" + UUID.randomUUID().toString().substring(0, 8);
            String hospitalId = payload.containsKey("hospitalId") && payload.get("hospitalId") != null 
                ? (String) payload.get("hospitalId") 
                : "hosp-" + UUID.randomUUID().toString().substring(0, 8);

            String hospitalName = (String) payload.getOrDefault("hospitalName", "Healthcare Facility");
            String contactPerson = (String) payload.getOrDefault("contactPerson", "Emergency Coordinator");
            String phone = (String) payload.getOrDefault("phone", "+91 9876543210");
            String passwordHash = "$2a$10$demoHashForVitalPulseHospitalAccount123456789";

            // 1. Insert into users table
            jdbcTemplate.update(
                "INSERT INTO users (id, name, email, password_hash, phone, role, created_at) VALUES (?, ?, ?, ?, ?, 'HOSPITAL', CURRENT_TIMESTAMP)",
                userId, hospitalName, email, passwordHash, phone
            );

            // 2. Extract hospital facility parameters
            String address = (String) payload.getOrDefault("address", "Medical Corridor");
            String city = (String) payload.getOrDefault("city", "Bangalore");
            Double lat = payload.get("lat") instanceof Number ? ((Number) payload.get("lat")).doubleValue() : 12.9716;
            Double lng = payload.get("lng") instanceof Number ? ((Number) payload.get("lng")).doubleValue() : 77.5946;
            String licenseNo = (String) payload.getOrDefault("licenseNo", "MED-REG-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());

            // 3. Insert into hospitals table
            jdbcTemplate.update(
                "INSERT INTO hospitals (id, user_id, hospital_name, address, city, lat, lng, license_no, verified, contact_person) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?)",
                hospitalId, userId, hospitalName, address, city, lat, lng, licenseNo, contactPerson
            );

            response.put("success", true);
            response.put("message", "Hospital registered successfully and saved to H2 database! Pending verification.");
            response.put("userId", userId);
            response.put("hospitalId", hospitalId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/requests")
    public ResponseEntity<Map<String, Object>> createRequest(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String requestId = payload.containsKey("id") && payload.get("id") != null 
                ? (String) payload.get("id") 
                : "req-" + UUID.randomUUID().toString().substring(0, 8);
            String hospitalId = (String) payload.getOrDefault("hospitalId", "hosp-1");
            String hospitalName = (String) payload.getOrDefault("hospitalName", "Emergency Medical Center");
            String hospitalCity = (String) payload.getOrDefault("hospitalCity", "Bangalore");
            Double lat = payload.get("lat") instanceof Number ? ((Number) payload.get("lat")).doubleValue() : 12.9716;
            Double lng = payload.get("lng") instanceof Number ? ((Number) payload.get("lng")).doubleValue() : 77.5946;
            String bloodGroup = (String) payload.getOrDefault("bloodGroup", "O-");
            Integer unitsNeeded = payload.get("unitsNeeded") instanceof Number ? ((Number) payload.get("unitsNeeded")).intValue() : 2;
            String urgency = (String) payload.getOrDefault("urgency", "CRITICAL");
            String patientNotes = (String) payload.getOrDefault("patientNotes", "Emergency blood request");

            jdbcTemplate.update(
                "INSERT INTO blood_requests (id, hospital_id, hospital_name, hospital_city, lat, lng, blood_group, units_needed, urgency, patient_notes, status, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', CURRENT_TIMESTAMP)",
                requestId, hospitalId, hospitalName, hospitalCity, lat, lng, bloodGroup, unitsNeeded, urgency, patientNotes
            );

            response.put("success", true);
            response.put("id", requestId);
            response.put("message", "Blood request broadcast saved to H2 database.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/audit-logs")
    public ResponseEntity<Map<String, Object>> logAccess(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String logId = "log-" + UUID.randomUUID().toString().substring(0, 8);
            String hospitalId = (String) payload.getOrDefault("hospitalId", "hosp-1");
            String hospitalName = (String) payload.getOrDefault("hospitalName", "Hospital Facility");
            String donorId = (String) payload.getOrDefault("donorId", "donor-1");
            String donorName = (String) payload.getOrDefault("donorName", "Donor");
            String requestId = (String) payload.getOrDefault("requestId", "req-1");

            jdbcTemplate.update(
                "INSERT INTO access_logs (id, hospital_id, hospital_name, donor_id, donor_name, request_id, viewed_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
                logId, hospitalId, hospitalName, donorId, donorName, requestId
            );

            response.put("success", true);
            response.put("id", logId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Database error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/donors")
    public ResponseEntity<List<Map<String, Object>>> getDonors() {
        String sql = "SELECT d.id, d.user_id, u.name, u.email, u.phone, d.blood_group, d.age, d.gender, d.city, d.home_lat, d.home_lng, d.share_live, d.available, d.last_donation_date, d.total_donations " +
                     "FROM donors d JOIN users u ON d.user_id = u.id ORDER BY d.id DESC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    @GetMapping("/hospitals")
    public ResponseEntity<List<Map<String, Object>>> getHospitals() {
        String sql = "SELECT h.id, h.user_id, u.name, u.email, u.phone, h.hospital_name, h.address, h.city, h.lat, h.lng, h.license_no, h.verified, h.contact_person " +
                     "FROM hospitals h JOIN users u ON h.user_id = u.id ORDER BY h.id DESC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<Map<String, Object>>> getRequests() {
        String sql = "SELECT * FROM blood_requests ORDER BY created_at DESC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs() {
        String sql = "SELECT * FROM access_logs ORDER BY viewed_at DESC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("users", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class));
        stats.put("donors", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM donors", Integer.class));
        stats.put("hospitals", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM hospitals", Integer.class));
        stats.put("bloodRequests", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM blood_requests", Integer.class));
        stats.put("accessLogs", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM access_logs", Integer.class));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        String sql = "SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetDatabase() {
        Map<String, Object> response = new HashMap<>();
        try {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(new ClassPathResource("schema.sql"));
            populator.addScript(new ClassPathResource("data.sql"));
            populator.execute(dataSource);

            response.put("success", true);
            response.put("message", "H2 Database successfully reset to initial schema and seed data!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to reset H2 database: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
