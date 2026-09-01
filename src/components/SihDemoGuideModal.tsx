import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  ArrowRight, 
  Siren, 
  Clock, 
  SunMedium, 
  Users, 
  MapPin, 
  Zap, 
  Sparkles 
} from 'lucide-react';

interface SihDemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SihDemoGuideModal: React.FC<SihDemoGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  NirbhayaVision — SIH 2026 Submission
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                  PROBLEM STATEMENT: WOMEN SAFETY ANALYTICS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-Time Contextual CCTV Threat Detection with Fail-Safe Authority Escalation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
          >
            ✕
          </button>
        </div>

        {/* 1. Core Challenge & Solution */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            1. Visual Tracking with Distinct Gender Identification Dots
          </h3>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-pink-500 ring-4 ring-pink-500/20 flex items-center justify-center text-white font-bold text-xs">
                ♀
              </div>
              <div>
                <strong className="text-pink-300 text-xs block">Pink Dot = Female Subject</strong>
                <span className="text-[11px] text-slate-400">Continuous protection tracking, trajectory vectoring, and isolation monitoring</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-sky-500 ring-4 ring-sky-500/20 flex items-center justify-center text-white font-bold text-xs">
                ♂
              </div>
              <div>
                <strong className="text-sky-300 text-xs block">Blue / Amber Dot = Male Entity / Pursuer</strong>
                <span className="text-[11px] text-slate-400">Proximity tracking, velocity acceleration detection, and cornering alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. The Core Innovation: Multi-Factor Situational Reasoning */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            2. Multi-Factor Situational Reasoning Factors
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
            Standard CCTV only looks at simple movement. <strong>NirbhayaVision</strong> computes risk based on 4 real-world safety factors:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-indigo-400 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                Gender Skew
              </div>
              <p className="text-[11px] text-slate-400">
                Flags 1 isolated female surrounded by unverified males.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <SunMedium className="w-3.5 h-3.5" />
                Darkness (Lux)
              </div>
              <p className="text-[11px] text-slate-400">
                Measures sub-30 Lux deficit where darkness conceals harassment.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-sky-400 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                Time of Day
              </div>
              <p className="text-[11px] text-slate-400">
                Applies late night curfew multipliers (e.g. 01:45 AM).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-rose-400 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                Location Risk
              </div>
              <p className="text-[11px] text-slate-400">
                Evaluates distance to nearest guard post and exit routes.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Fail-Safe Escalation Model Architecture */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            3. The 30-Second Fail-Safe Protection Timer
          </h3>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2 text-slate-300 font-mono">
              <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                Stage 1: Warning 1 (30s)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
              <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Stage 2: Warden SMS (15s)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
              <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                Stage 3: Campus Siren (5s)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
              <span className="px-2 py-1 rounded bg-rose-600 text-white font-bold animate-pulse">
                Stage 4: Police 112 Auto-Call
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed pt-2 border-t border-slate-800">
              If the control room operator is away, distracted, or asleep, the system will not drop the alert. Once the countdown expires, <strong>NirbhayaVision automatically contacts the Police Flying Squad (112)</strong> and dispatches the Campus Rapid Reaction Unit.
            </p>
          </div>
        </div>

        {/* 4. Live Evaluation Testing Guide */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            3. How to Test for Hackathon Demonstration
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Test Scenarios:</strong> Click any of the 4 scenario presets on the CCTV Grid (e.g. <em>Scenario A: Stalking in Dark Corridor</em> vs <em>Scenario D: Safe Quadrangle</em>) to watch situational threat scoring adapt instantly.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Test Fail-Safe Timer:</strong> Let the 30-second warning countdown elapse on CAM-01 to observe automated transition into Stage 4 Police Dispatch with audio siren activation and incident ticket generation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Upload / Webcam Vision Test:</strong> In the <em>AI Inspector</em> tab, upload custom CCTV photos or enable your laptop webcam to run live Gemini 3.7 Flash analysis.
              </span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-950/50"
          >
            Enter Surveillance Control Room
          </button>
        </div>
      </div>
    </div>
  );
};
