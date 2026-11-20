import React from 'react';
import { Building2, CheckCircle2, XCircle, ShieldAlert, Award } from 'lucide-react';
import { Hospital } from '../../types';
import { storageService } from '../../services/storageService';

interface HospitalVerificationCardProps {
  hospital: Hospital;
  onRefresh: () => void;
}

export const HospitalVerificationCard: React.FC<HospitalVerificationCardProps> = ({
  hospital,
  onRefresh,
}) => {
  const handleVerify = (verified: boolean) => {
    const updated = {
      ...hospital,
      verified,
    };
    storageService.updateHospital(updated);
    onRefresh();
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        hospital.verified
          ? 'bg-white border-slate-200'
          : 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                hospital.verified ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">{hospital.hospitalName}</h4>
              <p className="text-xs text-slate-500">
                {hospital.address}, {hospital.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap pt-1">
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              License: {hospital.licenseNo}
            </span>
            <span>Contact: <strong>{hospital.contactPerson}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hospital.verified ? (
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Clinical Facility
              </span>
              <button
                onClick={() => handleVerify(false)}
                className="text-xs text-slate-400 hover:text-red-600 hover:underline px-2 cursor-pointer"
                title="Revoke verification"
              >
                Revoke
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Pending Verification
              </span>
              <button
                onClick={() => handleVerify(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve License
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
