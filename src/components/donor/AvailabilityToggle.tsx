import React from 'react';
import { Power, MapPin, Radio, Shield, RefreshCw, AlertCircle, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { useLiveLocation } from '../../hooks/useLiveLocation';

export const AvailabilityToggle: React.FC = () => {
  const { donorProfile, refreshProfiles } = useAuth();
  const { requestBrowserPosition, simulateMovement, locationState } = useLiveLocation();

  if (!donorProfile) return null;

  const handleToggleAvailable = () => {
    const updated = {
      ...donorProfile,
      available: !donorProfile.available,
    };
    storageService.updateDonor(updated);
    refreshProfiles();
  };

  const handleToggleShareLive = () => {
    const updated = {
      ...donorProfile,
      shareLive: !donorProfile.shareLive,
      // If turning on, trigger timestamp update
      liveUpdatedAt: !donorProfile.shareLive ? new Date().toISOString() : donorProfile.liveUpdatedAt,
    };
    storageService.updateDonor(updated);
    refreshProfiles();
    if (!donorProfile.shareLive) {
      requestBrowserPosition();
    }
  };

  const handleSetStale = () => {
    // Set timestamp to 25 minutes ago (older than 15-min threshold to test fallback)
    const twentyFiveMinsAgo = new Date(Date.now() - 25 * 60 * 1000).toISOString();
    const updated = {
      ...donorProfile,
      liveUpdatedAt: twentyFiveMinsAgo,
    };
    storageService.updateDonor(updated);
    refreshProfiles();
  };

  // Determine freshness
  let isFresh = false;
  let minutesAgoNum = 0;
  if (donorProfile.liveUpdatedAt) {
    const diffMs = Date.now() - new Date(donorProfile.liveUpdatedAt).getTime();
    minutesAgoNum = Math.floor(diffMs / (60 * 1000));
    isFresh = diffMs <= 15 * 60 * 1000;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Top row: Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Toggle 1: Emergency Availability */}
        <div
          onClick={handleToggleAvailable}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            donorProfile.available
              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
              : 'bg-slate-50 border-slate-200 opacity-80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                donorProfile.available ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}
            >
              <Power className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {donorProfile.available ? 'Available for Emergencies' : 'Availability Paused'}
              </p>
              <p className="text-xs text-slate-600">
                {donorProfile.available
                  ? 'You will receive incoming urgent requests'
                  : 'You will not appear in matching searches'}
              </p>
            </div>
          </div>
          <div
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              donorProfile.available ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                donorProfile.available ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Toggle 2: Privacy-Aware Live Location Sharing */}
        <div
          onClick={handleToggleShareLive}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
            donorProfile.shareLive
              ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                donorProfile.shareLive ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}
            >
              <Radio className={`w-5 h-5 ${donorProfile.shareLive ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {donorProfile.shareLive ? 'Live Location Sharing Active' : 'Live Sharing Disabled'}
              </p>
              <p className="text-xs text-slate-600">
                {donorProfile.shareLive
                  ? 'Updates every 5 mins while app is open'
                  : 'Defaults to home location registered'}
              </p>
            </div>
          </div>
          <div
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              donorProfile.shareLive ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                donorProfile.shareLive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Location Status & Privacy Indicator */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs text-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-900">
              Privacy Status (Section 6 Model):
            </span>
            {donorProfile.shareLive && isFresh ? (
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live Fresh ({minutesAgoNum}m ago)
              </span>
            ) : donorProfile.shareLive && !isFresh ? (
              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Live Stale ({minutesAgoNum}m ago &gt; 15m) &rarr; Using Home Location
              </span>
            ) : (
              <span className="bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full text-[11px]">
                Home Location ({donorProfile.city})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>
              Effective Coords:{' '}
              {donorProfile.shareLive && isFresh && donorProfile.liveLat
                ? `${donorProfile.liveLat.toFixed(4)}, ${donorProfile.liveLng?.toFixed(4)}`
                : `${donorProfile.homeLat.toFixed(4)}, ${donorProfile.homeLng.toFixed(4)}`}
            </span>
          </div>
        </div>

        {/* Live Location Controls & Demo Testing */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span>Interactive Location Testing Tools:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => requestBrowserPosition()}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
              title="Poll current position"
            >
              <RefreshCw className="w-3 h-3" />
              Sync GPS Now
            </button>
            <button
              onClick={() => simulateMovement(0.008, -0.005)}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md text-[11px] font-semibold text-blue-700 cursor-pointer"
              title="Simulate movement closer to hospital"
            >
              + Move 1 km North
            </button>
            <button
              onClick={handleSetStale}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md text-[11px] font-semibold text-amber-800 cursor-pointer"
              title="Simulate location timestamp being older than 15 minutes"
            >
              Simulate Stale (&gt;15m)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
