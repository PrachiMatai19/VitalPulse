import React, { useState } from 'react';
import {
  Heart,
  Droplet,
  ShieldCheck,
  Building2,
  Users,
  LogOut,
  Radio,
  FileText,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  Home,
  Bell,
  Clock,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  Flame,
  Navigation,
  MapPin,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToastNotification } from '../../context/ToastNotificationContext';
import { storageService } from '../../services/storageService';
import { isBloodCompatible } from '../../utils/bloodCompatibility';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  adminTab?: 'DONORS' | 'HOSPITALS' | 'REQUESTS' | 'LOGS' | 'HEATMAP';
  setAdminTab?: (tab: 'DONORS' | 'HOSPITALS' | 'REQUESTS' | 'LOGS' | 'HEATMAP') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  adminTab = 'DONORS',
  setAdminTab,
}) => {
  const { user, donorProfile, hospitalProfile, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const {
    toasts,
    unreadCount,
    openShareLocationModal,
    simulateBroadcast,
    soundMuted,
    toggleSound,
  } = useToastNotification();

  const requests = storageService.getRequests();
  const hospitals = storageService.getHospitals();
  const donors = storageService.getDonors();

  const matchingAlertRequests = requests.filter((r) => {
    if (r.status !== 'OPEN') return false;
    if (donorProfile) {
      return isBloodCompatible(donorProfile.bloodGroup, r.bloodGroup);
    }
    return true;
  });

  const openCriticalRequests = requests.filter(
    (r) => r.status === 'OPEN' && (r.urgency === 'CRITICAL' || r.urgency === 'URGENT')
  ).length;

  const pendingHospitalsCount = hospitals.filter((h) => !h.verified).length;
  const activeRequestsCount = requests.filter((r) => r.status === 'OPEN' || r.status === 'ACCEPTED').length;

  // STRICT ROLE CHECKS: Only genuine admins see admin views or links
  const isAdminUser = user?.role === 'ADMIN';
  const isAdminView = isAdminUser && currentView === 'admin-dashboard';

  // Smooth scroll helper
  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to get descriptive tab name for admin
  const getAdminTabLabel = (tab: 'DONORS' | 'HOSPITALS' | 'REQUESTS' | 'LOGS' | 'HEATMAP') => {
    switch (tab) {
      case 'DONORS':
        return `Donors Registry (${donors.length})`;
      case 'HOSPITALS':
        return `Hospitals Directory (${hospitals.length})`;
      case 'REQUESTS':
        return `Requests & Acceptances (${activeRequestsCount})`;
      case 'HEATMAP':
        return `Hotspots Heatmap (${activeRequestsCount} Active)`;
      case 'LOGS':
        return 'Access Audit Logs';
    }
  };

  // =========================================================================
  // 1. DEDICATED DYNAMIC ADMIN COMMAND NAVBAR
  // =========================================================================
  if (isAdminView) {
    return (
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-purple-900/60 text-white shadow-xl">
        {/* Main Admin Navigation Bar */}
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Admin Brand Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('landing')}
              className="group cursor-pointer focus:outline-hidden"
              title="Return to Public View"
            >
              <BrandLogo size="sm" variant="dark" subtitle="Admin Command" />
            </button>
          </div>

          {/* Admin Dynamic Context Links */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Admin Navigation">
            <button
              onClick={() => {
                setCurrentView('admin-dashboard');
                if (setAdminTab) setAdminTab('DONORS');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === 'DONORS'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Donors Registry</span>
              <span className="bg-purple-950/80 text-purple-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {donors.length}
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('admin-dashboard');
                if (setAdminTab) setAdminTab('HOSPITALS');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === 'HOSPITALS'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospitals Directory</span>
              {pendingHospitalsCount > 0 ? (
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {pendingHospitalsCount} Pending
                </span>
              ) : (
                <span className="bg-purple-950/80 text-purple-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {hospitals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentView('admin-dashboard');
                if (setAdminTab) setAdminTab('REQUESTS');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === 'REQUESTS'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Droplet className="w-3.5 h-3.5 text-red-400" />
              <span>Requests & Acceptances</span>
              <span className="bg-purple-950/80 text-purple-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {activeRequestsCount}
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('admin-dashboard');
                if (setAdminTab) setAdminTab('HEATMAP');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === 'HEATMAP'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Hotspots Heatmap</span>
              <span className="bg-rose-950/80 text-rose-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {activeRequestsCount}
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentView('admin-dashboard');
                if (setAdminTab) setAdminTab('LOGS');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                adminTab === 'LOGS'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-300" />
              <span>Access Audit Logs</span>
            </button>
          </nav>

          {/* Admin Status & User Profile */}
          <div className="flex items-center gap-3">
            {/* Live H2 DB Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>H2 DB: Active</span>
            </div>

            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white">Dr. Evelyn Reed</span>
              <span className="text-[10px] text-purple-300 font-semibold">Chief Medical Officer</span>
            </div>

            <button
              onClick={() => {
                logout();
                setCurrentView('landing');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign Out of Admin Command"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg"
              aria-label="Toggle admin navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Admin Breadcrumbs Strip with Direct Tab Jump */}
        <div className="bg-slate-950/90 border-t border-purple-900/40 px-4 py-2">
          <div className="container mx-auto flex items-center justify-between text-xs overflow-x-auto whitespace-nowrap scrollbar-none">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-400">
              <button
                onClick={() => setCurrentView('landing')}
                className="hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>VitalPulse</span>
              </button>

              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

              <button
                onClick={() => {
                  setCurrentView('admin-dashboard');
                  if (setAdminTab) setAdminTab('DONORS');
                }}
                className="text-purple-300 hover:text-purple-200 font-semibold cursor-pointer"
              >
                Admin Command Center
              </button>

              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

              {/* Active Sub-tab Highlight */}
              <span className="font-bold text-white bg-purple-500/20 border border-purple-400/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                {getAdminTabLabel(adminTab)}
              </span>
            </nav>

            {/* Quick Breadcrumb Tab Switcher */}
            <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <span className="text-slate-500 text-[10px] uppercase font-mono mr-1">Switch Tab:</span>
              <button
                onClick={() => setAdminTab && setAdminTab('DONORS')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  adminTab === 'DONORS' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                Donors
              </button>
              <button
                onClick={() => setAdminTab && setAdminTab('HOSPITALS')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  adminTab === 'HOSPITALS' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                Hospitals
              </button>
              <button
                onClick={() => setAdminTab && setAdminTab('REQUESTS')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  adminTab === 'REQUESTS' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                Requests
              </button>
              <button
                onClick={() => setAdminTab && setAdminTab('HEATMAP')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  adminTab === 'HEATMAP' ? 'bg-rose-600 text-white font-bold' : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                Heatmap
              </button>
              <button
                onClick={() => setAdminTab && setAdminTab('LOGS')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  adminTab === 'LOGS' ? 'bg-purple-600 text-white' : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                Audit Logs
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Admin Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1 text-xs">
            <button
              onClick={() => {
                setCurrentView('admin-dashboard');
                if (setAdminTab) setAdminTab('DONORS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between font-bold"
            >
              <span>Donors Registry</span>
              <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full">{donors.length}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('admin-dashboard');
                if (setAdminTab) setAdminTab('HOSPITALS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between font-bold"
            >
              <span>Hospitals Directory</span>
              <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full">{hospitals.length}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('admin-dashboard');
                if (setAdminTab) setAdminTab('REQUESTS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between font-bold"
            >
              <span>Requests & Acceptances</span>
              <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full">{activeRequestsCount}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('admin-dashboard');
                if (setAdminTab) setAdminTab('HEATMAP');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg flex items-center justify-between font-bold"
            >
              <span>Hotspots Heatmap</span>
              <span className="bg-rose-900 text-rose-200 px-2 py-0.5 rounded-full">{activeRequestsCount}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('admin-dashboard');
                if (setAdminTab) setAdminTab('LOGS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg font-bold"
            >
              Access Audit Logs
            </button>
          </div>
        )}
      </header>
    );
  }

  // =========================================================================
  // 2. CONTEXT-AWARE PUBLIC / DONOR / HOSPITAL NAVBAR (NO ADMIN LINKS)
  // =========================================================================
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      {/* Emergency Global Ticker (Shown for Public & Donor users when critical requests exist) */}
      {openCriticalRequests > 0 && user?.role !== 'ADMIN' && (
        <div className="bg-linear-to-r from-red-600 to-rose-600 text-white px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="container mx-auto flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
              </span>
              <strong>Urgent Blood Alert:</strong> {openCriticalRequests} critical hospital blood request(s) active right now!
            </span>
            <button
              onClick={() => {
                if (user?.role === 'DONOR') setCurrentView('donor-dashboard');
                else if (user?.role === 'HOSPITAL') setCurrentView('hospital-dashboard');
                else {
                  setCurrentView('landing');
                  setTimeout(() => scrollToElement('signin-section'), 50);
                }
              }}
              className="text-xs underline hover:text-rose-100 font-semibold cursor-pointer"
            >
              View Requests &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar Bar */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => setCurrentView('landing')}
          className="group cursor-pointer focus:outline-hidden"
        >
          <BrandLogo size="md" variant="light" subtitle="Emergency Blood Network" />
        </button>

        {/* Dynamic Role-Aware Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2" aria-label="Main Navigation">
          {/* ================= PUBLIC USER (STANDARD) ================= */}
          {!user && (
            <>
              <button
                onClick={() => setCurrentView('landing')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentView === 'landing'
                    ? 'text-red-600 bg-red-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Home & Facts
              </button>
              <button
                onClick={() => setCurrentView('compatibility')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentView === 'compatibility'
                    ? 'text-red-600 bg-red-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Compatibility Matrix
              </button>
              <button
                onClick={() => {
                  setCurrentView('landing');
                  setTimeout(() => scrollToElement('eligibility-quiz'), 50);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Donor Eligibility Quiz
              </button>
              <button
                onClick={() => {
                  setCurrentView('landing');
                  setTimeout(() => scrollToElement('live-broadcasts'), 50);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>Live Broadcasts</span>
              </button>
            </>
          )}

          {/* ================= DONOR ROLE ================= */}
          {user?.role === 'DONOR' && (
            <>
              <button
                onClick={() => setCurrentView('donor-dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'donor-dashboard'
                    ? 'text-red-700 bg-red-100 font-bold'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                <span>Donor Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('donor-dashboard');
                  setTimeout(() => scrollToElement('donor-matches'), 50);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Bell className="w-4 h-4 text-red-500" />
                <span>Incoming Matches</span>
                {openCriticalRequests > 0 && (
                  <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {openCriticalRequests}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setCurrentView('donor-dashboard');
                  setTimeout(() => scrollToElement('donor-history'), 50);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Donation History</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('donor-dashboard');
                  setTimeout(() => scrollToElement('donor-achievements'), 50);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>Achievements</span>
              </button>

              <button
                onClick={() => setCurrentView('compatibility')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentView === 'compatibility'
                    ? 'text-red-600 bg-red-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Compatibility Matrix
              </button>
            </>
          )}

          {/* ================= HOSPITAL ROLE ================= */}
          {user?.role === 'HOSPITAL' && (
            <>
              <button
                onClick={() => setCurrentView('hospital-dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'hospital-dashboard'
                    ? 'text-blue-700 bg-blue-100 font-bold'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Hospital Console</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('hospital-dashboard');
                  setTimeout(() => scrollToElement('hospital-requests'), 50);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Raised Requests</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('hospital-dashboard');
                  setTimeout(() => scrollToElement('hospital-donor-matching'), 50);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Live Matched Donors</span>
              </button>

              <button
                onClick={() => setCurrentView('compatibility')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentView === 'compatibility'
                    ? 'text-blue-700 bg-blue-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Compatibility Matrix
              </button>
            </>
          )}

          {/* NOTE: Administrative links are STRICTLY HIDDEN here from non-admin users */}
        </nav>

        {/* Right side: Alerts Bell & User Profile / Sign In Actions */}
        <div className="flex items-center gap-3">
          {/* Real-Time Match Alerts Bell & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              className="relative p-2 rounded-xl text-slate-700 hover:text-red-600 hover:bg-rose-50 border border-slate-200 transition-all cursor-pointer flex items-center justify-center"
              title="Real-Time Hospital Blood Match Alerts"
              aria-label="Real-Time Alerts"
            >
              <Bell className={`w-4 h-4 ${matchingAlertRequests.length > 0 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`} />
              {matchingAlertRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {matchingAlertRequests.length}
                </span>
              )}
            </button>

            {/* Notification Center Dropdown */}
            {notificationMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="bg-linear-to-r from-red-600 to-rose-700 px-4 py-3 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-white animate-pulse" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Emergency Match Feed</h4>
                      <p className="text-[10px] text-rose-100">Live Hospital Requests</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleSound}
                      className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                      title={soundMuted ? 'Unmute Audio Alert' : 'Mute Audio Alert'}
                    >
                      {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setNotificationMenuOpen(false)}
                      className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Simulate Broadcast Test Button */}
                <div className="p-2.5 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-600 font-medium">Test Real-Time Alert:</span>
                  <button
                    onClick={() => {
                      simulateBroadcast(donorProfile?.bloodGroup || 'O-');
                      setNotificationMenuOpen(false);
                    }}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>⚡ Broadcast Match</span>
                  </button>
                </div>

                {/* List of active matching requests */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1">
                  {matchingAlertRequests.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                      <span>No pending urgent requests for your profile right now.</span>
                    </div>
                  ) : (
                    matchingAlertRequests.map((req) => (
                      <div key={req.id} className="p-3 hover:bg-slate-50 transition-colors rounded-xl space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                              {req.urgency} NEED
                            </span>
                            <h5 className="font-bold text-xs text-slate-900 leading-tight">
                              {req.hospitalName}
                            </h5>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {req.hospitalCity}
                            </p>
                          </div>
                          <div className="bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg text-center shrink-0">
                            <span className="text-xs font-black text-red-700 flex items-center gap-0.5">
                              <Droplet className="w-3 h-3 fill-red-600 text-red-600" />
                              {req.bloodGroup}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {req.unitsNeeded} unit{req.unitsNeeded > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {donorProfile ? (
                          <button
                            onClick={() => {
                              openShareLocationModal(req);
                              setNotificationMenuOpen(false);
                            }}
                            className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Respond & Share Location</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              login('donor1@example.com');
                              openShareLocationModal(req);
                              setNotificationMenuOpen(false);
                            }}
                            className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Log in as Donor to Respond</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">
                  {user.name}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {user.role === 'DONOR' ? (
                    <span className="text-red-600 flex items-center gap-1 justify-end">
                      <Droplet className="w-3 h-3 fill-red-600" />
                      {donorProfile?.bloodGroup} Donor
                    </span>
                  ) : (
                    <span className="text-blue-600">
                      Hospital {hospitalProfile?.verified ? '✓ Verified' : '(Pending)'}
                    </span>
                  )}
                </span>
              </div>

              <button
                onClick={() => {
                  logout();
                  setCurrentView('landing');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-red-600 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Sign Out of Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentView('landing');
                  setTimeout(() => scrollToElement('signin-section'), 50);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-rose-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-linear-to-r from-red-600 to-rose-600 rounded-lg shadow-xs hover:from-red-700 hover:to-rose-700 transition-all cursor-pointer"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile hamburger trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. DYNAMIC CONTEXTUAL BREADCRUMBS STRIP FOR SPECIFIC DASHBOARD VIEWS
          ========================================================================= */}
      {currentView !== 'landing' && (
        <div className="bg-slate-50/90 border-t border-slate-200/80 px-4 py-2">
          <div className="container mx-auto flex items-center justify-between text-xs overflow-x-auto whitespace-nowrap scrollbar-none">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500">
              <button
                onClick={() => setCurrentView('landing')}
                className="hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>VitalPulse</span>
              </button>

              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

              {/* Donor Portal Breadcrumb */}
              {currentView === 'donor-dashboard' && (
                <>
                  <button
                    onClick={() => setCurrentView('donor-dashboard')}
                    className="text-red-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3 fill-red-500" />
                    <span>Donor Portal</span>
                  </button>

                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

                  <span className="font-bold text-slate-800 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Emergency Matches & Eligibility
                  </span>
                </>
              )}

              {/* Hospital Console Breadcrumb */}
              {currentView === 'hospital-dashboard' && (
                <>
                  <button
                    onClick={() => setCurrentView('hospital-dashboard')}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Building2 className="w-3 h-3 text-blue-600" />
                    <span>Hospital Console</span>
                  </button>

                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

                  <span className="font-bold text-slate-800 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    Emergency Broadcasts & Live Proximity
                  </span>
                </>
              )}

              {/* Compatibility Matrix Breadcrumb */}
              {currentView === 'compatibility' && (
                <>
                  <span className="text-slate-600 font-semibold">Clinical Tools</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="font-bold text-red-600 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Droplet className="w-3 h-3 fill-red-500" />
                    Blood Compatibility & Antigen Matrix
                  </span>
                </>
              )}

              {/* Register Breadcrumb */}
              {currentView === 'register' && (
                <>
                  <span className="text-slate-600 font-semibold">Account Onboarding</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="font-bold text-red-600 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-md">
                    Join VitalPulse Emergency Network
                  </span>
                </>
              )}
            </nav>

            {/* Quick in-page section jump for active dashboard */}
            {currentView === 'donor-dashboard' && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <span className="text-slate-400 text-[10px] uppercase font-mono mr-1">Jump to:</span>
                <button
                  onClick={() => scrollToElement('donor-cooldown')}
                  className="px-2 py-0.5 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Cooldown
                </button>
                <button
                  onClick={() => scrollToElement('donor-availability')}
                  className="px-2 py-0.5 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Availability
                </button>
                <button
                  onClick={() => scrollToElement('donor-matches')}
                  className="px-2 py-0.5 hover:bg-slate-200 rounded-md transition-colors cursor-pointer text-red-600 font-bold"
                >
                  Incoming Matches
                </button>
                <button
                  onClick={() => scrollToElement('donor-achievements')}
                  className="px-2 py-0.5 hover:bg-slate-200 rounded-md transition-colors cursor-pointer text-amber-700 font-bold"
                >
                  Achievements
                </button>
                <button
                  onClick={() => scrollToElement('donor-history')}
                  className="px-2 py-0.5 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  History
                </button>
              </div>
            )}

            {currentView === 'hospital-dashboard' && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <span className="text-slate-400 text-[10px] uppercase font-mono mr-1">Jump to:</span>
                <button
                  onClick={() => scrollToElement('hospital-requests')}
                  className="px-2 py-0.5 hover:bg-slate-200 rounded-md transition-colors cursor-pointer text-blue-600 font-bold"
                >
                  Raised Requests
                </button>
                <button
                  onClick={() => scrollToElement('hospital-donor-matching')}
                  className="px-2 py-0.5 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Matched Donors Map
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          <button
            onClick={() => {
              setCurrentView('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Home & Facts
          </button>
          <button
            onClick={() => {
              setCurrentView('compatibility');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Compatibility Matrix
          </button>

          {user?.role === 'DONOR' && (
            <>
              <button
                onClick={() => {
                  setCurrentView('donor-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg"
              >
                Donor Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentView('donor-dashboard');
                  setMobileMenuOpen(false);
                  setTimeout(() => scrollToElement('donor-matches'), 50);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Incoming Matches
              </button>
              <button
                onClick={() => {
                  setCurrentView('donor-dashboard');
                  setMobileMenuOpen(false);
                  setTimeout(() => scrollToElement('donor-achievements'), 50);
                }}
                className="w-full text-left px-3 py-2 text-sm text-amber-700 font-semibold hover:bg-slate-100 rounded-lg"
              >
                Donor Achievements & Milestones
              </button>
              <button
                onClick={() => {
                  setCurrentView('donor-dashboard');
                  setMobileMenuOpen(false);
                  setTimeout(() => scrollToElement('donor-history'), 50);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Donation History
              </button>
            </>
          )}

          {user?.role === 'HOSPITAL' && (
            <>
              <button
                onClick={() => {
                  setCurrentView('hospital-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Hospital Console
              </button>
              <button
                onClick={() => {
                  setCurrentView('hospital-dashboard');
                  setMobileMenuOpen(false);
                  setTimeout(() => scrollToElement('hospital-requests'), 50);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Raised Requests
              </button>
              <button
                onClick={() => {
                  setCurrentView('hospital-dashboard');
                  setMobileMenuOpen(false);
                  setTimeout(() => scrollToElement('hospital-donor-matching'), 50);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Live Matched Donors
              </button>
            </>
          )}

          {/* Note: NO administrative links here */}
        </div>
      )}
    </header>
  );
};
