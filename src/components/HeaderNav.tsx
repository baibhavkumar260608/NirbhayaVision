import React from 'react';
import { 
  ShieldAlert, 
  Grid, 
  Eye, 
  Map, 
  BarChart3, 
  Info, 
  HelpCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface HeaderNavProps {
  activeTab: 'grid' | 'inspector' | 'map' | 'analytics';
  setActiveTab: (tab: 'grid' | 'inspector' | 'map' | 'analytics') => void;
  activeThreatCount: number;
  onOpenInfoModal: () => void;
  isSimpleMode?: boolean;
  onToggleSimpleMode?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  activeThreatCount,
  onOpenInfoModal,
  isSimpleMode = true,
  onToggleSimpleMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-950/50 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                <span>NirbhayaVision</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                  AI Women Safety
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Real-Time Surveillance • Colored Dot Tracking (♀ Pink / ♂ Blue) • Auto-Police Alert
            </p>
          </div>
        </div>

        {/* Navigation Tabs with Clear Human-Readable Labels */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'grid'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="View Live CCTV Cameras"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>1. Live Cameras</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'inspector'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Inspect AI Vision & Pose Detection"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2. AI Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'map'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="View Campus Blueprint Map"
          >
            <Map className="w-3.5 h-3.5" />
            <span>3. Campus Map</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'analytics'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="View Safety Incident Logs & Reports"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>4. Incident Logs</span>
          </button>
        </nav>

        {/* Right Status Actions & Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Simple vs Pro Mode Toggle */}
          {onToggleSimpleMode && (
            <button
              onClick={onToggleSimpleMode}
              className={`px-2.5 py-1 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                isSimpleMode
                  ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
              title="Toggle between Simple Easy Mode and Advanced Operator Mode"
            >
              {isSimpleMode ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-[11px]">Simple Mode: ON</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-[11px] text-slate-400">Pro Operator View</span>
                </>
              )}
            </button>
          )}

          {/* Active Alert Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-slate-300 text-[11px]">
              Alerts: <strong className="text-rose-400">{activeThreatCount}</strong>
            </span>
          </div>

          {/* How It Works Guide Button */}
          <button
            onClick={onOpenInfoModal}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-all"
            title="How this system works"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">How It Works</span>
          </button>
        </div>
      </div>
    </header>
  );
};
