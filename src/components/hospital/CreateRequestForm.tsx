import React, { useState } from 'react';
import { AlertCircle, Droplet, Plus, X, Building2 } from 'lucide-react';
import { BloodGroup, UrgencyLevel, BloodRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

interface CreateRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated: () => void;
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const CreateRequestForm: React.FC<CreateRequestFormProps> = ({
  isOpen,
  onClose,
  onRequestCreated,
}) => {
  const { hospitalProfile } = useAuth();

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('CRITICAL');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !hospitalProfile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newRequest: BloodRequest = {
      id: `req-${Date.now()}`,
      hospitalId: hospitalProfile.id,
      hospitalName: hospitalProfile.hospitalName,
      hospitalCity: hospitalProfile.city,
      lat: hospitalProfile.lat,
      lng: hospitalProfile.lng,
      bloodGroup,
      unitsNeeded: Number(unitsNeeded),
      urgency,
      patientNotes: patientNotes.trim() || undefined,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    storageService.addRequest(newRequest);
    setSubmitting(false);
    onRequestCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-linear-to-r from-red-600 to-rose-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Raise Emergency Blood Request</h3>
              <p className="text-xs text-rose-100 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {hospitalProfile.hospitalName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Blood Group Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Required Blood Group *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  className={`py-2 px-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    bloodGroup === bg
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20 scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  <Droplet className={`w-3.5 h-3.5 ${bloodGroup === bg ? 'fill-white' : 'text-red-500'}`} />
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Units Needed & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Units Needed (Whole Blood / RBC) *
              </label>
              <select
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                aria-label="Units Needed (Whole Blood / RBC)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} Unit{num > 1 ? 's' : ''} ({num * 350} - {num * 450} ml)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Clinical Urgency Level *
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                aria-label="Clinical Urgency Level"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              >
                <option value="CRITICAL">CRITICAL (Immediate Trauma / ICU)</option>
                <option value="URGENT">URGENT (Surgery within 2-4 hours)</option>
                <option value="NORMAL">NORMAL (Elective / Reserve Stock)</option>
              </select>
            </div>
          </div>

          {/* Clinical Patient Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Patient Case & Urgency Details (Optional)
            </label>
            <textarea
              rows={3}
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              placeholder="e.g. 34-year-old trauma patient in Emergency Operation Theater 2. Massive internal bleeding."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Location Confirmation */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Dispatch Location:</span>
            <span>
              {hospitalProfile.address} ({hospitalProfile.city})
            </span>
          </div>

          {/* Verification check reminder */}
          {!hospitalProfile.verified && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Note: Your hospital registration is pending Admin verification. Contact an administrator to expedite verification.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Droplet className="w-4 h-4 fill-white" />
              {submitting ? 'Broadcasting...' : 'Broadcast Urgent Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
