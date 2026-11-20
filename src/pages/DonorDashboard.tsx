import React, { useState } from 'react';
import {
  Heart,
  Droplet,
  Bell,
  Award,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { AvailabilityToggle } from '../components/donor/AvailabilityToggle';
import { CooldownBanner } from '../components/donor/CooldownBanner';
import { IncomingRequestCard } from '../components/donor/IncomingRequestCard';
import { DonationHistoryTable } from '../components/donor/DonationHistoryTable';
import { LocationShareModal } from '../components/donor/LocationShareModal';
import { DonorAchievements } from '../components/donor/DonorAchievements';
import { calculateDonorAchievements } from '../utils/donorAchievements';
import { isBloodCompatible, calculateCooldown } from '../utils/bloodCompatibility';
import { BloodRequest } from '../types';

export const DonorDashboard: React.FC = () => {
  const { user, donorProfile, refreshProfiles } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedRequestForModal, setSelectedRequestForModal] = useState<BloodRequest | null>(null);

  if (!user || !donorProfile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <Heart className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Donor Account Required</h2>
        <p className="text-xs text-slate-500">
          Please select a Donor demo persona from the navigation bar (e.g. Rahul Sharma) or sign in.
        </p>
      </div>
    );
  }

  // Get all requests that match this donor
  const allRequests = storageService.getRequests();
  const allResponses = storageService.getResponses();
  const history = storageService.getDonationHistory(donorProfile.id);

  // Filter incoming requests that match this donor's blood type and are OPEN or ACCEPTED
  const incomingMatches = allRequests.filter((req) => {
    return isBloodCompatible(donorProfile.bloodGroup, req.bloodGroup) && req.status !== 'FULFILLED' && req.status !== 'EXPIRED';
  });

  // Identify any pending unresponded requests (status === NOTIFIED)
  const pendingRequests = incomingMatches.filter((req) => {
    const resp = allResponses.find((r) => r.requestId === req.id && r.donorId === donorProfile.id);
    return !resp || resp.status === 'NOTIFIED';
  });

  // Calculate achievements status
  const achievements = calculateDonorAchievements(donorProfile, user, history, allResponses, allRequests);
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  const handleStatusChange = () => {
    setRefreshTrigger((prev) => prev + 1);
    refreshProfiles();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
      {/* Top Welcome Profile Banner */}
      <div className="bg-linear-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Ambient Gradient Accents */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-300/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-red-950/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-white mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Volunteer Donor Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 flex items-center gap-2">
              <span>{donorProfile.city}</span>
              <span>•</span>
              <span>Age {donorProfile.age} ({donorProfile.gender})</span>
              <span>•</span>
              <span>{user.phone}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Blood Type Badge */}
            <div className="bg-white text-slate-900 rounded-2xl p-3.5 sm:p-4 text-center shadow-lg min-w-[85px]">
              <div className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
                Blood Group
              </div>
              <div className="text-2xl sm:text-3xl font-black text-red-600 flex items-center justify-center gap-0.5">
                <Droplet className="w-5 h-5 fill-red-600" />
                {donorProfile.bloodGroup}
              </div>
            </div>

            {/* Total Donations */}
            <div className="bg-red-800/60 border border-white/20 text-white rounded-2xl p-3.5 sm:p-4 text-center min-w-[85px]">
              <div className="text-[10px] uppercase font-bold text-rose-200 tracking-wider">
                Total Given
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {donorProfile.totalDonations || history.length}
              </div>
              <div className="text-[9px] text-rose-200">Times</div>
            </div>

            {/* Milestones Badge */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('donor-achievements');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-amber-500/25 hover:bg-amber-500/35 border border-amber-300/40 text-white rounded-2xl p-3.5 sm:p-4 text-center min-w-[85px] cursor-pointer transition-all"
              title="Jump to Donor Achievements & Milestones"
            >
              <div className="text-[10px] uppercase font-bold text-amber-200 tracking-wider flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-amber-300" />
                <span>Milestones</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                {unlockedAchievementsCount} <span className="text-xs font-bold text-amber-200">/ {achievements.length}</span>
              </div>
              <div className="text-[9px] text-amber-200 font-medium">Badges &darr;</div>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Hospital Request Action Banner (Triggers Location Share Modal) */}
      {pendingRequests.length > 0 && (
        <div className="bg-linear-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-red-400/40 relative overflow-hidden animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                <Navigation className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-white/25 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    {pendingRequests[0].urgency} Emergency Match
                  </span>
                  <span className="text-xs text-rose-100 font-mono">
                    {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {pendingRequests[0].hospitalName} needs {pendingRequests[0].unitsNeeded} unit(s) of {pendingRequests[0].bloodGroup}!
                </h3>
                <p className="text-xs text-rose-100">
                  A hospital near you is requesting blood. Authorize sharing your location and phone number to help their emergency team.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedRequestForModal(pendingRequests[0])}
              className="px-5 py-3 bg-white hover:bg-rose-50 text-red-700 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Navigation className="w-4 h-4 text-red-600" />
              <span>Review & Share Location</span>
            </button>
          </div>
        </div>
      )}

      {/* Cooldown Section (Section 4 & 6) */}
      <div id="donor-cooldown">
        <CooldownBanner />
      </div>

      {/* Availability & Live Location Sharing Toggle (Section 6) */}
      <div id="donor-availability">
        <AvailabilityToggle />
      </div>

      {/* Donor Achievements & Milestones Tracking */}
      <DonorAchievements
        donor={donorProfile}
        user={user}
        history={history}
        responses={allResponses}
        requests={allRequests}
        onDataChange={handleStatusChange}
      />

      {/* Incoming Matched Emergency Requests */}
      <section id="donor-matches" className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-600 animate-bounce" />
            <h3 className="font-bold text-slate-900 text-lg">
              Incoming Hospital Requests Matched to You
            </h3>
            <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
              {incomingMatches.length}
            </span>
          </div>

          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh requests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {incomingMatches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No Pending Emergency Broadcasts</h4>
            <p className="text-xs text-slate-500 mt-1">
              You will automatically receive alerts whenever a nearby hospital requests {donorProfile.bloodGroup} or compatible blood types.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {incomingMatches.map((req) => {
              const resp = allResponses.find((r) => r.requestId === req.id && r.donorId === donorProfile.id);
              const status = resp ? resp.status : 'NOTIFIED';
              return (
                <IncomingRequestCard
                  key={req.id}
                  request={req}
                  responseStatus={status}
                  onStatusChange={handleStatusChange}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Donation History Table */}
      <section id="donor-history" className="space-y-4 scroll-mt-24">
        <DonationHistoryTable history={history} />
      </section>

      {/* Active Modal from Banner */}
      {selectedRequestForModal && (
        <LocationShareModal
          isOpen={!!selectedRequestForModal}
          onClose={() => setSelectedRequestForModal(null)}
          request={selectedRequestForModal}
          donorProfile={donorProfile}
          user={user}
          onConfirmShare={(mode) => {
            if (mode === 'LIVE') {
              storageService.updateDonor({
                ...donorProfile,
                shareLive: true,
                liveUpdatedAt: new Date().toISOString(),
              });
            }
            storageService.setResponseStatus(selectedRequestForModal.id, donorProfile.id, 'ACCEPTED');
            setSelectedRequestForModal(null);
            handleStatusChange();
          }}
          onDecline={() => {
            storageService.setResponseStatus(selectedRequestForModal.id, donorProfile.id, 'DECLINED');
            setSelectedRequestForModal(null);
            handleStatusChange();
          }}
        />
      )}
    </div>
  );
};
