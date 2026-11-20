/**
 * Core Data Models and Types for VitalPulse Emergency Blood Network
 * Based on Section 7 (Database Design) and Section 8 (REST API Endpoints)
 */

export type Role = 'DONOR' | 'HOSPITAL' | 'ADMIN';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type RequestStatus = 'OPEN' | 'ACCEPTED' | 'FULFILLED' | 'EXPIRED';

export type ResponseStatus = 'NOTIFIED' | 'ACCEPTED' | 'DECLINED';

export type UrgencyLevel = 'CRITICAL' | 'URGENT' | 'NORMAL';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
}

export interface Donor {
  id: string;
  userId: string;
  bloodGroup: BloodGroup;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  city: string;
  homeLat: number;
  homeLng: number;
  liveLat?: number;
  liveLng?: number;
  liveUpdatedAt?: string;
  shareLive: boolean;
  available: boolean;
  lastDonationDate: string | null; // ISO Date string (YYYY-MM-DD)
  totalDonations: number;
}

export interface Hospital {
  id: string;
  userId: string;
  hospitalName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  licenseNo: string;
  verified: boolean;
  contactPerson: string;
}

export interface BloodRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalCity: string;
  lat: number;
  lng: number;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgency: UrgencyLevel;
  patientNotes?: string;
  status: RequestStatus;
  createdAt: string;
  fulfilledAt?: string;
}

export interface RequestResponse {
  id: string;
  requestId: string;
  donorId: string;
  status: ResponseStatus;
  respondedAt?: string;
}

export interface DonationHistory {
  id: string;
  donorId: string;
  requestId: string | null;
  hospitalId: string;
  hospitalName: string;
  donatedOn: string;
  units: number;
  bloodGroup: BloodGroup;
  notes?: string;
}

export interface AccessLog {
  id: string;
  hospitalId: string;
  hospitalName: string;
  donorId: string;
  donorName: string;
  requestId: string;
  viewedAt: string;
}

export interface MatchedDonor {
  donorId: string;
  userId: string;
  bloodGroup: BloodGroup;
  age: number;
  gender: string;
  distanceKm: number;
  locationSource: 'LIVE' | 'HOME';
  isLiveFresh: boolean;
  responseStatus: ResponseStatus;
  hasAccepted: boolean;
  // Contact & Exact coords revealed ONLY if hasAccepted === true (Privacy Protection)
  name?: string;
  phone?: string;
  email?: string;
  lat?: number;
  lng?: number;
  city?: string;
}

export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface DonorAchievement {
  id: string;
  title: string;
  tagline: string;
  description: string;
  clinicalImpact: string;
  category: 'DONATION' | 'EMERGENCY' | 'CONSISTENCY' | 'COMMUNITY';
  tier: AchievementTier;
  unlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    target: number;
    unit: string;
  };
  iconName: string;
  badgeColor: string;
}
