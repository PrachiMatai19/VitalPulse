# VitalPulse – Emergency Blood Network

> **A Real-Time Emergency Blood Donation Grid & Clinical Matching Platform**  
> Full-Stack Architecture: React (Vite & Tailwind CSS) frontend with Spring Boot backend and embedded H2 Relational Database.

---

## 1. Problem Statement & System Overview

In medical emergencies—severe vehicular trauma accidents, critical bypass surgeries, and postpartum hemorrhages—hospitals and patient families face a life-or-death battle to locate compatible blood donors rapidly. Conventional methods rely on delayed phone trees, WhatsApp groups, and unstructured social media posts, resulting in critical delays.

**VitalPulse** bridges this gap by connecting verified healthcare institutions with eligible volunteer donors in real time, featuring an uncompromising **privacy-first architecture**:
1. **Clinical Compatibility Matching**: Automatic red blood cell matching based on ABO & Rh compatibility.
2. **Real-Time Emergency Toast Alerts**: Immediate interactive audio/visual alerts when a nearby hospital requests a donor's blood type.
3. **Privacy-Preserving Location Sharing**: Donor telephone numbers and precise coordinates remain completely masked until the donor explicitly accepts and authorizes location transmission.
4. **15-Minute GPS Freshness Check**: Uses fresh live GPS when active and authorized; otherwise automatically falls back to the donor's registered home city coordinates.
5. **90-Day Clinical Recovery Cooldown**: Protects donor health by enforcing a 90-day recovery period between donations with real-time countdown tracking.
6. **Compliance Audit Trail**: Every instance of medical personnel accessing donor details is recorded with timestamps in an audit log.
7. **24/7 National Emergency Helplines**: Indian national blood helpline (1910 - e-RaktKosh / Red Cross), toll-free 1800-180-1104, 104, and 112.

---

## 2. Platform Features

### A. Real-Time Alert & Action System
* **Emergency Match Toast Banners**: High-visibility glowing alert card alerting donors to nearby emergency blood requests.
* **Audio Alerts**: Clean, clinical two-tone synthesized medical chime (Web Audio API) with instant mute/unmute control.
* **"Review & Share Location" Action**: Opens an interactive modal to preview hospital distance, route time, clinical case notes, and choose between Live GPS or Registered Home coordinates.
* **1-Tap Quick Share**: Direct 1-tap accept button for immediate emergency dispatch.
* **Auto-Dismiss Timer**: 25-second linear progress bar that automatically pauses on mouse hover.
* **Navbar Live Feed Bell**: Interactive notification bell showing pending matches with a dropdown to review requests or simulate a live broadcast.

### B. Volunteer Donor Portal
* **Availability Switch**: Instantly toggle donation availability on or off.
* **Live GPS Controls**: Enable or pause live location transmission.
* **Incoming Match Cards**: Accept or decline emergency requests with proximity ranking.
* **Cooldown Tracker**: Visual recovery ring and countdown to the next safe donation date.
* **Personal Donation History**: Verified donation records, hospital names, dates, and units contributed.

### C. Hospital Emergency Console
* **Emergency Request Broadcast**: Raise urgent blood requests specifying blood group, units required (1–10), clinical urgency level (`CRITICAL`, `URGENT`, `NORMAL`), and patient trauma notes.
* **Live Matching Engine**: Automatically ranks eligible nearby donors by Haversine distance.
* **Interactive Map View**: Visualizes nearby hospital and donor coordinates.
* **Request Fulfillment**: Mark requests fulfilled, crediting donor history and restarting their 90-day cooldown.

### D. Admin Command & Compliance Center
* **Hospital Verification**: Review medical licenses (e.g. `MED-REG-XXXX`) and approve or reject healthcare facilities.
* **Donor Registry**: Master search, filter, and inspect registered donors across all blood groups.
* **Audit Trail (`access_logs`)**: Permanent log of which hospital accessed which donor's contact details and when.
* **Live Geographic Heatmap**: City-wide geographic density view of active requests and donor coverage.

### E. Clinical Compatibility Explorer
* Interactive transfusion compatibility tester for all 8 blood groups (`O-`, `O+`, `A-`, `A+`, `B-`, `B+`, `AB-`, `AB+`), highlighting universal donors (`O-`) and universal recipients (`AB+`).

---

## 3. Database Architecture & Local Access Guide

The platform uses an **embedded H2 Relational Database**. **You do NOT need to install MySQL, PostgreSQL, or any external database server.** H2 is a zero-install embedded Java SQL database.

### Database Connection Details
* **Database Engine**: H2 Database Engine (In-Memory / File Mode)
* **JDBC URL**: `jdbc:h2:mem:vitalpulse_db`
* **Driver Class**: `org.h2.Driver`
* **Username**: `sa`
* **Password**: *(leave blank / empty)*
* **Web Console Port**: `http://localhost:8080/h2-console`

### How to Open and Access the Database Locally:

1. **Start the backend server**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *(Or using the Maven wrapper: `./mvnw spring-boot:run`)*

2. **Open the Database GUI in any browser**:
   Navigate to:
   ```
   http://localhost:8080/h2-console
   ```

3. **Enter the Connection Parameters**:
   * **Saved Settings**: Generic H2 (Embedded)
   * **Setting Name**: Generic H2 (Embedded)
   * **Driver Class**: `org.h2.Driver`
   * **JDBC URL**: `jdbc:h2:mem:vitalpulse_db`
   * **User Name**: `sa`
   * **Password**: *(empty)*

4. **Click "Connect"**:
   You will access the full web-based database management interface. You can view tables, run SQL queries, inspect records, and test database operations:
   ```sql
   -- View all registered donors
   SELECT * FROM donors;

   -- Check active emergency blood requests
   SELECT * FROM blood_requests WHERE status = 'OPEN';

   -- Inspect privacy access logs
   SELECT * FROM access_logs ORDER BY viewed_at DESC;
   ```

5. **Connecting via External Database Tools (Optional)**:
   You can also connect desktop database clients (**DBeaver**, **IntelliJ Database Tool**, **DataGrip**, or **VS Code Database Client**) using the same JDBC URL: `jdbc:h2:mem:vitalpulse_db` with username `sa`.

---

## 4. Database Schema Table Reference

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `users` | User credentials & roles | `id`, `name`, `email`, `password_hash`, `phone`, `role` |
| `donors` | Donor medical profile & location | `id`, `user_id`, `blood_group`, `home_lat`, `home_lng`, `live_lat`, `share_live`, `available`, `last_donation_date` |
| `hospitals` | Hospital facility & licensing | `id`, `hospital_name`, `license_no`, `city`, `lat`, `lng`, `verified`, `contact_person` |
| `blood_requests` | Emergency blood broadcasts | `id`, `hospital_id`, `blood_group`, `units_needed`, `urgency`, `patient_notes`, `status` |
| `request_responses` | Donor response tracking | `id`, `request_id`, `donor_id`, `status` (`NOTIFIED`, `ACCEPTED`, `DECLINED`), `responded_at` |
| `access_logs` | Audit trail for privacy compliance | `id`, `hospital_id`, `donor_id`, `request_id`, `viewed_at` |
| `donation_history` | Verified donation record logs | `id`, `donor_id`, `hospital_id`, `units`, `blood_group`, `donated_on` |

---

## 5. Project Structure

```text
vitalpulse/
├── backend/                                      # Java Spring Boot Backend
│   ├── pom.xml                                   # Maven dependencies (H2, Web, JPA, Security, JWT)
│   └── src/main/
│       ├── java/com/bloodfinder/
│       │   └── BloodDonorFinderApplication.java  # Spring Boot Application Entry Point
│       └── resources/
│           ├── application.properties            # H2 in-memory URL, console config, JWT settings
│           ├── schema.sql                        # DDL table creation scripts
│           └── data.sql                          # Seed data for donors, hospitals, requests
│
├── src/                                          # Frontend React + TypeScript
│   ├── components/
│   │   ├── common/
│   │   │   ├── BrandLogo.tsx                     # Typographic logo component
│   │   │   ├── Navbar.tsx                        # Dynamic role-aware navigation & alert feed
│   │   │   ├── Footer.tsx                        # Indian national helplines & platform info
│   │   │   ├── RealtimeAlertToasts.tsx           # Interactive emergency match toast banners
│   │   │   └── BloodCompatibilityExplorer.tsx    # Interactive compatibility testing matrix
│   │   ├── donor/
│   │   │   ├── AvailabilityToggle.tsx            # Availability & GPS sharing toggle
│   │   │   ├── CooldownBanner.tsx                # 90-day cooldown countdown & recovery meter
│   │   │   ├── IncomingRequestCard.tsx           # Hospital match request action card
│   │   │   ├── LocationShareModal.tsx            # Live GPS vs Home coordinates consent popup
│   │   │   └── DonationHistoryTable.tsx          # Historical donation records table
│   │   ├── hospital/
│   │   │   ├── CreateRequestForm.tsx             # Raise urgent broadcast modal
│   │   │   ├── MatchedDonorList.tsx              # Distance-ranked eligible donor cards
│   │   │   └── DonorMap.tsx                      # Leaflet interactive map
│   │   └── admin/
│   │       ├── HospitalVerificationCard.tsx      # Facility medical license approval
│   │       └── AccessLogsTable.tsx               # Compliance audit trail viewer
│   ├── context/
│   │   ├── AuthContext.tsx                       # User authentication & demo accounts
│   │   └── ToastNotificationContext.tsx          # Real-time alert dispatching & modal triggers
│   ├── services/
│   │   └── storageService.ts                     # In-browser state, matching engine & event bus
│   ├── utils/
│   │   ├── bloodCompatibility.ts                 # Transfusion matrix & cooldown rules
│   │   ├── haversine.ts                          # Great-circle distance & travel time math
│   │   └── soundEffects.ts                       # Web Audio API emergency chime synthesis
│   ├── types/
│   │   └── index.ts                              # Core TypeScript data contracts
│   ├── App.tsx                                   # Root layout & view router
│   └── main.tsx                                  # Client entry point
├── public/                                       # Static assets
├── package.json                                  # Frontend npm dependencies
└── vite.config.ts                                # Vite development server configuration
```

---

## 6. How to Run Locally

### Frontend (React + Vite):
```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# The web application will be accessible at: http://localhost:3000
```

### Backend (Spring Boot + H2):
```bash
# 1. Navigate to backend directory
cd backend

# 2. Compile and run with Maven
mvn spring-boot:run

# The REST API will be accessible at: http://localhost:8080
# The H2 Database Console will be accessible at: http://localhost:8080/h2-console
```

---

## 7. Pre-Configured Test Accounts

Use these instant demo personas to test all system features:

| Role | Name | Email | Details |
| :--- | :--- | :--- | :--- |
| **Donor (Universal)** | Rahul Sharma | `rahul.donor@gmail.com` | `O-` Blood Group · Live GPS Active · Fully Eligible |
| **Donor (A+)** | Priya Patel | `priya.patel@outlook.com` | `A+` Blood Group · Accepted St. Jude Case |
| **Donor (Cooldown)** | Amit Verma | `amit.verma@yahoo.com` | `B+` Blood Group · Donated 35 days ago (In Cooldown) |
| **Hospital (Trauma)** | City Care Trauma | `er@citycare.org` | Verified Facility · Active O- Broadcast |
| **Hospital (Pediatric)**| St. Jude Hospital | `bloodbank@stjude-health.org`| Verified Facility |
| **Hospital (Pending)** | Metro Community | `admin@metro-clinic.org` | Pending License Verification |
| **Administrator** | Dr. Evelyn Reed | `admin@vitalpulse.org` | Chief Medical Officer & Compliance Authority |

---

## 8. License & Disclaimer
This project is engineered for emergency healthcare response education, demonstration, and clinical research. Real-world medical transfusions must always comply with certified serological cross-matching protocols and applicable national health regulations.
