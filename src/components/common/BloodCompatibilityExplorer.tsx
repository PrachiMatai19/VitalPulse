import React, { useState } from 'react';
import { Droplet, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { BloodGroup } from '../../types';
import {
  RECIPIENT_CAN_RECEIVE_FROM,
  DONOR_CAN_GIVE_TO,
  isBloodCompatible,
} from '../../utils/bloodCompatibility';

const ALL_BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const BloodCompatibilityExplorer: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [testDonor, setTestDonor] = useState<BloodGroup>('O-');
  const [testRecipient, setTestRecipient] = useState<BloodGroup>('A+');

  const canGiveTo = DONOR_CAN_GIVE_TO[selectedGroup] || [];
  const canReceiveFrom = RECIPIENT_CAN_RECEIVE_FROM[selectedGroup] || [];
  const testCompatible = isBloodCompatible(testDonor, testRecipient);

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Droplet className="w-7 h-7 fill-white text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Interactive Blood Compatibility Engine
            </h3>
            <p className="text-rose-100 text-xs sm:text-sm mt-0.5">
              Explore red blood cell compatibility rules enforced by our matching algorithm.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Selector Bar */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Select a Blood Group to Inspect:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {ALL_BLOOD_GROUPS.map((group) => {
              const isSelected = selectedGroup === group;
              const isUniversalDonor = group === 'O-';
              const isUniversalRecipient = group === 'AB+';

              return (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`relative p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/25 scale-105'
                      : 'bg-slate-50 hover:bg-rose-50/60 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="text-lg font-black tracking-tight">{group}</span>
                  {isUniversalDonor && (
                    <span className="text-[9px] uppercase font-bold tracking-tight text-amber-300 mt-0.5">
                      Uni Donor
                    </span>
                  )}
                  {isUniversalRecipient && (
                    <span className="text-[9px] uppercase font-bold tracking-tight text-emerald-300 mt-0.5">
                      Uni Recip
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Breakdown for Selected Blood Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: Who this blood group can DONATE to */}
          <div className="bg-red-50/60 rounded-xl p-5 border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-red-600 text-white text-xs font-black flex items-center justify-center">
                {selectedGroup}
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Can DONATE Red Blood Cells To ({canGiveTo.length} types)
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              If an emergency patient has any of the following blood types, a <strong className="text-red-700">{selectedGroup}</strong> donor can safely give blood:
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_BLOOD_GROUPS.map((target) => {
                const compatible = canGiveTo.includes(target);
                return (
                  <span
                    key={target}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                      compatible
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 line-through opacity-60'
                    }`}
                  >
                    <Droplet className={`w-3.5 h-3.5 ${compatible ? 'fill-white' : ''}`} />
                    {target}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Box 2: Who this blood group can RECEIVE from */}
          <div className="bg-emerald-50/60 rounded-xl p-5 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                {selectedGroup}
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Can RECEIVE Red Blood Cells From ({canReceiveFrom.length} types)
              </h4>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              If a patient is <strong className="text-emerald-700">{selectedGroup}</strong>, hospitals can accept donations from these compatible donor groups:
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_BLOOD_GROUPS.map((source) => {
                const compatible = canReceiveFrom.includes(source);
                return (
                  <span
                    key={source}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                      compatible
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 line-through opacity-60'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {source}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rapid Compatibility Test Simulator */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-rose-200">
              Live Transfusion Safety Tester
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Donor Select */}
            <div className="w-full sm:w-auto flex-1">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Volunteer Donor Group:
              </label>
              <select
                value={testDonor}
                onChange={(e) => setTestDonor(e.target.value as BloodGroup)}
                aria-label="Volunteer Donor Group"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              >
                {ALL_BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    Donor: {g} {g === 'O-' ? '(Universal)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="shrink-0 flex items-center justify-center pt-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Recipient Select */}
            <div className="w-full sm:w-auto flex-1">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Hospital Patient Needed Group:
              </label>
              <select
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value as BloodGroup)}
                aria-label="Hospital Patient Needed Group"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              >
                {ALL_BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    Patient: {g} {g === 'AB+' ? '(Universal Recipient)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Result Badge */}
            <div className="w-full sm:w-auto shrink-0 pt-2">
              {testCompatible ? (
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl text-center">
                  <div className="flex items-center gap-1.5 font-bold text-xs justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>SAFE MATCH</span>
                  </div>
                  <span className="text-[10px] text-emerald-200">
                    {testDonor} can donate to {testRecipient}
                  </span>
                </div>
              ) : (
                <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-xl text-center">
                  <div className="flex items-center gap-1.5 font-bold text-xs justify-center">
                    <span>INCOMPATIBLE</span>
                  </div>
                  <span className="text-[10px] text-red-200">
                    Hemolytic reaction risk
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
