import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Clock,
  Droplet,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Check,
  X,
  Radio,
  Calendar,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { AccessLogsTable } from '../components/admin/AccessLogsTable';
import { RequestHeatmap } from '../components/admin/RequestHeatmap';
import { calculateCooldown } from '../utils/bloodCompatibility';

interface AdminDashboardProps {
  activeTab?: 'DONORS' | 'HOSPITALS' | 'REQUESTS' | 'LOGS' | 'HEATMAP';
  setActiveTab?: (tab: 'DONORS' | 'HOSPITALS' | 'REQUESTS' | 'LOGS' | 'HEATMAP') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
}) => {
  const { user, refreshProfiles } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [localActiveTab, setLocalActiveTab] = useState<'DONORS' | 'HOSPITALS' | 'REQUESTS' | 'LOGS' | 'HEATMAP'>('DONORS');
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;
  const [searchTerm, setSearchTerm] = useState('');

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-purple-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Administrator Access Required</h2>
        <p className="text-xs text-slate-500">
          Please log in through the Administrator portal to view this command center.
        </p>
      </div>
    );
  }

  const hospitals = storageService.getHospitals();
  const donors = storageService.getDonors();
  const users = storageService.getUsers();
  const requests = storageService.getRequests();
  const responses = storageService.getResponses();
  const logs = storageService.getAccessLogs();

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    refreshProfiles();
  };

  const handleVerifyHospital = (hospitalId: string, verified: boolean) => {
    const hosp = storageService.getHospitalById(hospitalId);
    if (hosp) {
      storageService.updateHospital({ ...hosp, verified });
      handleRefresh();
    }
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Reset all donors, hospitals, requests, and access logs back to clean demo state?'
      )
    ) {
      storageService.resetToDefaults();
      handleRefresh();
      window.location.reload();
    }
  };

  // Map donors with their user details (name, phone, email)
  const donorsWithUser = donors.map((d) => {
    const u = users.find((usr) => usr.id === d.userId);
    const cooldown = calculateCooldown(d.lastDonationDate);
    return {
      ...d,
      name: u?.name || 'Registered Donor',
      email: u?.email || 'N/A',
      phone: u?.phone || 'N/A',
      cooldown,
    };
  });

  // Calculate requests raised per hospital
  const hospitalsWithStats = hospitals.map((h) => {
    const raisedRequests = requests.filter((r) => r.hospitalId === h.id);
    const u = users.find((usr) => usr.id === h.userId);
    return {
      ...h,
      phone: u?.phone || '+1 (555) 000-0000',
      email: u?.email || 'N/A',
      requestsCount: raisedRequests.length,
      activeRequestsCount: raisedRequests.filter((r) => r.status === 'OPEN' || r.status === 'ACCEPTED').length,
    };
  });

  // Requests with accepted donors details
  const requestsWithAcceptance = requests.map((req) => {
    // Find all accepted responses for this request
    const acceptedResponses = responses.filter(
      (resp) => resp.requestId === req.id && resp.status === 'ACCEPTED'
    );

    const acceptedDonors = acceptedResponses.map((resp) => {
      const donor = donors.find((d) => d.id === resp.donorId);
      const donorUser = donor ? users.find((u) => u.id === donor.userId) : null;
      return {
        donorId: resp.donorId,
        name: donorUser?.name || 'Anonymous Donor',
        phone: donorUser?.phone || 'N/A',
        email: donorUser?.email || 'N/A',
        bloodGroup: donor?.bloodGroup,
        respondedAt: resp.respondedAt,
      };
    });

    return {
      ...req,
      acceptedDonors,
    };
  });

  // Filters
  const filteredDonors = donorsWithUser.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      d.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHospitals = hospitalsWithStats.filter(
    (h) =>
      h.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.phone.includes(searchTerm) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.licenseNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = requestsWithAcceptance.filter(
    (r) =>
      r.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-purple-900/40">
        {/* Ambient Gradient Glow Accents */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-400/30 text-purple-200 px-3 py-1 rounded-full text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              Administrative Command Center & Oversight Authority
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Platform Registry & Network Monitor
            </h1>
            <p className="text-xs sm:text-sm text-purple-200">
              Admin: {user.name} ({user.email}) · Complete visibility across all registered donors, hospitals, raised requests, and donor acceptances.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetData}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              title="Reset sample data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              Reset All Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setActiveTab('DONORS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'DONORS'
              ? 'bg-rose-50 border-red-500 ring-1 ring-red-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
              Registered Donors
            </span>
            <Users className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{donors.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Name, contact, blood type</p>
        </div>

        <div
          onClick={() => setActiveTab('HOSPITALS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'HOSPITALS'
              ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Hospitals & Clinics
            </span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{hospitals.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">
            {hospitals.filter((h) => h.verified).length} Verified · {hospitals.filter((h) => !h.verified).length} Pending
          </p>
        </div>

        <div
          onClick={() => setActiveTab('REQUESTS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'REQUESTS'
              ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Requests Raised
            </span>
            <Droplet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{requests.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">
            {requests.filter((r) => r.status === 'ACCEPTED').length} Accepted · {requests.filter((r) => r.status === 'OPEN').length} Open
          </p>
        </div>

        <div
          onClick={() => setActiveTab('HEATMAP')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'HEATMAP'
              ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Request Hotspots
            </span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            {requests.filter((r) => r.status === 'OPEN' || r.status === 'ACCEPTED').length}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {requests.filter((r) => (r.status === 'OPEN' || r.status === 'ACCEPTED') && r.urgency === 'CRITICAL').length} Critical Epicenters
          </p>
        </div>

        <div
          onClick={() => setActiveTab('LOGS')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'LOGS'
              ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-400 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Access Logs Audit
            </span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700">{logs.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Audit events logged</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => {
              setActiveTab('DONORS');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'DONORS'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Registered Donors ({donors.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('HOSPITALS');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'HOSPITALS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospitals & Requests Raised ({hospitals.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('REQUESTS');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'REQUESTS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Requests & Acceptances ({requests.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('HEATMAP');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'HEATMAP'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Geospatial Heatmap</span>
            <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {requests.filter((r) => r.status === 'OPEN' || r.status === 'ACCEPTED').length} Active
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('LOGS');
              setSearchTerm('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'LOGS'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </button>
        </div>

        {/* Search */}
        {activeTab !== 'HEATMAP' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter list..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}
      </div>

      {/* ================= TAB 1: REGISTERED DONORS ================= */}
      {activeTab === 'DONORS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                <span>Registered Donors (Name, Contact No, Blood Group, Availability)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full administrative directory of registered volunteer donors in the network.
              </p>
            </div>
            <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full">
              {filteredDonors.length} Donors
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Donor Name</th>
                  <th className="px-5 py-3">Phone Number ("No")</th>
                  <th className="px-5 py-3">Blood Group</th>
                  <th className="px-5 py-3">Location & Area</th>
                  <th className="px-5 py-3">Availability</th>
                  <th className="px-5 py-3">90-Day Cooldown</th>
                  <th className="px-5 py-3 text-right">Total Donations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDonors.map((donor) => (
                  <tr key={donor.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{donor.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{donor.email}</span>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 font-mono text-xs">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{donor.phone}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {donor.age} yrs · {donor.gender}
                      </span>
                    </td>

                    {/* Blood Group */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 font-black px-2.5 py-1 rounded-lg text-xs">
                        <Droplet className="w-3.5 h-3.5 fill-red-600" />
                        {donor.bloodGroup}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-800 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{donor.city}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {donor.shareLive ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5 animate-pulse" />
                            Live GPS enabled
                          </span>
                        ) : (
                          'Home base location'
                        )}
                      </span>
                    </td>

                    {/* Availability */}
                    <td className="px-5 py-4">
                      {donor.available ? (
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Available
                        </span>
                      ) : (
                        <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          Paused
                        </span>
                      )}
                    </td>

                    {/* Cooldown */}
                    <td className="px-5 py-4">
                      {donor.cooldown.isEligible ? (
                        <span className="text-emerald-700 font-bold text-[11px] block">
                          ✓ Eligible to Donate
                        </span>
                      ) : (
                        <span className="text-amber-800 font-bold text-[11px] block">
                          ⏳ {donor.cooldown.daysRemaining} days left
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        Last: {donor.lastDonationDate || 'First-time donor'}
                      </span>
                    </td>

                    {/* Total Donations */}
                    <td className="px-5 py-4 text-right">
                      <span className="font-black text-slate-900 text-sm">
                        {donor.totalDonations || 0}
                      </span>{' '}
                      <span className="text-slate-500 text-[11px]">times</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: REGISTERED HOSPITALS & REQUESTS RAISED ================= */}
      {activeTab === 'HOSPITALS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Hospitals Directory (Name, Phone No, Location, Requests Raised)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified healthcare centers, licensing details, emergency numbers, and total volume of requests raised.
              </p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full">
              {filteredHospitals.length} Hospitals
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Hospital Name</th>
                  <th className="px-5 py-3">Emergency Phone ("No")</th>
                  <th className="px-5 py-3">Location & Address</th>
                  <th className="px-5 py-3">Medical License</th>
                  <th className="px-5 py-3">Requests Raised</th>
                  <th className="px-5 py-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredHospitals.map((hosp) => (
                  <tr key={hosp.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Hospital Name */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{hosp.hospitalName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        In-Charge: <strong>{hosp.contactPerson}</strong>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{hosp.phone}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{hosp.email}</span>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-800 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{hosp.city}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block max-w-xs truncate">
                        {hosp.address}
                      </span>
                    </td>

                    {/* License */}
                    <td className="px-5 py-4">
                      <span className="font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-800">
                        {hosp.licenseNo}
                      </span>
                    </td>

                    {/* Requests Raised */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                          {hosp.requestsCount}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          raised ({hosp.activeRequestsCount} active)
                        </span>
                      </div>
                    </td>

                    {/* Verification Status & Action */}
                    <td className="px-5 py-4 text-right">
                      {hosp.verified ? (
                        <div className="inline-flex items-center gap-2">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                          <button
                            onClick={() => handleVerifyHospital(hosp.id, false)}
                            className="text-xs text-slate-400 hover:text-red-600 hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                          <button
                            onClick={() => handleVerifyHospital(hosp.id, true)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: REQUESTS & DONOR ACCEPTANCES ================= */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-600" />
                <span>Emergency Blood Requests & Which Donor Accepted</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of requests raised by hospitals and exact matching donor acceptances.
              </p>
            </div>
            <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full">
              {filteredRequests.length} Total Requests
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredRequests.map((req) => {
              const hasAccepted = req.acceptedDonors && req.acceptedDonors.length > 0;

              return (
                <div key={req.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            req.urgency === 'CRITICAL'
                              ? 'bg-red-600 text-white'
                              : req.urgency === 'URGENT'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {req.urgency}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{req.hospitalName}</h4>
                        <span className="text-xs text-slate-500">({req.hospitalCity})</span>
                        <span className="text-[11px] font-mono text-slate-400">#{req.id}</span>
                      </div>

                      <p className="text-xs text-slate-600">
                        Needed: <strong className="text-red-700">{req.unitsNeeded} Units of {req.bloodGroup}</strong> · Created on {new Date(req.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-xl ${
                          req.status === 'FULFILLED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : req.status === 'ACCEPTED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        Status: {req.status}
                      </span>
                    </div>
                  </div>

                  {req.patientNotes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 italic">
                      "{req.patientNotes}"
                    </div>
                  )}

                  {/* Which Donor Accepted Section */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block mb-2">
                      Donor Response & Acceptance Status:
                    </span>

                    {hasAccepted ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {req.acceptedDonors.map((ad, idx) => (
                          <div
                            key={idx}
                            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <strong className="text-slate-900 font-bold text-sm">
                                  {ad.name}
                                </strong>
                                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-1.5 py-0.5 rounded">
                                  {ad.bloodGroup}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <span className="flex items-center gap-1 font-mono font-semibold text-slate-800">
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  {ad.phone}
                                </span>
                                <span>•</span>
                                <span>{ad.email}</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300 block">
                                ACCEPTED
                              </span>
                              {ad.respondedAt && (
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  {new Date(ad.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                          Pending: Emergency broadcast sent to matching compatible donors within radius. Waiting for donor to accept.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 4: ACCESS LOGS AUDIT ================= */}
      {activeTab === 'LOGS' && (
        <AccessLogsTable logs={logs} />
      )}

      {/* ================= TAB 5: GEOSPATIAL REQUEST HEATMAP ================= */}
      {activeTab === 'HEATMAP' && (
        <RequestHeatmap requests={requests} hospitals={hospitals} />
      )}
    </div>
  );
};
