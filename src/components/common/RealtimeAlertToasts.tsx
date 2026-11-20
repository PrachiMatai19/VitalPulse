import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  MapPin,
  Droplet,
  Navigation,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useToastNotification, BloodAlertToast } from '../../context/ToastNotificationContext';
import { useAuth } from '../../context/AuthContext';
import { formatDistance } from '../../utils/haversine';

interface SingleToastItemProps {
  toast: BloodAlertToast;
}

const SingleToastItem: React.FC<SingleToastItemProps> = ({ toast }) => {
  const {
    dismissToast,
    pauseToast,
    resumeToast,
    openShareLocationModal,
    quickShareLiveLocation,
    declineRequest,
    soundMuted,
    toggleSound,
  } = useToastNotification();

  const { user, donorProfile, login } = useAuth();
  const [remainingPercent, setRemainingPercent] = useState<number>(100);

  const isCritical = toast.request.urgency === 'CRITICAL';
  const isUrgent = toast.request.urgency === 'URGENT';

  // Auto-dismiss countdown timer
  useEffect(() => {
    if (toast.isPaused) return;

    const intervalTime = 100;
    const step = (intervalTime / toast.durationMs) * 100;

    const timer = setInterval(() => {
      setRemainingPercent((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          dismissToast(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.id, toast.durationMs, toast.isPaused, dismissToast]);

  const estimatedDriveMins = Math.max(3, Math.round(toast.distanceKm * 2.2));

  return (
    <div
      onMouseEnter={() => pauseToast(toast.id)}
      onMouseLeave={() => resumeToast(toast.id)}
      className="pointer-events-auto w-full max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-red-500/80 overflow-hidden ring-4 ring-red-500/20 animate-in slide-in-from-top-4 fade-in duration-300 transition-all"
      role="alert"
      aria-live="assertive"
    >
      {/* Top Banner Header */}
      <div
        className={`px-4 py-2 flex items-center justify-between text-xs font-black ${
          isCritical
            ? 'bg-linear-to-r from-red-600 via-rose-600 to-red-700 text-white'
            : 'bg-linear-to-r from-amber-600 to-orange-600 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <span className="tracking-wider uppercase">
            {toast.request.urgency} Blood Match Request
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSound}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title={soundMuted ? 'Unmute Audio Alert' : 'Mute Audio Alert'}
            aria-label="Toggle alert sound"
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => dismissToast(toast.id)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Toast Body */}
      <div className="p-4 space-y-3">
        {/* Hospital & Urgency Details */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white font-bold text-sm">
              <Building2 className="w-4 h-4 text-red-400 shrink-0" />
              <span>{toast.request.hospitalName}</span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{toast.request.hospitalCity}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">
                {formatDistance(toast.distanceKm)} away
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                (~{estimatedDriveMins} mins)
              </span>
            </p>
          </div>

          {/* Blood Group Pill */}
          <div className="bg-red-600/30 border border-red-500/50 px-3 py-1 rounded-xl text-center shrink-0">
            <div className="text-[9px] uppercase font-bold text-red-300">Needs</div>
            <div className="text-lg font-black text-white flex items-center justify-center gap-0.5">
              <Droplet className="w-3.5 h-3.5 fill-red-400 text-red-400" />
              {toast.request.bloodGroup}
            </div>
            <div className="text-[10px] text-slate-300 font-mono">
              {toast.request.unitsNeeded} unit{toast.request.unitsNeeded > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Clinical Note Preview */}
        {toast.request.patientNotes && (
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 text-xs text-slate-300 italic flex items-start gap-1.5">
            <span className="text-rose-400 font-bold not-italic shrink-0">Case:</span>
            <span className="line-clamp-2 leading-relaxed">{toast.request.patientNotes}</span>
          </div>
        )}

        {/* Privacy Note */}
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Your live coordinates are private until you choose to share.</span>
        </div>

        {/* Action Buttons for Logged-In Donor */}
        {donorProfile ? (
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
            {/* Primary Action: Opens Location Sharing Modal */}
            <button
              onClick={() => openShareLocationModal(toast.request)}
              className="w-full sm:flex-1 px-3.5 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Review & Share Location</span>
            </button>

            {/* Quick 1-Tap Live GPS Share */}
            <button
              onClick={() => quickShareLiveLocation(toast.request)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="Instantly accept and share live GPS coordinates in 1 click"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Share</span>
            </button>

            {/* Decline */}
            <button
              onClick={() => declineRequest(toast.request)}
              className="w-full sm:w-auto px-2.5 py-2.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Decline
            </button>
          </div>
        ) : (
          /* Helper for when user is testing as guest or other role */
          <div className="pt-1 space-y-2">
            <p className="text-[11px] text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Log in as an eligible donor to respond and share location:</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => login('donor1@example.com')}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-red-600/30"
              >
                <span>Switch to O- Donor (Alex)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => dismissToast(toast.id)}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Countdown Progress Bar (Auto-dismiss indication) */}
      <div className="h-1 w-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            isCritical ? 'bg-red-500' : 'bg-amber-400'
          }`}
          style={{ width: `${remainingPercent}%` }}
        />
      </div>
    </div>
  );
};

export const RealtimeAlertToasts: React.FC = () => {
  const { toasts, successMessage, clearSuccessMessage } = useToastNotification();

  return (
    <>
      {/* Toast Stack Container: Fixed Top Right */}
      <div
        className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full pointer-events-none flex flex-col gap-3 items-end"
        aria-live="polite"
      >
        {/* Success Confirmation Toast */}
        {successMessage && (
          <div className="pointer-events-auto w-full max-w-md bg-emerald-950/95 border-2 border-emerald-500 text-white p-4 rounded-2xl shadow-2xl shadow-emerald-900/50 flex items-start justify-between gap-3 animate-in slide-in-from-top-3 fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                  Location Successfully Shared
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                  {successMessage}
                </p>
              </div>
            </div>
            <button
              onClick={clearSuccessMessage}
              className="p-1 text-emerald-300 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Blood Match Urgent Toasts */}
        {toasts.map((toast) => (
          <SingleToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </>
  );
};
