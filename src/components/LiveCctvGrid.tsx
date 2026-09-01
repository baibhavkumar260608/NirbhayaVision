import React, { useState } from 'react';
import { CCTVCamera, SIHScenarioPreset } from '../types';
import { CctvCanvasStream } from './CctvCanvasStream';
import { SIH_SCENARIOS } from '../data/cctvFeeds';
import { 
  Grid, 
  Eye, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  Maximize2, 
  Sparkles, 
  Play, 
  Filter 
} from 'lucide-react';

interface LiveCctvGridProps {
  cameras: CCTVCamera[];
  selectedCamera: CCTVCamera;
  onSelectCamera: (camera: CCTVCamera) => void;
  onApplyScenario: (scenario: SIHScenarioPreset) => void;
  spotlightActive?: boolean;
}

export const LiveCctvGrid: React.FC<LiveCctvGridProps> = ({
  cameras,
  selectedCamera,
  onSelectCamera,
  onApplyScenario,
  spotlightActive = false,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredCameras = cameras.filter((cam) => {
    if (filterLevel === 'ALL') return true;
    if (filterLevel === 'CRITICAL') return cam.defaultThreatLevel === 'CRITICAL_DANGER';
    if (filterLevel === 'ELEVATED') return cam.defaultThreatLevel === 'THREAT_ELEVATED' || cam.defaultThreatLevel === 'SUSPICIOUS';
    if (filterLevel === 'SAFE') return cam.defaultThreatLevel === 'SAFE';
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* SIH Scenario Quick Presets Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-rose-300">
              SIH 2026 Evaluation Scenarios
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Click to test multi-factor detection & fail-safe escalation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SIH_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onApplyScenario(sc)}
              className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all group flex flex-col justify-between gap-2 active:scale-98"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>{sc.time}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold ${
                      sc.threatExpected === 'CRITICAL_DANGER'
                        ? 'text-rose-400 bg-rose-950/60'
                        : sc.threatExpected === 'SAFE'
                        ? 'text-emerald-400 bg-emerald-950/60'
                        : 'text-amber-400 bg-amber-950/60'
                    }`}
                  >
                    {sc.threatExpected}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-100 group-hover:text-rose-300 transition-colors">
                  {sc.title}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 leading-snug">
                {sc.riskSummary}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Filter Feeds:
          </span>
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
            {[
              { id: 'ALL', label: 'All Cameras (6)' },
              { id: 'CRITICAL', label: '🚨 High Danger' },
              { id: 'ELEVATED', label: '🟡 Caution' },
              { id: 'SAFE', label: '🟢 Safe' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterLevel(f.id)}
                className={`px-3 py-1 rounded-lg transition-all font-medium ${
                  filterLevel === f.id
                    ? 'bg-rose-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong>{filteredCameras.length}</strong> of <strong>{cameras.length}</strong> Camera Feeds (Click any feed to focus)
        </span>
      </div>

      {/* CCTV Multi-Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCameras.map((cam) => {
          const isSelected = selectedCamera.id === cam.id;
          const isCritical = cam.defaultThreatLevel === 'CRITICAL_DANGER';

          return (
            <div
              key={cam.id}
              onClick={() => onSelectCamera(cam)}
              className={`rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col bg-slate-900 shadow-xl group ${
                isSelected
                  ? 'border-sky-500 ring-2 ring-sky-500/50'
                  : isCritical
                  ? 'border-rose-800/80 hover:border-rose-500'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* CCTV Canvas Viewport */}
              <div className="relative aspect-[16/10] w-full">
                <CctvCanvasStream
                  camera={cam}
                  isCompact={true}
                  spotlightActive={isSelected && spotlightActive}
                  showBoundingBoxes={true}
                />
              </div>

              {/* Camera Metadata Card Footer */}
              <div className="p-3.5 flex flex-col gap-2 bg-slate-950/90 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100 font-mono">{cam.code}</span>
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[180px]">
                      {cam.name}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cam.defaultThreatLevel === 'CRITICAL_DANGER'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : cam.defaultThreatLevel === 'THREAT_ELEVATED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {cam.defaultThreatLevel === 'CRITICAL_DANGER'
                      ? '🚨 Danger'
                      : cam.defaultThreatLevel === 'THREAT_ELEVATED'
                      ? '⚠️ Caution'
                      : '🟢 Safe'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Lighting: <strong className="text-amber-300">{cam.ambientLux} lx</strong></span>
                  <span>Time: <strong className="text-slate-300">{cam.timeOfDay}</strong></span>
                  <span>Nearest Guard: <strong className="text-sky-300">{cam.nearestGuardDistanceMeters}m</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
