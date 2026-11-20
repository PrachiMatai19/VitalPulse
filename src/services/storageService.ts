import {
  User,
  Donor,
  Hospital,
  BloodRequest,
  RequestResponse,
  DonationHistory,
  AccessLog,
  MatchedDonor,
  BloodGroup,
  UrgencyLevel,
  ResponseStatus,
} from '../types';
import { calculateDistance } from '../utils/haversine';
import { isBloodCompatible, calculateCooldown } from '../utils/bloodCompatibility';

const STORAGE_KEYS = {
  USERS: 'bf_users_v2',
  DONORS: 'bf_donors_v2',
  HOSPITALS: 'bf_hospitals_v2',
  REQUESTS: 'bf_requests_v2',
  RESPONSES: 'bf_responses_v2',
  DONATION_HISTORY: 'bf_history_v2',
  ACCESS_LOGS: 'bf_access_logs_v2',
};

// Default seed coordinates centered around metropolitan medical district
// Coordinates approx (12.9716, 77.5946 - Metro Bangalore / Urban Medical Corridor)
const BASE_LAT = 12.9716;
const BASE_LNG = 77.5946;

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Dr. Evelyn Reed (Chief Medical Officer)',
    email: 'admin@vitalpulse.org',
    phone: '+1 (555) 019-2831',
    role: 'ADMIN',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'user-hosp-1',
    name: 'City Care Trauma & Multi-Specialty',
    email: 'er@citycare.org',
    phone: '+1 (555) 234-8901',
    role: 'HOSPITAL',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'user-hosp-2',
    name: 'St. Jude Children & General Hospital',
    email: 'bloodbank@stjude-health.org',
    phone: '+1 (555) 456-7890',
    role: 'HOSPITAL',
    createdAt: '2026-02-01T11:30:00Z',
  },
  {
    id: 'user-hosp-3',
    name: 'Metropolitan Community Clinic',
    email: 'contact@metroclinic.med',
    phone: '+1 (555) 789-1234',
    role: 'HOSPITAL',
    createdAt: '2026-10-18T09:15:00Z',
  },
  {
    id: 'user-hosp-4',
    name: 'Apex Cardiac & Critical Care Institute',
    email: 'transfusion@apexcritical.med',
    phone: '+1 (555) 345-6789',
    role: 'HOSPITAL',
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'user-donor-1',
    name: 'Rahul Sharma',
    email: 'rahul.donor@gmail.com',
    phone: '+1 (555) 912-3456',
    role: 'DONOR',
    createdAt: '2026-03-01T14:20:00Z',
  },
  {
    id: 'user-donor-2',
    name: 'Priya Patel',
    email: 'priya.patel@outlook.com',
    phone: '+1 (555) 823-4567',
    role: 'DONOR',
    createdAt: '2026-04-12T16:00:00Z',
  },
  {
    id: 'user-donor-3',
    name: 'David Chen',
    email: 'david.chen@gmail.com',
    phone: '+1 (555) 734-5678',
    role: 'DONOR',
    createdAt: '2026-05-05T12:00:00Z',
  },
  {
    id: 'user-donor-4',
    name: 'Fatima Al-Mansoor',
    email: 'fatima.m@domain.org',
    phone: '+1 (555) 645-6789',
    role: 'DONOR',
    createdAt: '2026-06-20T09:45:00Z',
  },
  {
    id: 'user-donor-5',
    name: 'Amit Verma',
    email: 'amit.verma@techcorp.io',
    phone: '+1 (555) 556-7890',
    role: 'DONOR',
    createdAt: '2026-07-11T13:30:00Z',
  },
];

const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    userId: 'user-hosp-1',
    hospitalName: 'City Care Trauma & Multi-Specialty',
    address: '452 Healthcare Boulevard, Central District',
    city: 'Central Metro',
    lat: BASE_LAT + 0.012,
    lng: BASE_LNG - 0.008,
    licenseNo: 'MED-REG-89241-A',
    verified: true,
    contactPerson: 'Dr. Sarah Connor (Head of Blood Bank)',
  },
  {
    id: 'hosp-2',
    userId: 'user-hosp-2',
    hospitalName: 'St. Jude Children & General Hospital',
    address: '108 Hope Way, North Hills',
    city: 'North District',
    lat: BASE_LAT + 0.045,
    lng: BASE_LNG + 0.025,
    licenseNo: 'MED-REG-77312-B',
    verified: true,
    contactPerson: 'Nurse Supervisor Marcus Vance',
  },
  {
    id: 'hosp-3',
    userId: 'user-hosp-3',
    hospitalName: 'Metropolitan Community Clinic',
    address: '77 West Market Street',
    city: 'West Suburbs',
    lat: BASE_LAT - 0.038,
    lng: BASE_LNG - 0.042,
    licenseNo: 'CLINIC-PEND-90123',
    verified: false, // Pending Admin verification
    contactPerson: 'Dr. Anita Desai',
  },
  {
    id: 'hosp-4',
    userId: 'user-hosp-4',
    hospitalName: 'Apex Cardiac & Critical Care Institute',
    address: '320 Pulse Avenue, South Corridor',
    city: 'South Extension',
    lat: BASE_LAT - 0.025,
    lng: BASE_LNG + 0.022,
    licenseNo: 'MED-REG-55291-C',
    verified: true,
    contactPerson: 'Dr. Vikram Malhotra (Cardiology Chief)',
  },
];

// Helper to calculate minutes ago ISO string
const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60 * 1000).toISOString();
const daysAgoDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const INITIAL_DONORS: Donor[] = [
  {
    id: 'donor-1',
    userId: 'user-donor-1',
    bloodGroup: 'O-', // Universal donor!
    age: 28,
    gender: 'MALE',
    city: 'Central Metro',
    homeLat: BASE_LAT + 0.02,
    homeLng: BASE_LNG - 0.015,
    liveLat: BASE_LAT + 0.014, // Only 0.5 km from City Care
    liveLng: BASE_LNG - 0.009,
    liveUpdatedAt: minutesAgo(4), // 4 mins ago: Fresh!
    shareLive: true,
    available: true,
    lastDonationDate: daysAgoDate(110), // > 90 days ago -> Eligible!
    totalDonations: 6,
  },
  {
    id: 'donor-2',
    userId: 'user-donor-2',
    bloodGroup: 'A+',
    age: 32,
    gender: 'FEMALE',
    city: 'North District',
    homeLat: BASE_LAT + 0.048,
    homeLng: BASE_LNG + 0.028,
    liveLat: BASE_LAT + 0.09,
    liveLng: BASE_LNG + 0.08,
    liveUpdatedAt: minutesAgo(45), // 45 mins ago: Expired! Fallback to home location
    shareLive: true,
    available: true,
    lastDonationDate: daysAgoDate(125), // Eligible
    totalDonations: 4,
  },
  {
    id: 'donor-3',
    userId: 'user-donor-3',
    bloodGroup: 'B+',
    age: 24,
    gender: 'MALE',
    city: 'Central Metro',
    homeLat: BASE_LAT - 0.015,
    homeLng: BASE_LNG + 0.01,
    shareLive: false,
    available: true,
    lastDonationDate: daysAgoDate(35), // 35 days ago -> In cooldown (55 days left)
    totalDonations: 3,
  },
  {
    id: 'donor-4',
    userId: 'user-donor-4',
    bloodGroup: 'AB+', // Universal Recipient, can donate to AB+
    age: 29,
    gender: 'FEMALE',
    city: 'East Valley',
    homeLat: BASE_LAT + 0.005,
    homeLng: BASE_LNG + 0.035,
    liveLat: BASE_LAT + 0.018,
    liveLng: BASE_LNG + 0.022,
    liveUpdatedAt: minutesAgo(8), // Fresh
    shareLive: true,
    available: true,
    lastDonationDate: null, // First-time eligible
    totalDonations: 0,
  },
  {
    id: 'donor-5',
    userId: 'user-donor-5',
    bloodGroup: 'O+',
    age: 35,
    gender: 'MALE',
    city: 'South Extension',
    homeLat: BASE_LAT - 0.028,
    homeLng: BASE_LNG - 0.02,
    liveLat: BASE_LAT - 0.005,
    liveLng: BASE_LNG - 0.004,
    liveUpdatedAt: minutesAgo(2), // Very fresh
    shareLive: true,
    available: true,
    lastDonationDate: daysAgoDate(100), // Eligible
    totalDonations: 5,
  },
];

const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'req-1',
    hospitalId: 'hosp-1',
    hospitalName: 'City Care Trauma & Multi-Specialty',
    hospitalCity: 'Central Metro',
    lat: BASE_LAT + 0.012,
    lng: BASE_LNG - 0.008,
    bloodGroup: 'O-',
    unitsNeeded: 2,
    urgency: 'CRITICAL',
    patientNotes: 'Emergency ICU: Severe trauma victim following multi-vehicle highway collision. Massive hemorrhage requires immediate O- transfusion.',
    status: 'OPEN',
    createdAt: minutesAgo(25),
  },
  {
    id: 'req-2',
    hospitalId: 'hosp-2',
    hospitalName: 'St. Jude Children & General Hospital',
    hospitalCity: 'North District',
    lat: BASE_LAT + 0.045,
    lng: BASE_LNG + 0.025,
    bloodGroup: 'A+',
    unitsNeeded: 3,
    urgency: 'URGENT',
    patientNotes: 'Pediatric surgery scheduled tomorrow morning. Low platelet & RBC reserve.',
    status: 'ACCEPTED',
    createdAt: minutesAgo(120),
  },
  {
    id: 'req-3',
    hospitalId: 'hosp-3',
    hospitalName: 'Metropolitan Community Clinic',
    hospitalCity: 'West Suburbs',
    lat: BASE_LAT - 0.038,
    lng: BASE_LNG - 0.042,
    bloodGroup: 'B-',
    unitsNeeded: 4,
    urgency: 'CRITICAL',
    patientNotes: 'Maternal health ICU: Acute post-partum hemorrhage. Urgent need for rare B- whole blood.',
    status: 'OPEN',
    createdAt: minutesAgo(18),
  },
  {
    id: 'req-4',
    hospitalId: 'hosp-4',
    hospitalName: 'Apex Cardiac & Critical Care Institute',
    hospitalCity: 'South Extension',
    lat: BASE_LAT - 0.025,
    lng: BASE_LNG + 0.022,
    bloodGroup: 'O-',
    unitsNeeded: 3,
    urgency: 'CRITICAL',
    patientNotes: 'Emergency coronary artery bypass graft. Immediate red blood cells required.',
    status: 'OPEN',
    createdAt: minutesAgo(42),
  },
  {
    id: 'req-5',
    hospitalId: 'hosp-1',
    hospitalName: 'City Care Trauma & Multi-Specialty',
    hospitalCity: 'Central Metro',
    lat: BASE_LAT + 0.012,
    lng: BASE_LNG - 0.008,
    bloodGroup: 'AB-',
    unitsNeeded: 2,
    urgency: 'URGENT',
    patientNotes: 'Complex vascular repair post industrial accident. Cryoprecipitate and plasma standby.',
    status: 'OPEN',
    createdAt: minutesAgo(65),
  },
  {
    id: 'req-6',
    hospitalId: 'hosp-2',
    hospitalName: 'St. Jude Children & General Hospital',
    hospitalCity: 'North District',
    lat: BASE_LAT + 0.045,
    lng: BASE_LNG + 0.025,
    bloodGroup: 'O+',
    unitsNeeded: 2,
    urgency: 'NORMAL',
    patientNotes: 'Oncology ward pediatric replenishment scheduled transfusion.',
    status: 'OPEN',
    createdAt: minutesAgo(150),
  },
];

const INITIAL_RESPONSES: RequestResponse[] = [
  // Donor 1 notified for Request 1
  {
    id: 'resp-1',
    requestId: 'req-1',
    donorId: 'donor-1',
    status: 'NOTIFIED',
    respondedAt: undefined,
  },
  // Donor 2 accepted Request 2
  {
    id: 'resp-2',
    requestId: 'req-2',
    donorId: 'donor-2',
    status: 'ACCEPTED',
    respondedAt: minutesAgo(50),
  },
];

const INITIAL_DONATION_HISTORY: DonationHistory[] = [
  {
    id: 'hist-1',
    donorId: 'donor-1',
    requestId: null,
    hospitalId: 'hosp-1',
    hospitalName: 'City Care Trauma & Multi-Specialty',
    donatedOn: daysAgoDate(110),
    units: 1,
    bloodGroup: 'O-',
    notes: 'Voluntary whole blood donation drive. Platelet count excellent.',
  },
  {
    id: 'hist-2',
    donorId: 'donor-2',
    requestId: null,
    hospitalId: 'hosp-2',
    hospitalName: 'St. Jude Children & General Hospital',
    donatedOn: daysAgoDate(125),
    units: 1,
    bloodGroup: 'A+',
    notes: 'Emergency replacement donation for elective cardiac procedure.',
  },
  {
    id: 'hist-3',
    donorId: 'donor-3',
    requestId: null,
    hospitalId: 'hosp-1',
    hospitalName: 'City Care Trauma & Multi-Specialty',
    donatedOn: daysAgoDate(35),
    units: 1,
    bloodGroup: 'B+',
    notes: 'Emergency trauma response donation.',
  },
];

const INITIAL_ACCESS_LOGS: AccessLog[] = [
  {
    id: 'log-1',
    hospitalId: 'hosp-2',
    hospitalName: 'St. Jude Children & General Hospital',
    donorId: 'donor-2',
    donorName: 'Priya Patel',
    requestId: 'req-2',
    viewedAt: minutesAgo(48),
  },
];

class StorageService {
  private get<T>(key: string, defaultVal: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      }
      return JSON.parse(item);
    } catch {
      return defaultVal;
    }
  }

  private set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  }

  public resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(INITIAL_DONORS));
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(INITIAL_HOSPITALS));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(INITIAL_RESPONSES));
    localStorage.setItem(STORAGE_KEYS.DONATION_HISTORY, JSON.stringify(INITIAL_DONATION_HISTORY));
    localStorage.setItem(STORAGE_KEYS.ACCESS_LOGS, JSON.stringify(INITIAL_ACCESS_LOGS));
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    const users = this.getUsers();
    return (
      users.find((u) => u.email.toLowerCase() === normalized) ||
      (normalized === 'admin@vitalpulse.org' || normalized === 'admin@bloodfinder.org'
        ? users.find((u) => u.role === 'ADMIN')
        : undefined)
    );
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.set(STORAGE_KEYS.USERS, users);
  }

  // --- Donors ---
  public getDonors(): Donor[] {
    return this.get<Donor[]>(STORAGE_KEYS.DONORS, INITIAL_DONORS);
  }

  public getDonorByUserId(userId: string): Donor | undefined {
    return this.getDonors().find((d) => d.userId === userId);
  }

  public getDonorById(id: string): Donor | undefined {
    return this.getDonors().find((d) => d.id === id);
  }

  public updateDonor(updatedDonor: Donor): void {
    const donors = this.getDonors();
    const idx = donors.findIndex((d) => d.id === updatedDonor.id);
    if (idx !== -1) {
      donors[idx] = updatedDonor;
      this.set(STORAGE_KEYS.DONORS, donors);
    }
  }

  public addDonor(donor: Donor): void {
    const donors = this.getDonors();
    donors.push(donor);
    this.set(STORAGE_KEYS.DONORS, donors);
  }

  // --- Hospitals ---
  public getHospitals(): Hospital[] {
    const list = this.get<Hospital[]>(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    if (list.length < INITIAL_HOSPITALS.length) {
      const merged = [...list];
      INITIAL_HOSPITALS.forEach((h) => {
        if (!merged.some((item) => item.id === h.id)) {
          merged.push(h);
        }
      });
      this.set(STORAGE_KEYS.HOSPITALS, merged);
      return merged;
    }
    return list;
  }

  public getHospitalByUserId(userId: string): Hospital | undefined {
    return this.getHospitals().find((h) => h.userId === userId);
  }

  public getHospitalById(id: string): Hospital | undefined {
    return this.getHospitals().find((h) => h.id === id);
  }

  public updateHospital(updated: Hospital): void {
    const list = this.getHospitals();
    const idx = list.findIndex((h) => h.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.set(STORAGE_KEYS.HOSPITALS, list);
    }
  }

  public addHospital(h: Hospital): void {
    const list = this.getHospitals();
    list.push(h);
    this.set(STORAGE_KEYS.HOSPITALS, list);
  }

  // --- Blood Requests ---
  public getRequests(): BloodRequest[] {
    const list = this.get<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    if (list.length < INITIAL_REQUESTS.length) {
      const merged = [...list];
      INITIAL_REQUESTS.forEach((req) => {
        if (!merged.some((item) => item.id === req.id)) {
          merged.push(req);
        }
      });
      this.set(STORAGE_KEYS.REQUESTS, merged);
      return merged;
    }
    return list;
  }

  public getRequestById(id: string): BloodRequest | undefined {
    return this.getRequests().find((r) => r.id === id);
  }

  public addRequest(req: BloodRequest): void {
    const list = this.getRequests();
    list.unshift(req);
    this.set(STORAGE_KEYS.REQUESTS, list);

    // Automatically trigger notification creation for matching donors
    this.notifyMatchingDonors(req);

    // Dispatch real-time custom event so all active components/subscribers receive it immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('vitalpulse:blood-request-created', {
          detail: { request: req },
        })
      );
    }
  }

  public simulateEmergencyBroadcast(preferredBloodGroup?: BloodGroup): BloodRequest {
    const hospitals = this.getHospitals();
    const verifiedHospitals = hospitals.filter((h) => h.verified);
    const selectedHospital = verifiedHospitals.length > 0
      ? verifiedHospitals[Math.floor(Math.random() * verifiedHospitals.length)]
      : hospitals[0];

    const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    const chosenBloodGroup = preferredBloodGroup || bloodGroups[Math.floor(Math.random() * bloodGroups.length)];

    const notesList = [
      'Emergency Trauma ICU: Incoming vehicular accident with internal hemorrhaging. Immediate blood required.',
      'Cardiac Surgery OT: Acute coronary bypass surgical complications. High urgency transfusion requested.',
      'Emergency Obstetric Unit: Critical postpartum maternal hemorrhage. Transfusion units urgently dispatched.',
      'Surgical ICU Ward: Multiple trauma emergency stabilization. Available volunteer donor requested within 15 km.',
      'Pediatric Emergency: Severe pediatric anemia crisis with rapid hematocrit drop. Universal or exact match needed.'
    ];

    const randomNote = notesList[Math.floor(Math.random() * notesList.length)];

    const simulatedRequest: BloodRequest = {
      id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.hospitalName,
      hospitalCity: selectedHospital.city,
      lat: selectedHospital.lat,
      lng: selectedHospital.lng,
      bloodGroup: chosenBloodGroup,
      unitsNeeded: Math.floor(Math.random() * 3) + 2, // 2 to 4 units
      urgency: 'CRITICAL',
      patientNotes: randomNote,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    this.addRequest(simulatedRequest);
    return simulatedRequest;
  }

  public updateRequest(updated: BloodRequest): void {
    const list = this.getRequests();
    const idx = list.findIndex((r) => r.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.set(STORAGE_KEYS.REQUESTS, list);
    }
  }

  // --- Responses ---
  public getResponses(): RequestResponse[] {
    return this.get<RequestResponse[]>(STORAGE_KEYS.RESPONSES, INITIAL_RESPONSES);
  }

  public getResponse(requestId: string, donorId: string): RequestResponse | undefined {
    return this.getResponses().find((r) => r.requestId === requestId && r.donorId === donorId);
  }

  public setResponseStatus(requestId: string, donorId: string, status: ResponseStatus): void {
    const responses = this.getResponses();
    const existing = responses.find((r) => r.requestId === requestId && r.donorId === donorId);
    if (existing) {
      existing.status = status;
      existing.respondedAt = new Date().toISOString();
    } else {
      responses.push({
        id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requestId,
        donorId,
        status,
        respondedAt: new Date().toISOString(),
      });
    }
    this.set(STORAGE_KEYS.RESPONSES, responses);

    // If an acceptance occurs, update request status to ACCEPTED if it was OPEN
    if (status === 'ACCEPTED') {
      const req = this.getRequestById(requestId);
      if (req && req.status === 'OPEN') {
        req.status = 'ACCEPTED';
        this.updateRequest(req);
      }
    }
  }

  // --- Donation History ---
  public getDonationHistory(donorId?: string): DonationHistory[] {
    const all = this.get<DonationHistory[]>(STORAGE_KEYS.DONATION_HISTORY, INITIAL_DONATION_HISTORY);
    if (donorId) {
      return all.filter((h) => h.donorId === donorId);
    }
    return all;
  }

  public addDonationHistory(record: DonationHistory): void {
    const list = this.getDonationHistory();
    list.unshift(record);
    this.set(STORAGE_KEYS.DONATION_HISTORY, list);
  }

  // --- Access Logs (Privacy & Accountability) ---
  public getAccessLogs(): AccessLog[] {
    return this.get<AccessLog[]>(STORAGE_KEYS.ACCESS_LOGS, INITIAL_ACCESS_LOGS);
  }

  public logAccess(hospitalId: string, hospitalName: string, donorId: string, donorName: string, requestId: string): void {
    const logs = this.getAccessLogs();
    logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      hospitalId,
      hospitalName,
      donorId,
      donorName,
      requestId,
      viewedAt: new Date().toISOString(),
    });
    // Keep last 100 logs
    this.set(STORAGE_KEYS.ACCESS_LOGS, logs.slice(0, 100));
  }

  // --- Matching Engine Logic (Section 4 & 6) ---
  /**
   * Matches compatible, eligible, and available donors for a given BloodRequest.
   * Resolves privacy model:
   * - Donors who have NOT accepted yet: contact info & exact coordinates are MASKED.
   * - Donors who HAVE accepted: full details revealed.
   */
  public matchDonorsForRequest(request: BloodRequest): MatchedDonor[] {
    const donors = this.getDonors();
    const users = this.getUsers();
    const responses = this.getResponses();

    const matched: MatchedDonor[] = [];

    for (const donor of donors) {
      // 1. Must be set available
      if (!donor.available) continue;

      // 2. Compatibility check
      if (!isBloodCompatible(donor.bloodGroup, request.bloodGroup)) continue;

      // 3. Cooldown check
      const cooldown = calculateCooldown(donor.lastDonationDate);
      if (!cooldown.isEligible) continue;

      // 4. Location determination & freshness check (Section 6)
      // Freshness rule: if live location is <= 15 minutes old and shareLive is true, use live; else fallback to home.
      let effectiveLat = donor.homeLat;
      let effectiveLng = donor.homeLng;
      let locationSource: 'LIVE' | 'HOME' = 'HOME';
      let isLiveFresh = false;

      if (donor.shareLive && donor.liveLat && donor.liveLng && donor.liveUpdatedAt) {
        const updateAgeMs = Date.now() - new Date(donor.liveUpdatedAt).getTime();
        const fifteenMinutesMs = 15 * 60 * 1000;
        if (updateAgeMs <= fifteenMinutesMs) {
          effectiveLat = donor.liveLat;
          effectiveLng = donor.liveLng;
          locationSource = 'LIVE';
          isLiveFresh = true;
        }
      }

      // 5. Calculate Haversine distance
      const distanceKm = calculateDistance(request.lat, request.lng, effectiveLat, effectiveLng);

      // Check donor response status for this request
      const response = responses.find((r) => r.requestId === request.id && r.donorId === donor.id);
      const responseStatus: ResponseStatus = response ? response.status : 'NOTIFIED';
      const hasAccepted = responseStatus === 'ACCEPTED';

      const user = users.find((u) => u.id === donor.userId);

      // Build matched donor DTO with Privacy Awareness (Section 6 & 10)
      const matchedDonor: MatchedDonor = {
        donorId: donor.id,
        userId: donor.userId,
        bloodGroup: donor.bloodGroup,
        age: donor.age,
        gender: donor.gender,
        distanceKm,
        locationSource,
        isLiveFresh,
        responseStatus,
        hasAccepted,
      };

      if (hasAccepted && user) {
        // REVEAL exact details only after acceptance
        matchedDonor.name = user.name;
        matchedDonor.phone = user.phone;
        matchedDonor.email = user.email;
        matchedDonor.lat = effectiveLat;
        matchedDonor.lng = effectiveLng;
        matchedDonor.city = donor.city;
      }

      matched.push(matchedDonor);
    }

    // Sort by distance ascending
    return matched.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /**
   * Helper called when a new request is created: notifies all compatible donors
   */
  private notifyMatchingDonors(request: BloodRequest): void {
    const donors = this.getDonors();
    const responses = this.getResponses();

    for (const donor of donors) {
      if (!donor.available) continue;
      if (!isBloodCompatible(donor.bloodGroup, request.bloodGroup)) continue;
      if (!calculateCooldown(donor.lastDonationDate).isEligible) continue;

      const exists = responses.some((r) => r.requestId === request.id && r.donorId === donor.id);
      if (!exists) {
        responses.push({
          id: `resp-${Date.now()}-${donor.id}`,
          requestId: request.id,
          donorId: donor.id,
          status: 'NOTIFIED',
        });
      }
    }
    this.set(STORAGE_KEYS.RESPONSES, responses);
  }

  /**
   * Fulfill a request:
   * 1. Marks request status FULFILLED
   * 2. Adds to donation_history for the accepting donor(s)
   * 3. Updates donor's lastDonationDate to today, restarting cooldown!
   */
  public fulfillRequest(requestId: string, donorId: string, notes?: string): boolean {
    const request = this.getRequestById(requestId);
    const donor = this.getDonorById(donorId);
    if (!request || !donor) return false;

    const todayStr = new Date().toISOString().split('T')[0];

    // Mark request fulfilled
    request.status = 'FULFILLED';
    request.fulfilledAt = new Date().toISOString();
    this.updateRequest(request);

    // Update donor cooldown & total donations
    donor.lastDonationDate = todayStr;
    donor.totalDonations = (donor.totalDonations || 0) + 1;
    this.updateDonor(donor);

    // Record in donation_history table
    this.addDonationHistory({
      id: `hist-${Date.now()}`,
      donorId: donor.id,
      requestId: request.id,
      hospitalId: request.hospitalId,
      hospitalName: request.hospitalName,
      donatedOn: todayStr,
      units: request.unitsNeeded,
      bloodGroup: request.bloodGroup,
      notes: notes || `Fulfilled urgent request for ${request.hospitalName}`,
    });

    return true;
  }
}

export const storageService = new StorageService();
