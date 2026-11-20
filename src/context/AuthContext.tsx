import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Donor, Hospital, BloodGroup } from '../types';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

interface RegisterDonorData {
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  city: string;
  homeLat: number;
  homeLng: number;
  lastDonationDate: string | null;
  locationConsent: boolean;
}

interface RegisterHospitalData {
  name: string;
  email: string;
  phone: string;
  hospitalName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  licenseNo: string;
  contactPerson: string;
}

interface AuthContextType {
  user: User | null;
  donorProfile: Donor | null;
  hospitalProfile: Hospital | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  registerDonor: (data: RegisterDonorData) => Promise<{ success: boolean; message?: string }>;
  registerHospital: (data: RegisterHospitalData) => Promise<{ success: boolean; message?: string }>;
  refreshProfiles: () => void;
  switchPersona: (email: string) => void;
  updateLiveLocation: (lat: number, lng: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'bf_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [donorProfile, setDonorProfile] = useState<Donor | null>(null);
  const [hospitalProfile, setHospitalProfile] = useState<Hospital | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loadUser = (userId: string | null) => {
    if (!userId) {
      setUser(null);
      setDonorProfile(null);
      setHospitalProfile(null);
      setToken(null);
      return;
    }

    const foundUser = storageService.getUserById(userId);
    if (!foundUser) {
      localStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
      return;
    }

    setUser(foundUser);
    setToken(`jwt-token-${foundUser.id}-${Date.now()}`);

    if (foundUser.role === 'DONOR') {
      const donor = storageService.getDonorByUserId(foundUser.id);
      setDonorProfile(donor || null);
      setHospitalProfile(null);
    } else if (foundUser.role === 'HOSPITAL') {
      const hosp = storageService.getHospitalByUserId(foundUser.id);
      setHospitalProfile(hosp || null);
      setDonorProfile(null);
    } else {
      setDonorProfile(null);
      setHospitalProfile(null);
    }
  };

  useEffect(() => {
    // Only restore user if previously logged in by user
    const savedUserId = localStorage.getItem(AUTH_USER_KEY);
    if (savedUserId) {
      loadUser(savedUserId);
    }
  }, []);

  const refreshProfiles = () => {
    if (user) {
      loadUser(user.id);
    }
  };

  const login = async (email: string): Promise<{ success: boolean; message?: string }> => {
    const foundUser = storageService.getUserByEmail(email.trim());
    if (!foundUser) {
      return { success: false, message: 'No registered account found with that email address.' };
    }

    localStorage.setItem(AUTH_USER_KEY, foundUser.id);
    loadUser(foundUser.id);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setDonorProfile(null);
    setHospitalProfile(null);
    setToken(null);
  };

  const switchPersona = (email: string) => {
    const found = storageService.getUserByEmail(email);
    if (found) {
      localStorage.setItem(AUTH_USER_KEY, found.id);
      loadUser(found.id);
    }
  };

  const registerDonor = async (data: RegisterDonorData): Promise<{ success: boolean; message?: string }> => {
    if (storageService.getUserByEmail(data.email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const userId = `user-donor-${Date.now()}`;
    const donorId = `donor-${Date.now()}`;

    // 1. Direct persistence to backend H2 database
    try {
      const apiRes = await apiService.registerDonor({
        userId,
        donorId,
        ...data,
      });
      if (apiRes && apiRes.success) {
        console.log('[VitalPulse] Saved donor to H2 database:', apiRes);
      }
    } catch (err) {
      console.warn('[VitalPulse] H2 database sync notice:', err);
    }

    const newUser: User = {
      id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'DONOR',
      createdAt: new Date().toISOString(),
    };

    const newDonor: Donor = {
      id: donorId,
      userId,
      bloodGroup: data.bloodGroup,
      age: data.age,
      gender: data.gender,
      city: data.city,
      homeLat: data.homeLat,
      homeLng: data.homeLng,
      liveLat: data.homeLat,
      liveLng: data.homeLng,
      liveUpdatedAt: new Date().toISOString(),
      shareLive: data.locationConsent,
      available: true,
      lastDonationDate: data.lastDonationDate || null,
      totalDonations: data.lastDonationDate ? 1 : 0,
    };

    storageService.addUser(newUser);
    storageService.addDonor(newDonor);

    localStorage.setItem(AUTH_USER_KEY, newUser.id);
    loadUser(newUser.id);
    return { success: true };
  };

  const registerHospital = async (data: RegisterHospitalData): Promise<{ success: boolean; message?: string }> => {
    if (storageService.getUserByEmail(data.email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const userId = `user-hosp-${Date.now()}`;
    const hospitalId = `hosp-${Date.now()}`;

    // 1. Direct persistence to backend H2 database
    try {
      const apiRes = await apiService.registerHospital({
        userId,
        hospitalId,
        ...data,
      });
      if (apiRes && apiRes.success) {
        console.log('[VitalPulse] Saved hospital to H2 database:', apiRes);
      }
    } catch (err) {
      console.warn('[VitalPulse] H2 database sync notice:', err);
    }

    const newUser: User = {
      id: userId,
      name: data.name || data.hospitalName,
      email: data.email,
      phone: data.phone,
      role: 'HOSPITAL',
      createdAt: new Date().toISOString(),
    };

    const newHospital: Hospital = {
      id: hospitalId,
      userId,
      hospitalName: data.hospitalName,
      address: data.address,
      city: data.city,
      lat: data.lat,
      lng: data.lng,
      licenseNo: data.licenseNo,
      verified: false, // Requires Admin verification per Section 10
      contactPerson: data.contactPerson,
    };

    storageService.addUser(newUser);
    storageService.addHospital(newHospital);

    localStorage.setItem(AUTH_USER_KEY, newUser.id);
    loadUser(newUser.id);
    return { success: true };
  };

  const updateLiveLocation = (lat: number, lng: number) => {
    if (!donorProfile) return;
    const updated: Donor = {
      ...donorProfile,
      liveLat: lat,
      liveLng: lng,
      liveUpdatedAt: new Date().toISOString(),
    };
    storageService.updateDonor(updated);
    setDonorProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        donorProfile,
        hospitalProfile,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        login,
        logout,
        registerDonor,
        registerHospital,
        refreshProfiles,
        switchPersona,
        updateLiveLocation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
