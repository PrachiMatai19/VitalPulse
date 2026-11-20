import React from 'react';
import { ShieldCheck, Heart, PhoneCall, Lock, MapPin } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4">
        {/* Top Emergency Action Strip (Prominent India Blood Helplines) */}
        <div className="bg-linear-to-r from-red-950/80 via-slate-900 to-rose-950/80 p-6 rounded-2xl border border-red-900/50 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase bg-red-500/20 text-rose-300 border border-red-400/30 px-2 py-0.5 rounded-md">
                  India 24/7 National Emergency Helplines
                </span>
                <span className="text-[10px] font-bold text-slate-400">MoHFW & Red Cross</span>
              </div>
              <h4 className="text-white font-bold text-base sm:text-lg">
                National Blood Helpline (e-RaktKosh / Indian Red Cross)
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span>Toll-Free Helpline: <strong className="text-rose-400 font-mono text-sm">1910</strong></span>
                <span>•</span>
                <span>e-RaktKosh: <strong className="text-rose-400 font-mono text-sm">1800-180-1104</strong></span>
                <span>•</span>
                <span>Emergency Health: <strong className="text-rose-400 font-mono text-sm">104</strong> / <strong className="text-rose-400 font-mono text-sm">112</strong></span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('compatibility')}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-700"
            >
              Compatibility Matrix
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer shadow-md shadow-red-600/30"
            >
              Become a Donor
            </button>
          </div>
        </div>

        {/* 4 Column Architecture Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-sm">
          {/* Col 1: Project Identity */}
          <div className="space-y-3">
            <BrandLogo size="sm" variant="dark" subtitle="Emergency Blood Network" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time emergency blood grid connecting verified healthcare institutions and compassionate volunteer donors across regions.
            </p>
          </div>

          {/* Col 2: Privacy Safeguards */}
          <div className="space-y-2">
            <h5 className="text-xs uppercase font-bold tracking-wider text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              Privacy-Aware Model
            </h5>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Contact hidden until donor explicitly accepts</span>
              </li>
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>15-min live location freshness check (home fallback)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero movement tracking history recorded</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Hospital access audit logs recorded</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Medical Rules */}
          <div className="space-y-2">
            <h5 className="text-xs uppercase font-bold tracking-wider text-slate-200 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              Clinical Rules
            </h5>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• <strong>90-Day Cooldown</strong> between donations</li>
              <li>• Automated blood compatibility matching</li>
              <li>• Haversine distance proximity ranking</li>
              <li>• Admin verification of hospital medical licenses</li>
            </ul>
          </div>

          {/* Col 4: Platform Views */}
          <div className="space-y-2">
            <h5 className="text-xs uppercase font-bold tracking-wider text-slate-200">
              Quick Portals
            </h5>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Blood Awareness Facts & Statistics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('compatibility')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Interactive Compatibility Explorer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('donor-dashboard')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Volunteer Donor Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Hospital Registration & Verification
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 VitalPulse Emergency Blood Network. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with care for emergency medical response</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
