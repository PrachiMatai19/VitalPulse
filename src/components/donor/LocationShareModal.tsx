import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  Droplet,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Phone,
  Navigation,
  CheckCircle2,
  X,
  Radio,
  Eye,
  Lock,
} from 'lucide-react';
import { BloodRequest, Donor, User } from '../../types';
import { formatDistance, calculateDistance } from '../../utils/haversine';
import { storageService } from '../../services/storageService';

interface LocationShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: BloodRequest;
  donorProfile: Donor;
  user: User;
  onConfirmShare: (locationMode: 'LIVE' | 'HOME') => void;
  onDecline: () => void;
}

export const LocationShareModal: React.FC<LocationShareModalProps> = ({
  isOpen,
  onClose,
  request,
  donorProfile,
  user,
  onConfirmShare,
  onDecline,
}) => {
  const [selectedLocationMode, setSelectedLocationMode] = useState<'LIVE' | 'HOME'>(
    donorProfile.shareLive ? 'LIVE' : 'HOME'
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Compute distance based on selected mode
  const activeLat =
    selectedLocationMode === 'LIVE' && donorProfile.liveLat
      ? donorProfile.liveLat
      : donorProfile.homeLat;
  const activeLng =
    selectedLocationMode === 'LIVE' && donorProfile.liveLng
      ? donorProfile.liveLng
      : donorProfile.homeLng;

  const distanceKm = calculateDistance(request.lat, request.lng, activeLat, activeLng);
  const estimatedDriveMins = Math.max(3, Math.round(distanceKm * 2.2));

  const isCritical = request.urgency === 'CRITICAL';

  const handleConfirm = () => {
    setSubmitting(true);
    // If donor chose LIVE, ensure live location is enabled in profile
    if (selectedLocationMode === 'LIVE' && !donorProfile.shareLive) {
      storageService.updateDonor({
        ...donorProfile,
        shareLive: true,
        liveUpdatedAt: new Date().toISOString(),
      });
    }
    onConfirmShare(selectedLocationMode);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Emergency Header */}
        <div
          className={`px-6 py-4.5 text-white flex items-center justify-between ${
            isCritical
              ? 'bg-linear-to-r from-red-600 via-rose-600 to-red-700'
              : 'bg-linear-to-r from-amber-600 via-orange-600 to-amber-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Emergency Hospital Request
                </span>
                <span className="text-xs font-mono opacity-80">#{request.id}</span>
              </div>
              <h3 className="font-black text-lg text-white leading-tight">
                Share Location with {request.hospitalName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Hospital Emergency Brief Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{request.hospitalName}</span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {request.hospitalCity} · Proximity:{' '}
                  <strong className="text-slate-800">{formatDistance(distanceKm)} away</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-red-50 border border-red-200 px-3 py-1 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-red-600 block">Needs</span>
                  <span className="text-base font-black text-red-700 flex items-center gap-0.5 justify-center">
                    <Droplet className="w-3.5 h-3.5 fill-red-600" />
                    {request.bloodGroup}
                  </span>
                </div>
                <div className="bg-slate-200/70 px-3 py-1 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Units</span>
                  <span className="text-base font-black text-slate-800">{request.unitsNeeded}</span>
                </div>
              </div>
            </div>

            {request.patientNotes && (
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                "{request.patientNotes}"
              </div>
            )}
          </div>

          {/* Interactive Proximity & Route Preview */}
          <div className="bg-linear-to-r from-rose-50 via-red-50/40 to-slate-50 rounded-2xl p-4 border border-rose-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5 text-red-700">
                <Navigation className="w-4 h-4" />
                Dispatch & Travel Estimate
              </span>
              <span className="bg-white border border-rose-200 px-2 py-0.5 rounded-md text-red-700 font-mono">
                ~{estimatedDriveMins} mins travel time
              </span>
            </div>

            {/* Visual Route Track */}
            <div className="relative py-3 flex items-center justify-between">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-linear-to-r from-emerald-400 via-rose-300 to-red-500 rounded-full" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-md">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-1">You ({donorProfile.city})</span>
              </div>

              <div className="relative z-10 bg-white border border-rose-300 px-2.5 py-1 rounded-full shadow-xs text-[11px] font-black text-slate-800">
                {formatDistance(distanceKm)}
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-md">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-1">Hospital Emergency</span>
              </div>
            </div>
          </div>

          {/* Location Sharing Mode Options */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Location Accuracy to Share:
            </label>

            {/* Option 1: Live Real-Time GPS */}
            <div
              onClick={() => setSelectedLocationMode('LIVE')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                selectedLocationMode === 'LIVE'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="locationMode"
                checked={selectedLocationMode === 'LIVE'}
                onChange={() => setSelectedLocationMode('LIVE')}
                className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    Share Live Real-Time GPS Location
                  </span>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Transmits your current device coordinates directly to the triage coordinator. Allows hospital staff to track emergency arrival.
                </p>
                <div className="text-[10px] text-emerald-700 font-mono pt-0.5">
                  Coords: {activeLat.toFixed(4)}, {activeLng.toFixed(4)} · Freshness: Active
                </div>
              </div>
            </div>

            {/* Option 2: Registered Home Coordinates Only */}
            <div
              onClick={() => setSelectedLocationMode('HOME')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                selectedLocationMode === 'HOME'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="locationMode"
                checked={selectedLocationMode === 'HOME'}
                onChange={() => setSelectedLocationMode('HOME')}
                className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="space-y-0.5 flex-1">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  Share Registered Home Address Coordinates Only
                </span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Uses your saved home location in {donorProfile.city} without activating real-time GPS tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Sharing Disclosure */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">Contact Phone Number</span>
                <span className="text-slate-500 text-[11px]">{user.phone}</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              Shared on Accept
            </span>
          </div>

          {/* Privacy & Security Guarantee Note */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>VitalPulse Privacy & Consent Protocol</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              By confirming, you grant explicit permission to share your chosen coordinates and contact phone number exclusively with verified medical personnel at <strong>{request.hospitalName}</strong> for this active request. It is logged in the compliance audit trail and will never be shared publicly.
            </p>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onDecline}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Decline & Keep Hidden
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Sharing...' : 'Confirm & Share Location'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
