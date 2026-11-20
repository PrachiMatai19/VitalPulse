import React, { useState } from 'react';
import {
  Heart,
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Droplet,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'DONOR' | 'HOSPITAL' | 'ADMIN'>('DONOR');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(`Please enter your registered email address.`);
      return;
    }
    setError(null);
    setLoading(true);

    const res = await login(email.trim());
    setLoading(false);

    if (res.success) {
      if (activeTab === 'DONOR') onNavigate('donor-dashboard');
      else if (activeTab === 'HOSPITAL') onNavigate('hospital-dashboard');
      else if (activeTab === 'ADMIN') onNavigate('admin-dashboard');
    } else {
      setError(res.message || 'Login failed. Please verify your email or use the quick access options.');
    }
  };

  const handleQuickLogin = async (quickEmail: string, role: 'DONOR' | 'HOSPITAL' | 'ADMIN') => {
    setError(null);
    const res = await login(quickEmail);
    if (res.success) {
      if (role === 'DONOR') onNavigate('donor-dashboard');
      else if (role === 'HOSPITAL') onNavigate('hospital-dashboard');
      else if (role === 'ADMIN') onNavigate('admin-dashboard');
    } else {
      setError(res.message || 'Login failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto pt-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          VitalPulse Sign In
        </h1>
        <p className="text-sm text-slate-600">
          Choose your role below to access your dedicated workspace and controls.
        </p>
      </div>

      {/* 3 Dedicated Role Tabs */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 max-w-xl w-full bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300">
          <button
            type="button"
            onClick={() => {
              setActiveTab('DONOR');
              setError(null);
              setEmail('');
            }}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'DONOR'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === 'DONOR' ? 'fill-white' : 'text-red-500'}`} />
            <span>Blood Donor</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('HOSPITAL');
              setError(null);
              setEmail('');
            }}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'HOSPITAL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospital Facility</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setError(null);
              setEmail('');
            }}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'bg-purple-700 text-white shadow-md shadow-purple-700/30'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role-Specific Login Panels */}
      <div className="max-w-2xl mx-auto">
        {/* ================= 1. DONOR LOGIN PANEL ================= */}
        {activeTab === 'DONOR' && (
          <div className="bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-500/25">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Volunteer Donor Portal
                </h2>
                <p className="text-xs text-slate-500">
                  Manage emergency availability, location sharing, cooldown, and incoming hospital alerts.
                </p>
              </div>
            </div>

            {/* Quick 1-Click Access for Testing */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Instant 1-Click Demo Profiles:
              </span>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('rahul.donor@gmail.com', 'DONOR')}
                  className="w-full text-left p-3 rounded-2xl border border-red-200 bg-rose-50/50 hover:bg-rose-100/70 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      O-
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-red-700">
                        Rahul Sharma
                      </strong>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                        Universal Donor · Cooldown Cleared · Live GPS Active
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <span>Login &rarr;</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('priya.patel@outlook.com', 'DONOR')}
                  className="w-full text-left p-3 rounded-2xl border border-slate-200 bg-white hover:bg-rose-50/60 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 font-black text-xs flex items-center justify-center shrink-0">
                      A+
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-red-700">
                        Priya Patel
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        A+ Donor · Accepted St. Jude Request
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <span>Login &rarr;</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('david.chen@gmail.com', 'DONOR')}
                  className="w-full text-left p-3 rounded-2xl border border-slate-200 bg-white hover:bg-rose-50/60 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                      B+
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-red-700">
                        David Chen
                      </strong>
                      <span className="text-[10px] text-amber-700 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        In Cooldown (55 days remaining)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <span>Login &rarr;</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Email Form */}
            <form onSubmit={handleCustomLogin} className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Or Sign In with Registered Donor Email:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul.donor@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  {loading ? 'Logging in...' : 'Sign In as Donor'}
                </button>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-600">New volunteer? </span>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                Register as Blood Donor &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ================= 2. HOSPITAL LOGIN PANEL ================= */}
        {activeTab === 'HOSPITAL' && (
          <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Hospital & Trauma Center Portal
                </h2>
                <p className="text-xs text-slate-500">
                  Raise urgent blood requests, view matched nearby donors, track on Leaflet map, and fulfill transfusions.
                </p>
              </div>
            </div>

            {/* Quick 1-Click Access for Testing */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Instant 1-Click Hospital Facilities:
              </span>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('er@citycare.org', 'HOSPITAL')}
                  className="w-full text-left p-3 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                        City Care Trauma & Multi-Specialty
                      </strong>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        Verified Facility · Active O- Critical Request
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    <span>Access Console &rarr;</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('bloodbank@stjude-health.org', 'HOSPITAL')}
                  className="w-full text-left p-3 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/60 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                        St. Jude Children & General
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        Verified Facility · A+ Urgent Pediatric Case
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    <span>Access Console &rarr;</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('contact@metroclinic.med', 'HOSPITAL')}
                  className="w-full text-left p-3 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/60 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block group-hover:text-blue-700">
                        Metropolitan Community Clinic
                      </strong>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        Pending Administrative Verification
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                    <span>Access Console &rarr;</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Email Form */}
            <form onSubmit={handleCustomLogin} className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Or Sign In with Hospital Facility Email:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. er@citycare.org"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  {loading ? 'Logging in...' : 'Sign In as Hospital'}
                </button>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-600">Need to register a healthcare center? </span>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Register Hospital Facility &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ================= 3. ADMIN LOGIN PANEL ================= */}
        {activeTab === 'ADMIN' && (
          <div className="bg-white rounded-3xl border-2 border-purple-300 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-purple-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-purple-600/25">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  System Administrator & Compliance Authority
                </h2>
                <p className="text-xs text-slate-500">
                  Verify hospitals, oversee registered donors and contact details, inspect raised requests, and audit which donor accepted.
                </p>
              </div>
            </div>

            {/* Quick 1-Click Admin Access */}
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="bg-purple-200 text-purple-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Chief Medical Officer Credentials
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">
                    Dr. Evelyn Reed (Chief Medical Officer & Administrator)
                  </h4>
                  <p className="text-xs text-slate-600">
                    email: <span className="font-mono font-semibold">admin@vitalpulse.org</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@vitalpulse.org', 'ADMIN')}
                className="w-full py-2.5 bg-linear-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In as System Administrator &rarr;</span>
              </button>
            </div>

            {/* Custom Admin Login Form */}
            <form onSubmit={handleCustomLogin} className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Or Enter Admin Email:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vitalpulse.org"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  {loading ? 'Authenticating...' : 'Sign In as Admin'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Option to Explore Public Awareness Page */}
      <div className="text-center pt-2">
        <button
          onClick={() => onNavigate('landing')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1"
        >
          <span>Browse Public Blood Donation Awareness & Compatibility Matrix without logging in</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
