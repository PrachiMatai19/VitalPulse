import React from 'react';
import { Award, Calendar, Heart, Building2, CheckCircle2 } from 'lucide-react';
import { DonationHistory } from '../../types';

interface DonationHistoryTableProps {
  history: DonationHistory[];
}

export const DonationHistoryTable: React.FC<DonationHistoryTableProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        <Heart className="w-10 h-10 text-rose-300 mx-auto mb-2" />
        <h4 className="font-bold text-slate-800 text-sm">No Donation History Yet</h4>
        <p className="text-xs text-slate-500 mt-1">
          When a hospital marks an urgent request fulfilled with your blood donation, your verified donation record and certificate will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900 text-base">
            Verified Donation Log & Certificates
          </h3>
        </div>
        <span className="text-xs bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-full border border-red-100">
          {history.length} Donations Recorded
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {history.map((record) => (
          <div
            key={record.id}
            className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-900 text-sm">{record.hospitalName}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified Fulfilled
                </span>
              </div>
              <p className="text-xs text-slate-500">{record.notes}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-slate-600 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{record.donatedOn}</span>
                </div>
                <span className="text-xs font-bold text-red-600">
                  {record.units} Unit ({record.bloodGroup})
                </span>
              </div>

              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs" title="Verified Life Saver">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
