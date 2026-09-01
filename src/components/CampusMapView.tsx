import React, { useState } from 'react';
import { CCTVCamera } from '../types';
import { 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  Radio, 
  Layers, 
  Navigation, 
  Siren, 
  Activity, 
  Zap 
} from 'lucide-react';

interface CampusMapViewProps {
  cameras: CCTVCamera[];
  selectedCamera: CCTVCamera;
  onSelectCamera: (cam: CCTVCamera) => void;
}

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  cameras,
  selectedCamera,
  onSelectCamera,
}) => {
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showGuardRoutes, setShowGuardRoutes] = useState<boolean>(true);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              Tactical Campus Surveillance & GIS Map
            </h3>
            <p className="text-xs text-slate-400">
              Live CCTV node tracking, field-of-view cones, safety heatmaps & rapid reaction patrol routes
            </p>
          </div>
        </div>

        {/* Map Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              showHeatmap
                ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1" />
            <span>{showHeatmap ? 'Heatmap ON' : 'Heatmap OFF'}</span>
          </button>

          <button
            onClick={() => setShowGuardRoutes(!showGuardRoutes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              showGuardRoutes
                ? 'bg-sky-950/80 text-sky-300 border-sky-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5 inline mr-1" />
            <span>{showGuardRoutes ? 'Patrol Units ON' : 'Units OFF'}</span>
          </button>
        </div>
      </div>

      {/* SVG Interactive Blueprint Stage */}
      <div className="relative w-full aspect-[16/9] min-h-[420px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
        <svg
          viewBox="0 0 850 560"
          className="w-full h-full select-none"
        >
          {/* Blueprint Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
            {/* Heatmap Gradients */}
            <radialGradient id="heat-hostel" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.45)" />
              <stop offset="60%" stopColor="rgba(245, 158, 11, 0.2)" />
              <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
            </radialGradient>
            <radialGradient id="heat-sports" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.5)" />
              <stop offset="70%" stopColor="rgba(245, 158, 11, 0.15)" />
              <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
            </radialGradient>
            <radialGradient id="heat-quad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.25)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
            </radialGradient>
          </defs>

          <rect width="100%" height="100%" fill="#060911" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Campus Roads & Pathways */}
          {/* Main Ring Road */}
          <path
            d="M 120 80 L 740 80 L 740 480 L 120 480 Z"
            fill="none"
            stroke="#1e293b"
            strokeWidth="32"
            strokeLinejoin="round"
          />
          <path
            d="M 120 80 L 740 80 L 740 480 L 120 480 Z"
            fill="none"
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="8 8"
          />

          {/* Cross Corridor Arteries */}
          <path d="M 430 80 L 430 480" stroke="#1e293b" strokeWidth="24" />
          <path d="M 120 280 L 740 280" stroke="#1e293b" strokeWidth="20" />

          {/* Campus Buildings Outlines */}
          {/* Girls Hostel Sector */}
          <rect x="140" y="100" width="130" height="90" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <text x="205" y="150" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="600" fontFamily="JetBrains Mono">
            GIRLS HOSTEL HUB
          </text>

          {/* Library & Academic Complex */}
          <rect x="340" y="140" width="140" height="110" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <text x="410" y="200" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="600" fontFamily="JetBrains Mono">
            CENTRAL LIBRARY
          </text>

          {/* Main Academic Quadrangle */}
          <rect x="460" y="270" width="130" height="110" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <text x="525" y="330" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="600" fontFamily="JetBrains Mono">
            MAIN QUADRANGLE
          </text>

          {/* Basement Parking Lot */}
          <rect x="200" y="380" width="140" height="80" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <text x="270" y="425" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="600" fontFamily="JetBrains Mono">
            PARKING LOT B
          </text>

          {/* Sports Complex & Woodland Boundary */}
          <rect x="620" y="100" width="140" height="120" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <text x="690" y="165" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="600" fontFamily="JetBrains Mono">
            SPORTS COMPLEX
          </text>

          {/* Cafeteria & Dining Hall */}
          <rect x="480" y="420" width="140" height="70" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <text x="550" y="460" fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="600" fontFamily="JetBrains Mono">
            MESS & CAFETERIA
          </text>

          {/* Heatmap Overlays */}
          {showHeatmap && (
            <g className="transition-opacity duration-300">
              {/* High risk cluster around Hostel North Pathway */}
              <circle cx="180" cy="140" r="110" fill="url(#heat-hostel)" />
              {/* High risk cluster around Sports woodland */}
              <circle cx="680" cy="160" r="120" fill="url(#heat-sports)" />
              {/* Elevated risk at Parking Lot */}
              <circle cx="260" cy="440" r="90" fill="url(#heat-hostel)" />
              {/* Safe zone at Quadrangle */}
              <circle cx="500" cy="320" r="100" fill="url(#heat-quad)" />
            </g>
          )}

          {/* Patrol Unit Routes (PCR Van & QRT) */}
          {showGuardRoutes && (
            <g>
              {/* PCR Van 9 Patrol Path */}
              <path
                d="M 120 80 L 740 80 L 740 280 L 430 280"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              {/* PCR Van 9 Icon Marker */}
              <circle cx="340" cy="80" r="12" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              <text x="340" y="84" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="700">
                PCR-9
              </text>

              {/* Campus QRT Bike 4 */}
              <circle cx="430" cy="280" r="10" fill="#eab308" stroke="#ffffff" strokeWidth="1.5" />
              <text x="430" y="283.5" fill="#000000" fontSize="8" textAnchor="middle" fontWeight="800">
                QRT
              </text>
            </g>
          )}

          {/* Live Subject Tracking Dots on Campus Blueprint (Female: Magenta Dot, Male: Cyan/Amber Dot) */}
          <g>
            {/* Subject 1 (Female Student) at Hostel Pathway */}
            <circle cx="175" cy="142" r="9" fill="#ec4899" className="animate-pulse opacity-40" />
            <circle cx="175" cy="142" r="5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
            <text x="175" y="132" fill="#f472b6" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
              ♀ FEMALE (P-01)
            </text>

            {/* Subject 2 (Male Stalker Pursuer) trailing behind P-01 */}
            <circle cx="140" cy="142" r="9" fill="#f59e0b" className="animate-pulse opacity-40" />
            <circle cx="140" cy="142" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <text x="140" y="132" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
              ♂ MALE (P-02)
            </text>

            {/* Proximity Laser Trail between P-01 and P-02 */}
            <line x1="145" y1="142" x2="170" y2="142" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Subject 3 (Male Lookout) near Sports woodland */}
            <circle cx="670" cy="155" r="5" fill="#0ea5e9" stroke="#ffffff" strokeWidth="1.5" />
            <text x="670" y="145" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
              ♂ MALE (P-03)
            </text>

            {/* Subject 4 (Female Student) at Quadrangle */}
            <circle cx="510" cy="315" r="5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
            <text x="510" y="305" fill="#f472b6" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
              ♀ FEMALE (P-04)
            </text>
          </g>

          {/* CCTV Camera Cones & Interactive Markers */}
          {cameras.map((cam) => {
            const isSelected = selectedCamera.id === cam.id;
            const isCritical = cam.defaultThreatLevel === 'CRITICAL_DANGER';
            const isElevated = cam.defaultThreatLevel === 'THREAT_ELEVATED';

            let markerColor = '#10b981'; // Green
            if (isCritical) markerColor = '#f43f5e'; // Red/Rose
            else if (isElevated) markerColor = '#f59e0b'; // Amber

            return (
              <g
                key={cam.id}
                onClick={() => onSelectCamera(cam)}
                className="cursor-pointer group"
              >
                {/* Field-of-view Cone */}
                <path
                  d={`M ${cam.coordinates.x} ${cam.coordinates.y} L ${cam.coordinates.x - 45} ${cam.coordinates.y + 70} L ${cam.coordinates.x + 45} ${cam.coordinates.y + 70} Z`}
                  fill={isCritical ? 'rgba(244, 63, 94, 0.25)' : 'rgba(56, 189, 248, 0.15)'}
                  stroke={isCritical ? 'rgba(244, 63, 94, 0.6)' : 'rgba(56, 189, 248, 0.4)'}
                  strokeWidth="1"
                />

                {/* Pulsing Beacon for Critical Threats */}
                {isCritical && (
                  <circle
                    cx={cam.coordinates.x}
                    cy={cam.coordinates.y}
                    r="24"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Camera Node Circle */}
                <circle
                  cx={cam.coordinates.x}
                  cy={cam.coordinates.y}
                  r={isSelected ? 14 : 10}
                  fill={markerColor}
                  stroke={isSelected ? '#ffffff' : '#0f172a'}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-200 shadow-xl"
                />

                {/* Camera Code Label Badge */}
                <rect
                  x={cam.coordinates.x - 28}
                  y={cam.coordinates.y - 28}
                  width="56"
                  height="16"
                  rx="4"
                  fill="#090d16"
                  stroke={isSelected ? markerColor : '#334155'}
                  strokeWidth="1"
                />
                <text
                  x={cam.coordinates.x}
                  y={cam.coordinates.y - 17}
                  fill={isSelected ? '#ffffff' : '#cbd5e1'}
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {cam.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tactical Legend Floating Box */}
        <div className="absolute bottom-3 left-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-xs font-mono space-y-1.5 shadow-xl">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            TACTICAL BLUEPRINT LEGEND
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-rose-300">Critical Threat / Escalation Triggered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-amber-300">Elevated Suspicion / Trailing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-300">Safe / Routine Ambient Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-sky-300">Police PCR Flying Squad En Route</span>
          </div>
          <div className="pt-1 mt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 ring-1 ring-white" />
              <span className="text-pink-300 font-bold">♀ Female Subject</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-1 ring-white" />
              <span className="text-sky-300 font-bold">♂ Male Entity</span>
            </div>
          </div>
        </div>

        {/* Selected Camera Details Banner */}
        <div className="absolute top-3 left-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-xs flex items-center gap-3 shadow-xl">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="font-bold text-slate-100 flex items-center gap-2">
              <span>{selectedCamera.code}</span>
              <span>•</span>
              <span className="text-sky-400">{selectedCamera.name}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Lux: {selectedCamera.ambientLux} lx | ISO: {selectedCamera.isolationLevel} | Nearest Sentry: {selectedCamera.nearestGuardDistanceMeters}m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
