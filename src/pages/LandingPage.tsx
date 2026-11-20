import React, { useState } from 'react';
import {
  Heart,
  Droplet,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Radio,
  Mail,
  Lock,
  ChevronDown,
  RotateCcw,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BloodCompatibilityExplorer } from '../components/common/BloodCompatibilityExplorer';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user, login } = useAuth();
  const [activeLoginTab, setActiveLoginTab] = useState<'DONOR' | 'HOSPITAL' | 'ADMIN'>('DONOR');
  const [emailInput, setEmailInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetAllData = async () => {
    setIsResetting(true);
    setResetMessage(null);
    try {
      storageService.resetToDefaults();
      await apiService.resetDatabase();
      setResetMessage('All data & H2 database successfully reset to clean defaults!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      setResetMessage('Reset applied to local storage.');
      setTimeout(() => setResetMessage(null), 2000);
    } finally {
      setIsResetting(false);
    }
  };

  // Eligibility quiz state
  const [eligibilityAnswers, setEligibilityAnswers] = useState({
    age: true,
    weight: true,
    cooldown: true,
    medication: false,
  });

  const requests = storageService.getRequests();
  const activeRequests = requests.filter((r) => r.status === 'OPEN' || r.status === 'ACCEPTED');

  const isEligibleToDonate =
    eligibilityAnswers.age &&
    eligibilityAnswers.weight &&
    eligibilityAnswers.cooldown &&
    !eligibilityAnswers.medication;

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setLoginError('Please enter your registered email address.');
      return;
    }
    setLoginError(null);
    setLoading(true);

    const res = await login(emailInput.trim());
    setLoading(false);

    if (res.success) {
      if (activeLoginTab === 'DONOR') onNavigate('donor-dashboard');
      else if (activeLoginTab === 'HOSPITAL') onNavigate('hospital-dashboard');
      else if (activeLoginTab === 'ADMIN') onNavigate('admin-dashboard');
    } else {
      setLoginError(res.message || 'Login failed. Check your email or use the 1-click profiles below.');
    }
  };

  const handleQuickLogin = async (quickEmail: string, role: 'DONOR' | 'HOSPITAL' | 'ADMIN') => {
    setLoginError(null);
    const res = await login(quickEmail);
    if (res.success) {
      if (role === 'DONOR') onNavigate('donor-dashboard');
      else if (role === 'HOSPITAL') onNavigate('hospital-dashboard');
      else if (role === 'ADMIN') onNavigate('admin-dashboard');
    } else {
      setLoginError(res.message || 'Login failed');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Top Hero & Integrated Role Login Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-14 bg-linear-to-br from-rose-200/85 via-red-100/65 to-rose-50/90 border-b border-rose-200/80">
        {/* Prominent Hero Ambient Gradient Accents */}
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-linear-to-br from-red-600/30 via-rose-500/35 to-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-6 -right-20 w-[32rem] h-[32rem] bg-linear-to-bl from-rose-500/35 via-red-500/25 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-linear-to-tr from-amber-400/25 via-rose-400/30 to-red-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 6 Columns: Hero Presentation & Mission */}
            <div className="lg:col-span-6 space-y-6 pt-2">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                When Seconds Count, <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-red-600 via-rose-600 to-red-700">
                  Blood Connects Us.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                In trauma accidents, surgeries, and childbirth hemorrhages, hospitals need compatible donors immediately.
                <strong> VitalPulse</strong> connects verified hospitals with eligible nearby volunteer donors in real time — with zero privacy compromise.
              </p>



              {/* Awareness Quick Highlights */}
              <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>90-Day Cooldown</strong> Safe Donor Recovery</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Contact Protected</strong> Until Donor Accepts</span>
                </div>
              </div>
            </div>

            {/* Right 6 Columns: Integrated Portal Sign In Module */}
            <div id="signin-section" className="lg:col-span-6">
              <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden">
                {/* 3 Role Selection Tabs */}
                <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveLoginTab('DONOR');
                      setLoginError(null);
                      setEmailInput('');
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeLoginTab === 'DONOR'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${activeLoginTab === 'DONOR' ? 'fill-white' : 'text-red-500'}`} />
                    <span>Donor Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveLoginTab('HOSPITAL');
                      setLoginError(null);
                      setEmailInput('');
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeLoginTab === 'HOSPITAL'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hospital Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveLoginTab('ADMIN');
                      setLoginError(null);
                      setEmailInput('');
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeLoginTab === 'ADMIN'
                        ? 'bg-purple-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* DONOR TAB */}
                  {activeLoginTab === 'DONOR' && (
                    <div className="space-y-4 animate-in fade-in duration-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Volunteer Donor Access
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Receive emergency hospital alerts, toggle live GPS sharing, and track your cooldown.
                        </p>
                      </div>

                      {/* 1-Click Demo Profiles */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Instant 1-Click Access:
                        </span>

                        <button
                          type="button"
                          onClick={() => handleQuickLogin('rahul.donor@gmail.com', 'DONOR')}
                          className="w-full text-left p-2.5 rounded-xl border border-red-200 bg-rose-50/50 hover:bg-rose-100/70 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                              O-
                            </span>
                            <div>
                              <strong className="text-xs font-bold text-slate-900 block">Rahul Sharma</strong>
                              <span className="text-[10px] text-slate-500">Universal Donor · Live GPS Active</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-red-600">Enter &rarr;</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickLogin('priya.patel@outlook.com', 'DONOR')}
                          className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50/60 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-black text-xs flex items-center justify-center">
                              A+
                            </span>
                            <div>
                              <strong className="text-xs font-bold text-slate-900 block">Priya Patel</strong>
                              <span className="text-[10px] text-slate-500">A+ Donor · Accepted St. Jude Case</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-red-600">Enter &rarr;</span>
                        </button>
                      </div>

                      {/* Custom Email Login Form */}
                      <form onSubmit={handleCustomLogin} className="pt-2 border-t border-slate-100 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Or Sign In with Registered Email:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="rahul.donor@gmail.com"
                            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                          />
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                          >
                            Sign In
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* HOSPITAL TAB */}
                  {activeLoginTab === 'HOSPITAL' && (
                    <div className="space-y-4 animate-in fade-in duration-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Hospital & Trauma Center Access
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Raise emergency blood broadcasts, match nearby donors, and view live Leaflet map.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Instant 1-Click Facilities:
                        </span>

                        <button
                          type="button"
                          onClick={() => handleQuickLogin('er@citycare.org', 'HOSPITAL')}
                          className="w-full text-left p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                              <Building2 className="w-4 h-4" />
                            </span>
                            <div>
                              <strong className="text-xs font-bold text-slate-900 block">City Care Trauma</strong>
                              <span className="text-[10px] text-slate-500">Verified Center · Active O- Request</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600">Enter &rarr;</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickLogin('bloodbank@stjude-health.org', 'HOSPITAL')}
                          className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/60 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                              <Building2 className="w-4 h-4" />
                            </span>
                            <div>
                              <strong className="text-xs font-bold text-slate-900 block">St. Jude Children & General</strong>
                              <span className="text-[10px] text-slate-500">Verified Facility · A+ Case</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600">Enter &rarr;</span>
                        </button>
                      </div>

                      <form onSubmit={handleCustomLogin} className="pt-2 border-t border-slate-100 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Or Sign In with Hospital Facility Email:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="er@citycare.org"
                            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                          >
                            Sign In
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* ADMIN TAB */}
                  {activeLoginTab === 'ADMIN' && (
                    <div className="space-y-4 animate-in fade-in duration-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Chief Medical Officer & Compliance Authority
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Verify hospital medical licenses, monitor registered donors, and audit donor acceptances.
                        </p>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-purple-950">
                            Dr. Evelyn Reed (CMO / Admin)
                          </strong>
                          <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                            Administrator
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Account: <span className="font-mono">admin@vitalpulse.org</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => handleQuickLogin('admin@vitalpulse.org', 'ADMIN')}
                          className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Access Admin Portal &rarr;</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reset State & Database Section */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href="http://localhost:8080/h2-console"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-500 hover:text-red-600 font-mono flex items-center gap-1 transition-colors"
                      title="Open live H2 Web Console in new tab"
                    >
                      <Database className="w-3 h-3 text-emerald-500" />
                      <span>H2 Console (sa / vitalpulse_db)</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleResetAllData}
                      disabled={isResetting}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Reset all registrations and return to default seed data"
                    >
                      <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                      <span>{isResetting ? 'Resetting...' : 'Reset All Data'}</span>
                    </button>
                  </div>

                  {resetMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-2 rounded-lg font-medium text-center animate-in fade-in">
                      {resetMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verified Platform Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-rose-200/80 shadow-md text-center space-y-1 hover:border-rose-300 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-red-600">1,250+</div>
              <div className="text-xs font-bold text-slate-800">Active Volunteer Donors</div>
              <div className="text-[11px] text-slate-500">Across All Blood Groups</div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-rose-200/80 shadow-md text-center space-y-1 hover:border-blue-300 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-blue-600">48+</div>
              <div className="text-xs font-bold text-slate-800">Verified Hospitals</div>
              <div className="text-[11px] text-slate-500">Trauma & ICU Centers</div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-rose-200/80 shadow-md text-center space-y-1 hover:border-emerald-300 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">&lt; 7 Mins</div>
              <div className="text-xs font-bold text-slate-800">Average Match Speed</div>
              <div className="text-[11px] text-slate-500">Real-time Proximity Dispatch</div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-rose-200/80 shadow-md text-center space-y-1 hover:border-purple-300 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-purple-600">99.4%</div>
              <div className="text-xs font-bold text-slate-800">Emergency Fulfillment</div>
              <div className="text-[11px] text-slate-500">Privacy-Protected Matching</div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts, Requests, Matrix & Quiz Container */}
      <div className="container mx-auto px-4 space-y-16 max-w-6xl">
        {/* Live Emergency Requests Broadcasts */}
        {activeRequests.length > 0 && (
          <section id="live-broadcasts" className="bg-linear-to-r from-rose-950 via-red-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-800/60 relative overflow-hidden scroll-mt-24">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Live Emergency Blood Broadcasts
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-rose-200 mt-1">
                  Urgent hospital requests currently seeking nearby compatible volunteer donors.
                </p>
              </div>

              <button
                onClick={() => {
                  if (user?.role === 'DONOR') onNavigate('donor-dashboard');
                  else {
                    setActiveLoginTab('DONOR');
                    const el = document.getElementById('signin-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer self-start md:self-auto"
              >
                Sign In as Donor to Respond &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {activeRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white/10 backdrop-blur-xs rounded-2xl p-5 border border-white/10 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          req.urgency === 'CRITICAL'
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {req.urgency}
                      </span>
                      <h4 className="font-bold text-white text-sm">{req.hospitalName}</h4>
                    </div>
                    <p className="text-xs text-rose-200">{req.hospitalCity}</p>
                    {req.patientNotes && (
                      <p className="text-xs text-slate-300 italic line-clamp-2 mt-1">
                        "{req.patientNotes}"
                      </p>
                    )}
                  </div>

                  <div className="bg-red-600/30 border border-red-500/40 px-3.5 py-2 rounded-xl text-center shrink-0">
                    <div className="text-[10px] uppercase font-bold text-rose-200">Needed</div>
                    <div className="text-xl font-black text-white flex items-center justify-center gap-1">
                      <Droplet className="w-4 h-4 fill-red-500 text-red-500" />
                      {req.bloodGroup}
                    </div>
                    <div className="text-[10px] text-rose-200 font-semibold">{req.unitsNeeded} Units</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* How It Works (Emergency Workflow) */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              Emergency Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              How VitalPulse Saves Lives
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Designed from the ground up to solve hospital blood shortages while protecting donor privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/85 backdrop-blur-md p-6 rounded-2xl border border-rose-100/90 shadow-sm hover:shadow-md hover:border-rose-200 transition-all relative">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-black text-base flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Donor & Hospital Onboarding</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Donors register blood group and location consent. Hospitals register license numbers and are admin-verified before making requests.
              </p>
            </div>

            <div className="bg-white/85 backdrop-blur-md p-6 rounded-2xl border border-rose-100/90 shadow-sm hover:shadow-md hover:border-rose-200 transition-all relative">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-black text-base flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Urgent Request Broadcast</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hospital raises a request specifying blood group, units, and urgency (Critical/Urgent/Normal) with geolocation coordinates.
              </p>
            </div>

            <div className="bg-white/85 backdrop-blur-md p-6 rounded-2xl border border-rose-100/90 shadow-sm hover:shadow-md hover:border-rose-200 transition-all relative">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-black text-base flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Proximity Matching Engine</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Haversine formula calculates distance. Checks blood compatibility, 90-day cooldown, and uses fresh live GPS (falling back to home if &gt;15m).
              </p>
            </div>

            <div className="bg-white/85 backdrop-blur-md p-6 rounded-2xl border border-rose-100/90 shadow-sm hover:shadow-md hover:border-rose-200 transition-all relative">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-black text-base flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Consent-Based Reveal</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Donor receives notification and accepts. Only upon acceptance are phone and map coordinates revealed to hospital emergency staff.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Blood Compatibility Matrix Reference Banner */}
        <section className="bg-linear-to-r from-slate-950 via-rose-950/80 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-rose-900/40 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-600/25 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-red-600/30 border border-red-500/40 text-rose-300 px-3 py-0.5 rounded-full text-xs font-bold">
              <Droplet className="w-3.5 h-3.5 fill-red-400 text-red-400" />
              Clinical Transfusion Guidelines
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Explore the Interactive Blood Compatibility Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              We have dedicated a focused clinical workspace for the interactive antigen matching rules, universal donor/recipient guides, and live transfusion tester.
            </p>
          </div>
          <button
            onClick={() => onNavigate('compatibility')}
            className="relative z-10 px-6 py-3.5 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-red-600/30 transition-all shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Launch Compatibility Matrix</span>
            <span className="text-base">&rarr;</span>
          </button>
        </section>

        {/* Quick Donor Eligibility Self-Check */}
        <section id="eligibility-quiz" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs scroll-mt-24">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="max-w-md space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Can You Donate Blood Today?
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check clinical guidelines before registering. Donor health and recipient safety are the highest priority.
              </p>

              <div className="pt-2">
                {isEligibleToDonate ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Great news!</strong> You meet standard clinical eligibility criteria. Register now to save lives.
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      You may be currently in cooldown or deferral period. You can still register to receive notifications when eligible!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist */}
            <div className="w-full md:w-auto flex-1 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={eligibilityAnswers.age}
                  onChange={(e) =>
                    setEligibilityAnswers({ ...eligibilityAnswers, age: e.target.checked })
                  }
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>Are you between 18 and 65 years of age?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={eligibilityAnswers.weight}
                  onChange={(e) =>
                    setEligibilityAnswers({ ...eligibilityAnswers, weight: e.target.checked })
                  }
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>Do you weigh at least 50 kg (110 lbs)?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={eligibilityAnswers.cooldown}
                  onChange={(e) =>
                    setEligibilityAnswers({ ...eligibilityAnswers, cooldown: e.target.checked })
                  }
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>Has it been at least 90 days (3 months) since your last donation?</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={eligibilityAnswers.medication}
                  onChange={(e) =>
                    setEligibilityAnswers({ ...eligibilityAnswers, medication: e.target.checked })
                  }
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>Are you currently on blood thinners or antibiotics?</span>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
