import React from 'react';
import { Calendar, CheckCircle, Clock, Heart, Sparkles, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { calculateCooldown, COOLDOWN_DAYS } from '../../utils/bloodCompatibility';
import { storageService } from '../../services/storageService';

export const CooldownBanner: React.FC = () => {
  const { donorProfile, refreshProfiles } = useAuth();

  if (!donorProfile) return null;

  const cooldown = calculateCooldown(donorProfile.lastDonationDate);

  const handleSimulateDonatedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const updated = {
      ...donorProfile,
      lastDonationDate: today,
      totalDonations: (donorProfile.totalDonations || 0) + 1,
    };
    storageService.updateDonor(updated);
    refreshProfiles();
  };

  const handleSimulateEligible = () => {
    // 95 days ago -> fully eligible
    const past = new Date();
    past.setDate(past.getDate() - 95);
    const updated = {
      ...donorProfile,
      lastDonationDate: past.toISOString().split('T')[0],
    };
    storageService.updateDonor(updated);
    refreshProfiles();
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        cooldown.isEligible
          ? 'bg-linear-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200 shadow-sm'
          : 'bg-linear-to-r from-amber-50 via-orange-50/50 to-white border-amber-200 shadow-sm'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Status & Countdown */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              cooldown.isEligible ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
            }`}
          >
            {cooldown.isEligible ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <Clock className="w-6 h-6 animate-pulse" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  cooldown.isEligible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {cooldown.isEligible ? 'Active Donor · Eligible' : 'Cooldown Active'}
              </span>
              <span className="text-xs text-slate-500">
                Mandatory {COOLDOWN_DAYS}-Day Interval
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {cooldown.isEligible ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  You are Fully Eligible to Donate Blood
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </span>
              ) : (
                <span className="text-amber-800">
                  {cooldown.daysRemaining} days remaining until next donation
                </span>
              )}
            </h3>

            <p className="text-xs text-slate-600 mt-0.5">
              {cooldown.isEligible ? (
                donorProfile.lastDonationDate ? (
                  <>Last donated on <strong>{donorProfile.lastDonationDate}</strong>. Your hemoglobin and platelet levels have recovered.</>
                ) : (
                  'No recorded past donations yet. Ready for your first life-saving donation!'
                )
              ) : (
                <>Next eligible donation date: <strong>{cooldown.nextEligibleDate}</strong>. Allows your iron reserves to replenish safely.</>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Demo controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0">
          {cooldown.isEligible ? (
            <button
              onClick={handleSimulateDonatedToday}
              className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Test cooldown timer by simulating a donation right now"
            >
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              Simulate Donated Today
            </button>
          ) : (
            <button
              onClick={handleSimulateEligible}
              className="w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-slate-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Fast-forward past 90 days to test ready-to-donate state"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-emerald-600" />
              Fast-Forward Cooldown
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar for Cooldown */}
      {!cooldown.isEligible && (
        <div className="mt-4 pt-3 border-t border-amber-200/60">
          <div className="flex justify-between text-[11px] font-semibold text-amber-900 mb-1">
            <span>Cooldown Recovery Progress:</span>
            <span>{cooldown.progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-amber-200/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-amber-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${cooldown.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
