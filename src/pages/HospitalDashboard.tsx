import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Droplet,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Layers,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { BloodRequest, MatchedDonor } from '../types';
import { CreateRequestForm } from '../components/hospital/CreateRequestForm';
import { MatchedDonorList } from '../components/hospital/MatchedDonorList';
import { DonorMap } from '../components/hospital/DonorMap';

export const HospitalDashboard: React.FC = () => {
  const { user, hospitalProfile, switchPersona } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDonorForMap, setSelectedDonorForMap] = useState<MatchedDonor | null>(null);

  if (!user || !hospitalProfile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <Building2 className="w-12 h-12 text-blue-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Hospital Console Access</h2>
        <p className="text-xs text-slate-500">
          Please select a Hospital persona from the navigation bar (e.g. City Care Trauma) or sign in.
        </p>
      </div>
    );
  }

  // Get requests for this hospital
  const allRequests = storageService.getRequests();
  const myRequests = allRequests.filter((r) => r.hospitalId === hospitalProfile.id);

  // Default selection to first active request or first request
  const currentRequest =
    myRequests.find((r) => r.id === selectedRequestId) ||
    myRequests.find((r) => r.status === 'OPEN' || r.status === 'ACCEPTED') ||
    myRequests[0] ||
    null;

  // Run matching engine for current request
  const matchedDonors = currentRequest
    ? storageService.matchDonorsForRequest(currentRequest)
    : [];

  const acceptedDonors = matchedDonors.filter((d) => d.hasAccepted);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
      {!hospitalProfile.verified && (
        <div className="bg-amber-500 text-white rounded-2xl p-5 shadow-md flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm sm:text-base">
              Medical Facility License Pending Administrative Verification
            </h4>
            <p className="text-xs text-amber-100 mt-1">
              Your license (<strong>{hospitalProfile.licenseNo}</strong>) has been submitted for compliance verification. Once approved by the administrator, you will be able to raise urgent blood requests.
            </p>
          </div>
        </div>
      )}

      {/* Hospital Overview Banner */}
      <div className="bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-blue-900/40">
        {/* Ambient Gradient Accents */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Hospital Command Portal
              </span>
              {hospitalProfile.verified ? (
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified License: {hospitalProfile.licenseNo}
                </span>
              ) : (
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Pending Verification
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {hospitalProfile.hospitalName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{hospitalProfile.address}, {hospitalProfile.city}</span>
              <span>•</span>
              <span>Supervisor: {hospitalProfile.contactPerson}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Raise Urgent Request
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Request Tabs, Right Request Details & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Hospital's Requests */}
        <div id="hospital-requests" className="space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Your Raised Requests ({myRequests.length})</span>
            </h3>
            <button
              onClick={handleRefresh}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500">
              <p className="text-xs">No blood requests raised yet.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-3 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Create First Request
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myRequests.map((req) => {
                const isSelected = currentRequest?.id === req.id;
                const isFulfilled = req.status === 'FULFILLED';

                return (
                  <button
                    key={req.id}
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      setSelectedDonorForMap(null);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50/70 border-red-500 shadow-sm ring-1 ring-red-400'
                        : isFulfilled
                        ? 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
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

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'FULFILLED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'ACCEPTED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Droplet className="w-4 h-4 fill-red-600 text-red-600" />
                        <span className="font-black text-slate-900 text-base">
                          {req.bloodGroup}
                        </span>
                        <span className="text-xs text-slate-600">
                          ({req.unitsNeeded} units)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        #{req.id.slice(-6)}
                      </span>
                    </div>

                    {req.patientNotes && (
                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        {req.patientNotes}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Selected Request Details, Map, and Matched Donors */}
        <div id="hospital-donor-matching" className="lg:col-span-2 space-y-6 scroll-mt-24">
          {currentRequest ? (
            <>
              {/* Selected Request Header Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        Request ID: {currentRequest.id}
                      </span>
                      <span
                        className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                          currentRequest.status === 'FULFILLED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Status: {currentRequest.status}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Urgent Requirement: {currentRequest.unitsNeeded} Units of {currentRequest.bloodGroup}
                    </h2>
                  </div>

                  {currentRequest.status === 'FULFILLED' && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Request Fulfilled & Donors Credited
                    </div>
                  )}
                </div>

                {currentRequest.patientNotes && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-800">Case Notes: </span>
                    {currentRequest.patientNotes}
                  </div>
                )}
              </div>

              {/* Proximity Leaflet Map (Shows hospital + accepted donors) */}
              <DonorMap
                request={currentRequest}
                acceptedDonors={acceptedDonors}
                selectedDonor={selectedDonorForMap}
              />

              {/* Matched Donors Proximity List */}
              <MatchedDonorList
                request={currentRequest}
                matchedDonors={matchedDonors}
                onRefresh={handleRefresh}
                onSelectDonorForMap={(donor) => setSelectedDonorForMap(donor)}
              />
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No Request Selected</h3>
              <p className="text-xs text-slate-500 mt-1">
                Raise a new blood request to activate proximity matching and Leaflet mapping.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal to Create Emergency Request */}
      <CreateRequestForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRequestCreated={() => {
          handleRefresh();
        }}
      />
    </div>
  );
};
