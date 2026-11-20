const BACKEND_URL = 'http://localhost:8080/api';

export const apiService = {
  async registerDonor(data: {
    userId?: string;
    donorId?: string;
    name: string;
    email: string;
    phone: string;
    bloodGroup: string;
    age: number;
    gender: string;
    city: string;
    homeLat: number;
    homeLng: number;
    lastDonationDate: string | null;
    locationConsent: boolean;
  }): Promise<{ success: boolean; message?: string; userId?: string; donorId?: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/register/donor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (err: any) {
      console.warn('[VitalPulse] Backend API unreachable, falling back to client storage:', err);
      return { success: false, message: 'Backend unreachable: ' + (err?.message || 'Network error') };
    }
  },

  async registerHospital(data: {
    userId?: string;
    hospitalId?: string;
    name?: string;
    email: string;
    phone: string;
    hospitalName: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
    licenseNo: string;
    contactPerson: string;
  }): Promise<{ success: boolean; message?: string; userId?: string; hospitalId?: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/register/hospital`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (err: any) {
      console.warn('[VitalPulse] Backend API unreachable, falling back to client storage:', err);
      return { success: false, message: 'Backend unreachable: ' + (err?.message || 'Network error') };
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/status`, { signal: AbortSignal.timeout(2000) });
      return response.ok;
    } catch {
      return false;
    }
  },

  async getDonors(): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/donors`);
      if (response.ok) return await response.json();
      return [];
    } catch {
      return [];
    }
  },

  async getHospitals(): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/hospitals`);
      if (response.ok) return await response.json();
      return [];
    } catch {
      return [];
    }
  },

  async getStats(): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/stats`);
      if (response.ok) return await response.json();
      return null;
    } catch {
      return null;
    }
  },

  async getUsers(): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/users`);
      if (response.ok) return await response.json();
      return [];
    } catch {
      return [];
    }
  },

  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/reset`, { method: 'POST' });
      if (response.ok) return await response.json();
      return { success: false, message: 'Reset failed' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },
};

