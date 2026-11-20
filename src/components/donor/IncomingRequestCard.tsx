import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Droplet,
  ShieldAlert,
  Navigation,
  Radio,
} from 'lucide-react';
import { BloodRequest, ResponseStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { calculateDistance, formatDistance } from '../../utils/haversine';
import { useAuth } from '../../context/AuthContext';
import { LocationShareModal } from './LocationShareModal';

interface IncomingRequestCardProps {
  request: BloodRequest;
  responseStatus: ResponseStatus;
  onStatusChange: () => void;
}

export const IncomingRequestCard: React.FC<IncomingRequestCardProps> = ({
  request,
  responseStatus,
  onStatusChange,
}) => {
  const { user, donorProfile } = useAuth();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  if (!donorProfile || !user) return null;

  // Determine active donor coordinates (fresh live or home fallback)
  let donorLat = donorProfile.homeLat;
  let donorLng = donorProfile.homeLng;
  if (donorProfile.shareLive && donorProfile.liveLat && donorProfile.liveLng && donorProfile.liveUpdatedAt) {
    const ageMs = Date.now() - new Date(donorProfile.liveUpdatedAt).getTime();
    if (ageMs <= 15 * 60 * 1000) {
      donorLat = donorProfile.liveLat;
      donorLng = donorProfile.liveLng;
    }
  }

  const distanceKm = calculateDistance(request.lat, request.lng, donorLat, donorLng);

  const handleDecline = () => {
    storageService.setResponseStatus(request.id, donorProfile.id, 'DECLINED');
    setIsLocationModalOpen(false);
    onStatusChange();
  };

  const handleConfirmShare = (locationMode: 'LIVE' | 'HOME') => {
    if (locationMode === 'LIVE') {
      storageService.updateDonor({
        ...donorProfile,
        shareLive: true,
        liveUpdatedAt: new Date().toISOString(),
      });
    }
    storageService.setResponseStatus(request.id, donorProfile.id, 'ACCEPTED');
    setIsLocationModalOpen(false);
    onStatusChange();
  };

  const isCritical = request.urgency === 'CRITICAL';
  const isUrgent = request.urgency === 'URGENT';

  return (
    <>
      <div
        className={`rounded-2xl border transition-all overflow-hidden ${
          responseStatus === 'ACCEPTED'
            ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
            : responseStatus === 'DECLINED'
            ? 'bg-slate-50 border-slate-200 opacity-60'
            : isCritical
            ? 'bg-white border-red-300 shadow-md ring-1 ring-red-400'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Top Banner */}
        <div
          className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold ${
            isCritical
              ? 'bg-red-600 text-white'
              : isUrgent
              ? 'bg-amber-500 text-white'
              : 'bg-slate-800 text-white'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            {request.urgency} BLOOD MATCH REQUEST
          </span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-mono">
            Req #{request.id}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Main Details */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                <h4 className="font-bold text-slate-900 text-base">{request.hospitalName}</h4>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {request.hospitalCity} · Proximity: <strong className="text-slate-800">{formatDistance(distanceKm)} away</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-red-600">Blood Type</div>
                <div className="text-lg font-black text-red-700 flex items-center justify-center gap-0.5">
                  <Droplet className="w-4 h-4 fill-red-600" />
                  {request.bloodGroup}
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-slate-600">Needed</div>
                <div className="text-lg font-black text-slate-800">
                  {request.unitsNeeded} <span className="text-xs font-normal">units</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Notes */}
          {request.patientNotes && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-700">
              <span className="font-bold text-slate-800 block mb-0.5">Clinical Note:</span>
              <p className="italic text-slate-600 leading-relaxed">{request.patientNotes}</p>
            </div>
          )}

          {/* Action Buttons & Status */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 w-full sm:w-auto">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Posted {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {responseStatus === 'ACCEPTED' ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Click to view or adjust shared location"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Location & Contact Shared (View Details)</span>
                  </button>
                  <button
                    onClick={handleDecline}
                    className="text-xs text-slate-500 hover:text-red-600 hover:underline px-2 py-1 cursor-pointer"
                  >
                    Withdraw
                  </button>
                </div>
              ) : responseStatus === 'DECLINED' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-slate-500" />
                    Declined
                  </span>
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs text-red-600 font-bold hover:underline px-2 py-1 cursor-pointer"
                  >
                    Reopen & Share Location
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDecline}
                    className="flex-1 sm:flex-initial px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Review & Share Location</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Note */}
          {responseStatus === 'NOTIFIED' && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1 bg-amber-50/60 p-2 rounded-lg border border-amber-200/50">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Your real-time coordinates and phone remain private until you click "Review & Share Location" and authorize the popup prompt.
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Explicit Location Sharing Modal */}
      {isLocationModalOpen && (
        <LocationShareModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          request={request}
          donorProfile={donorProfile}
          user={user}
          onConfirmShare={handleConfirmShare}
          onDecline={handleDecline}
        />
      )}
    </>
  );
};
