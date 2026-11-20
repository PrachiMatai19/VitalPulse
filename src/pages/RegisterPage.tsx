import React, { useState } from 'react';
import {
  Heart,
  Building2,
  Droplet,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Lock,
} from 'lucide-react';
import { BloodGroup } from '../types';
import { useAuth } from '../context/AuthContext';
import { PhoneInputWithCountry } from '../components/common/PhoneInputWithCountry';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { registerDonor, registerHospital } = useAuth();
  const [tab, setTab] = useState<'DONOR' | 'HOSPITAL'>('DONOR');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Donor form state
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [isDonorPhoneValid, setIsDonorPhoneValid] = useState(false);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [city, setCity] = useState('Central Metro');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [locationConsent, setLocationConsent] = useState(true);

  // Hospital form state
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [isHospitalPhoneValid, setIsHospitalPhoneValid] = useState(false);
  const [address, setAddress] = useState('');
  const [hospitalCity, setHospitalCity] = useState('Central Metro');
  const [licenseNo, setLicenseNo] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!locationConsent) {
      setError('Location consent is required to participate in emergency proximity matching.');
      return;
    }

    if (!donorPhone || !isDonorPhoneValid) {
      setError('Please provide a valid phone number conforming to the selected country regex pattern.');
      return;
    }

    setLoading(true);
    // Standard central coordinates with minor jitter for realistic map distribution
    const jitterLat = 12.9716 + (Math.random() - 0.5) * 0.05;
    const jitterLng = 77.5946 + (Math.random() - 0.5) * 0.05;

    const res = await registerDonor({
      name: donorName,
      email: donorEmail,
      phone: donorPhone,
      bloodGroup,
      age: Number(age),
      gender,
      city,
      homeLat: jitterLat,
      homeLng: jitterLng,
      lastDonationDate: lastDonationDate || null,
      locationConsent,
    });

    setLoading(false);
    if (res.success) {
      setSuccess('Donor registration successful! Redirecting to your dashboard...');
      setTimeout(() => onNavigate('donor-dashboard'), 1000);
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  const handleRegisterHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!hospitalPhone || !isHospitalPhoneValid) {
      setError('Please provide a valid emergency hotline phone conforming to the selected country regex pattern.');
      return;
    }

    setLoading(true);

    const jitterLat = 12.9716 + (Math.random() - 0.5) * 0.06;
    const jitterLng = 77.5946 + (Math.random() - 0.5) * 0.06;

    const res = await registerHospital({
      name: contactPerson,
      email: hospitalEmail,
      phone: hospitalPhone,
      hospitalName,
      address,
      city: hospitalCity,
      lat: jitterLat,
      lng: jitterLng,
      licenseNo,
      contactPerson,
    });

    setLoading(false);
    if (res.success) {
      setSuccess('Hospital registration submitted! Awaiting administrator license verification.');
      setTimeout(() => onNavigate('hospital-dashboard'), 1200);
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200">
          <button
            onClick={() => {
              setTab('DONOR');
              setError(null);
            }}
            className={`py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              tab === 'DONOR'
                ? 'border-red-600 text-red-600 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${tab === 'DONOR' ? 'fill-red-600' : ''}`} />
            <span>Register as Donor</span>
          </button>

          <button
            onClick={() => {
              setTab('HOSPITAL');
              setError(null);
            }}
            className={`py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              tab === 'HOSPITAL'
                ? 'border-red-600 text-red-600 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Register as Hospital</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {tab === 'DONOR' ? (
            /* Donor Registration Form */
            <form onSubmit={handleRegisterDonor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@domain.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <PhoneInputWithCountry
                  id="donor-phone"
                  label="Mobile Phone"
                  required
                  value={donorPhone}
                  onChange={(fullNumber, valid) => {
                    setDonorPhone(fullNumber);
                    setIsDonorPhoneValid(valid);
                  }}
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Blood Group *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      type="button"
                      key={bg}
                      onClick={() => setBloodGroup(bg)}
                      className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        bloodGroup === bg
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Droplet className={`w-3 h-3 ${bloodGroup === bg ? 'fill-white' : 'text-red-500'}`} />
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age, Gender & City */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={65}
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    City / Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Last Donation Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Last Donation Date (Leave empty if first-time donor)
                </label>
                <input
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Used by cooldown engine to ensure minimum 90-day recovery between donations.
                </span>
              </div>

              {/* Consent for Location Use (Section 4 & 6) */}
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={locationConsent}
                    onChange={(e) => setLocationConsent(e.target.checked)}
                    className="mt-1 rounded text-red-600 focus:ring-red-500 w-4 h-4 shrink-0"
                  />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block font-bold">
                      Consent for Privacy-Aware Location Matching (Section 6 Model)
                    </strong>
                    I consent to having my registered location and optional live GPS used solely for emergency blood request proximity calculation. I understand that my contact details and exact coordinates will remain completely hidden until I explicitly accept a request.
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Heart className="w-4 h-4 fill-white" />
                {loading ? 'Creating Donor Account...' : 'Complete Donor Registration'}
              </button>
            </form>
          ) : (
            /* Hospital Registration Form */
            <form onSubmit={handleRegisterHospital} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Hospital / Clinical Facility Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memorial General Hospital"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="bloodbank@hospital.org"
                  value={hospitalEmail}
                  onChange={(e) => setHospitalEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <PhoneInputWithCountry
                  id="hospital-phone"
                  label="Emergency Hotline Phone"
                  required
                  value={hospitalPhone}
                  onChange={(fullNumber, valid) => {
                    setHospitalPhone(fullNumber);
                    setIsHospitalPhoneValid(valid);
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Street Address & City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="100 Medical Plaza, Central District"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Medical Facility License Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MED-REG-XXXXX"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Authorized Contact / Doctor In-Charge *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. James Wilson"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                <span className="font-bold block">Regulatory Verification Notice (Section 10):</span>
                <p>
                  To prevent unauthorized access to sensitive donor records, all new hospital accounts require verification by the platform administration before urgent requests can be raised.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Building2 className="w-4 h-4" />
                {loading ? 'Submitting Registration...' : 'Register Hospital Facility'}
              </button>
            </form>
          )}

          <div className="text-center text-xs text-slate-500 pt-2">
            Already registered?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-red-600 font-bold hover:underline cursor-pointer"
            >
              Sign In Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
