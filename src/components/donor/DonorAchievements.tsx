import React, { useState, useMemo } from 'react';
import {
  Award,
  Sparkles,
  ShieldAlert,
  HeartHandshake,
  CalendarClock,
  Clock,
  Flame,
  Navigation,
  CheckCircle2,
  Lock,
  Share2,
  ChevronRight,
  Info,
  Trophy,
  Filter,
  Zap,
  Activity,
  Heart,
  Droplet,
  ArrowUpRight,
  X,
  Volume2,
} from 'lucide-react';
import { Donor, User, DonationHistory, RequestResponse, BloodRequest, DonorAchievement, AchievementTier } from '../../types';
import { calculateDonorAchievements, getDonorRank } from '../../utils/donorAchievements';
import { playAchievementUnlockSound, playSuccessChime } from '../../utils/soundEffects';
import { storageService } from '../../services/storageService';

interface DonorAchievementsProps {
  donor: Donor;
  user: User;
  history: DonationHistory[];
  responses: RequestResponse[];
  requests: BloodRequest[];
  onDataChange?: () => void;
}

export const DonorAchievements: React.FC<DonorAchievementsProps> = ({
  donor,
  user,
  history,
  responses,
  requests,
  onDataChange,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'IN_PROGRESS'>('ALL');
  const [selectedAchievement, setSelectedAchievement] = useState<DonorAchievement | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [recentCelebration, setRecentCelebration] = useState<string | null>(null);

  const achievements = useMemo(() => {
    return calculateDonorAchievements(donor, user, history, responses, requests);
  }, [donor, user, history, responses, requests]);

  const stats = useMemo(() => {
    const totalDonations = Math.max(donor.totalDonations || 0, history.length);
    return getDonorRank(achievements, totalDonations);
  }, [achievements, donor.totalDonations, history.length]);

  const filteredAchievements = useMemo(() => {
    if (filter === 'UNLOCKED') return achievements.filter((a) => a.unlocked);
    if (filter === 'IN_PROGRESS') return achievements.filter((a) => !a.unlocked);
    return achievements;
  }, [achievements, filter]);

  // Map icon strings to Lucide components
  const getIcon = (name: string, unlocked: boolean, className: string = 'w-6 h-6') => {
    switch (name) {
      case 'HeartHandshake':
        return <HeartHandshake className={className} />;
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      case 'CalendarClock':
        return <CalendarClock className={className} />;
      case 'Navigation':
        return <Navigation className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Sparkles':
      default:
        return <Sparkles className={className} />;
    }
  };

  const getTierDetails = (tier: AchievementTier) => {
    switch (tier) {
      case 'PLATINUM':
        return {
          label: 'Platinum Tier',
          pillBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          gradient: 'from-cyan-500 via-sky-500 to-indigo-600',
          ringColor: 'ring-cyan-400',
          textColor: 'text-cyan-700',
          accentBg: 'bg-cyan-500/10',
        };
      case 'GOLD':
        return {
          label: 'Gold Tier',
          pillBg: 'bg-amber-50 text-amber-800 border-amber-200',
          gradient: 'from-amber-400 via-amber-500 to-yellow-600',
          ringColor: 'ring-amber-400',
          textColor: 'text-amber-700',
          accentBg: 'bg-amber-500/10',
        };
      case 'SILVER':
        return {
          label: 'Silver Tier',
          pillBg: 'bg-slate-100 text-slate-800 border-slate-300',
          gradient: 'from-slate-400 via-slate-500 to-slate-600',
          ringColor: 'ring-slate-300',
          textColor: 'text-slate-700',
          accentBg: 'bg-slate-500/10',
        };
      case 'BRONZE':
      default:
        return {
          label: 'Bronze Tier',
          pillBg: 'bg-amber-900/10 text-amber-900 border-amber-900/20',
          gradient: 'from-amber-600 to-amber-800',
          ringColor: 'ring-amber-600',
          textColor: 'text-amber-800',
          accentBg: 'bg-amber-700/10',
        };
    }
  };

  // Trigger interactive test: Simulate accepting emergency response
  const handleTestEmergencyAccept = () => {
    // Find open emergency request or simulate one
    let targetReq = requests.find((r) => r.status === 'OPEN' && (r.urgency === 'CRITICAL' || r.urgency === 'URGENT'));
    if (!targetReq) {
      targetReq = storageService.simulateEmergencyBroadcast(donor.bloodGroup);
    }
    storageService.setResponseStatus(targetReq.id, donor.id, 'ACCEPTED');
    playAchievementUnlockSound();
    setRecentCelebration("Milestone Progress: 'Emergency Hero' response recorded!");
    setTimeout(() => setRecentCelebration(null), 5000);
    if (onDataChange) onDataChange();
  };

  // Trigger interactive test: Add a verified donation record
  const handleTestAddDonation = () => {
    const hospitals = storageService.getHospitals();
    const hosp = hospitals[0];
    const newRecord: DonationHistory = {
      id: `hist-${Date.now()}`,
      donorId: donor.id,
      requestId: null,
      hospitalId: hosp.id,
      hospitalName: hosp.hospitalName,
      donatedOn: new Date().toISOString().split('T')[0],
      units: 1,
      bloodGroup: donor.bloodGroup,
      notes: 'Verified voluntary whole blood donation. Excellent clinical recovery profile.',
    };
    storageService.addDonationHistory(newRecord);
    // Update donor count and last donation date
    storageService.updateDonor({
      ...donor,
      totalDonations: (donor.totalDonations || 0) + 1,
      lastDonationDate: newRecord.donatedOn,
    });
    playAchievementUnlockSound();
    setRecentCelebration("Celebration: Verified donation recorded! Milestones updated.");
    setTimeout(() => setRecentCelebration(null), 5000);
    if (onDataChange) onDataChange();
  };

  // Share achievement text
  const handleShareAchievement = (achievement: DonorAchievement) => {
    const shareText = `🏆 VitalPulse Milestone: I unlocked the "${achievement.title}" achievement on the VitalPulse Emergency Blood Network! Blood Group: ${donor.bloodGroup} · Every donation saves up to 3 lives. #VitalPulse #BloodDonation`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedNotification(achievement.id);
      playSuccessChime();
      setTimeout(() => setCopiedNotification(null), 3000);
    }
  };

  return (
    <div id="donor-achievements" className="space-y-6 scroll-mt-24">
      {/* Header & Overall Donor Honor Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-7 relative overflow-hidden">
        {/* Ambient Warm Accent Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-rose-400/15 via-red-300/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-amber-400/10 via-rose-300/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Title & Rank Metric */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Donor Milestones & Clinical Impact</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">Live Clinical Registry</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>Donor Achievements</span>
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-linear-to-r from-red-600 to-rose-600 text-white shadow-xs">
                  {stats.rank}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                Recognizing voluntary commitment, emergency responsiveness, and consistent biological health adherence.
              </p>
            </div>

            {/* Quick Impact Stats */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="bg-rose-50/80 border border-rose-100 rounded-2xl p-3 text-center min-w-[92px]">
                <div className="text-[10px] uppercase font-bold text-rose-700">Unlocked</div>
                <div className="text-xl sm:text-2xl font-black text-rose-700">
                  {stats.unlockedCount} <span className="text-xs font-bold text-rose-400">/ {stats.totalCount}</span>
                </div>
                <div className="text-[9px] text-rose-500 font-medium">Milestones</div>
              </div>

              <div className="bg-red-950 text-white rounded-2xl p-3 text-center min-w-[104px] shadow-sm">
                <div className="text-[10px] uppercase font-bold text-rose-300">Est. Impact</div>
                <div className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <span>~{stats.livesSaved}</span>
                </div>
                <div className="text-[9px] text-rose-200 font-medium">Lives Sustained</div>
              </div>
            </div>
          </div>

          {/* Progress to Next Tier Bar */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Tier Progress: <strong className="text-slate-900">{stats.rank}</strong>
              </span>
              <span className="text-slate-500 font-medium">
                {stats.neededForNext > 0
                  ? `${stats.neededForNext} more milestone${stats.neededForNext > 1 ? 's' : ''} to reach ${stats.nextRank}`
                  : 'Highest honor tier achieved!'}
              </span>
            </div>
            {/* Linear Progress Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-amber-500 via-rose-500 to-red-600 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Simulation / Test Action Bar (For instant testing) */}
          <div className="bg-linear-to-r from-red-50/70 via-rose-50/50 to-amber-50/70 rounded-2xl p-3.5 border border-rose-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Interactive Demonstration:</strong> Test real-time milestone unlocking and celebratory audio alerts.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestEmergencyAccept}
                className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                title="Simulate an emergency dispatch acceptance"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>Test Emergency Response</span>
              </button>

              <button
                type="button"
                onClick={handleTestAddDonation}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                title="Log a verified voluntary donation"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Log Test Donation</span>
              </button>
            </div>
          </div>

          {/* Celebration Toast Banner when an action is executed */}
          {recentCelebration && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{recentCelebration}</span>
              </div>
              <button
                type="button"
                onClick={() => setRecentCelebration(null)}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Segmented Filter Control */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Milestones ({achievements.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('UNLOCKED')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  filter === 'UNLOCKED'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unlocked ({stats.unlockedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilter('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  filter === 'IN_PROGRESS'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>In Progress ({stats.totalCount - stats.unlockedCount})</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Click any badge to view clinical criteria & share certificate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Milestone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const tier = getTierDetails(achievement.tier);
          const percent = Math.min(
            100,
            Math.round((achievement.progress.current / achievement.progress.target) * 100)
          );

          return (
            <div
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={`rounded-2xl p-5 border transition-all duration-200 cursor-pointer text-left relative flex flex-col justify-between group ${
                achievement.unlocked
                  ? 'bg-white border-slate-200 hover:border-red-300 hover:shadow-md'
                  : 'bg-slate-50/70 border-dashed border-slate-200 opacity-80 hover:opacity-100 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Badge Crest & Status Indicator */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="relative">
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
                        achievement.unlocked
                          ? `bg-linear-to-br ${tier.gradient} text-white`
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {getIcon(achievement.iconName, achievement.unlocked, 'w-6 h-6')}
                    </div>
                    {achievement.unlocked ? (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center border-2 border-white shadow-xs">
                        <Lock className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      {tier.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {achievement.category}
                    </span>
                  </div>
                </div>

                {/* Milestone Title & Tagline */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-base sm:text-lg tracking-tight ${
                      achievement.unlocked ? 'text-slate-900 group-hover:text-red-600 transition-colors' : 'text-slate-600'
                    }`}>
                      {achievement.title}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-rose-600">
                    {achievement.tagline}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">
                    {achievement.description}
                  </p>
                </div>
              </div>

              {/* Bottom Progress & Metadata */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {achievement.unlocked ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <span>Progress</span>
                    )}
                  </span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {achievement.progress.current} / {achievement.progress.target} {achievement.progress.unit}
                  </span>
                </div>

                {/* Small Progress Indicator */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      achievement.unlocked
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Unlocked on {achievement.unlockedAt}</span>
                    <span className="text-rose-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      View card <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}

                {!achievement.unlocked && (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Target: {achievement.progress.target} {achievement.progress.unit}</span>
                    <span className="text-slate-500 flex items-center gap-0.5">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Modal / Inspection Drawer */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Strip */}
            <div className={`p-6 sm:p-7 bg-linear-to-br ${
              selectedAchievement.unlocked
                ? getTierDetails(selectedAchievement.tier).gradient
                : 'from-slate-700 to-slate-900'
            } text-white relative`}>
              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white shadow-inner shrink-0">
                  {getIcon(selectedAchievement.iconName, selectedAchievement.unlocked, 'w-8 h-8')}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-100">
                    <span>{getTierDetails(selectedAchievement.tier).label}</span>
                    <span>·</span>
                    <span>{selectedAchievement.category} Category</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {selectedAchievement.title}
                  </h3>
                  <p className="text-xs text-white/90 font-medium">
                    {selectedAchievement.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 space-y-5 text-slate-700">
              {/* Status & Unlocked Date */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Status</span>
                  {selectedAchievement.unlocked ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Unlocked {selectedAchievement.unlockedAt ? `on ${selectedAchievement.unlockedAt}` : ''}
                    </span>
                  ) : (
                    <span className="font-bold text-amber-700 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-600" />
                      In Progress ({selectedAchievement.progress.current} / {selectedAchievement.progress.target} {selectedAchievement.progress.unit})
                    </span>
                  )}
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedAchievement.unlocked ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((selectedAchievement.progress.current / selectedAchievement.progress.target) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Clinical Description */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Milestone Overview</h4>
                <p className="text-slate-600 leading-relaxed">
                  {selectedAchievement.description}
                </p>
              </div>

              {/* Clinical Rationale Box */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70 space-y-1.5">
                <h4 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-red-600" />
                  Clinical & Medical Rationale
                </h4>
                <p className="text-xs text-rose-950/80 leading-relaxed">
                  {selectedAchievement.clinicalImpact}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleShareAchievement(selectedAchievement)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>
                    {copiedNotification === selectedAchievement.id ? 'Copied to Clipboard!' : 'Share Milestone Card'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAchievement(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
