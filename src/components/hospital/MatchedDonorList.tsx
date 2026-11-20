import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Radio,
  Eye,
  Award,
} from 'lucide-react';
import { BloodRequest, MatchedDonor } from '../../types';
import { storageService } from '../../services/storageService';
import { formatDistance } from '../../utils/haversine';
import { useAuth } from '../../context/AuthContext';

interface MatchedDonorListProps {
  request: BloodRequest;
  matchedDonors: MatchedDonor[];
  onRefresh: () => void;
  onSelectDonorForMap?: (donor: MatchedDonor) => void;
}

export const MatchedDonorList: React.FC<MatchedDonorListProps> = ({
  request,
  matchedDonors,
  onRefresh,
  onSelectDonorForMap,
}) => {
  const { hospitalProfile } = useAuth();

  const handleLogViewContact = (donor: MatchedDonor) => {
    if (hospitalProfile && donor.hasAccepted) {
      storageService.logAccess(
        hospitalProfile.id,
        hospitalProfile.hospitalName,
        donor.donorId,
        donor.name || 'Anonymous Donor',
        request.id
      );
    }
  };

  const handleFulfill = (donor: MatchedDonor) => {
    if (
      window.confirm(
        `Are you sure you want to mark this emergency request as FULFILLED with blood donation from ${
          donor.name || 'this donor'
        }? This will record the donation in the donor's history and restart their 90-day cooldown.`
      )
    ) {
      storageService.fulfillRequest(request.id, donor.donorId);
      onRefresh();
    }
  };

  if (matchedDonors.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
        <Clock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h4 className="font-bold text-slate-800 text-sm">No Compatible Eligible Donors Nearby</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          The matching engine scans for compatible blood groups (matching {request.bloodGroup}), active emergency availability, and completed 90-day cooldown periods.
        </p>
      </div>
    );
  }

  const acceptedCount = matchedDonors.filter((d) => d.hasAccepted).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span>Matching Engine Results</span>
            <span className="text-xs font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
              {matchedDonors.length} Found
            </span>
            {acceptedCount > 0 && (
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {acceptedCount} Accepted
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-500">
            Sorted by Haversine proximity. Privacy model: contact revealed only upon acceptance.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {matchedDonors.map((donor, idx) => {
          return (
            <div
              key={donor.donorId}
              className={`rounded-2xl border transition-all p-4.5 ${
                donor.hasAccepted
                  ? 'bg-linear-to-r from-emerald-50/70 via-teal-50/30 to-white border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Donor Header Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-8 h-8 rounded-xl bg-red-100 text-red-700 font-black text-xs flex items-center justify-center shrink-0">
                      {donor.bloodGroup}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {donor.hasAccepted ? donor.name : `Anonymous Donor #${donor.donorId.slice(-4)}`}
                    </span>
                    {donor.hasAccepted && (
                      <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        ACCEPTED
                      </span>
                    )}
                    {!donor.hasAccepted && (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {donor.responseStatus === 'DECLINED' ? 'Declined' : 'Pending Response'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>
                      {donor.age} yrs · {donor.gender}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      {formatDistance(donor.distanceKm)} away
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      {donor.locationSource === 'LIVE' && donor.isLiveFresh ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse" />
                          Live GPS (&lt;15m)
                        </span>
                      ) : (
                        <span className="text-slate-500">Home Base Location</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Privacy Badge or Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {donor.hasAccepted ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {donor.phone && (
                        <a
                          href={`tel:${donor.phone}`}
                          onClick={() => handleLogViewContact(donor)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Donor</span>
                        </a>
                      )}
                      {onSelectDonorForMap && donor.lat && (
                        <button
                          onClick={() => {
                            handleLogViewContact(donor);
                            onSelectDonorForMap(donor);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span>View on Map</span>
                        </button>
                      )}
                      {request.status !== 'FULFILLED' && (
                        <button
                          onClick={() => handleFulfill(donor)}
                          className="px-3 py-1.5 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Mark Fulfilled</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact Hidden Until Accepted</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Revealed Contact Details Box (Section 6 & 10) */}
              {donor.hasAccepted && (
                <div className="mt-3 pt-3 border-t border-emerald-200/60 bg-emerald-100/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <strong className="text-slate-900 font-mono">{donor.phone}</strong>
                    </div>
                    {donor.email && (
                      <div className="flex items-center gap-1 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{donor.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Coords: {donor.lat?.toFixed(4)}, {donor.lng?.toFixed(4)} ({donor.city})
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Access audit logged
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
