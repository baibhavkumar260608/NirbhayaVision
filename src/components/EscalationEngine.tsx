import React, { useState, useEffect, useRef } from 'react';
import { CCTVCamera, IncidentRecord, AlertStage } from '../types';
import { alertAudio } from '../utils/audioSynthesizer';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Siren, 
  Radio, 
  PhoneCall, 
  FileText, 
  XOctagon, 
  Zap, 
  Clock, 
  MapPin, 
  UserCheck, 
  Flame,
  ArrowRight,
  ShieldCheck,
  Megaphone
} from 'lucide-react';

interface EscalationEngineProps {
  activeCamera: CCTVCamera;
  onDispatchUpdate?: (incident: IncidentRecord) => void;
  onToggleSpotlight?: (active: boolean) => void;
}

export const EscalationEngine: React.FC<EscalationEngineProps> = ({
  activeCamera,
  onDispatchUpdate,
  onToggleSpotlight,
}) => {
  // Escalation Stage State
  const [currentStage, setCurrentStage] = useState<AlertStage>('STAGE_1_WARNING');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [spotlightOn, setSpotlightOn] = useState<boolean>(false);
  const [operatorNote, setOperatorNote] = useState<string>('');
  const [showDismissModal, setShowDismissModal] = useState<boolean>(false);
  const [dismissReason, setDismissReason] = useState<string>('Routine verified campus activity');
  const [dispatchedData, setDispatchedData] = useState<any>(null);
  const [isAutoEscalating, setIsAutoEscalating] = useState<boolean>(false);

  // Warning threshold constants (in seconds)
  const STAGE_1_DURATION = 30;
  const STAGE_2_THRESHOLD = 15;
  const STAGE_3_THRESHOLD = 5;

  // Track timer interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mute with audio synthesizer
  const toggleMute = () => {
    const nextMute = !isAudioMuted;
    setIsAudioMuted(nextMute);
    alertAudio.setMuted(nextMute);
  };

  // Reset or start escalation when camera changes to a high threat
  useEffect(() => {
    if (activeCamera.defaultThreatLevel === 'CRITICAL_DANGER' || activeCamera.defaultThreatLevel === 'THREAT_ELEVATED') {
      setCurrentStage('STAGE_1_WARNING');
      setSecondsRemaining(STAGE_1_DURATION);
      setDispatchedData(null);
      alertAudio.playStage1Warning();
    } else {
      setCurrentStage('IDLE');
      setSecondsRemaining(0);
      alertAudio.stopContinuousAlert();
    }
  }, [activeCamera.id, activeCamera.defaultThreatLevel]);

  // Main Fail-Safe Countdown Logic
  useEffect(() => {
    if (currentStage === 'IDLE' || currentStage === 'ACKNOWLEDGED' || currentStage === 'DISMISSED_SAFE' || currentStage === 'STAGE_4_ESCALATED_POLICE') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Timer expired without human intermediate acknowledgement -> FAIL-SAFE AUTO DISPATCH!
          triggerFailSafeDispatch('FAIL_SAFE_TIMEOUT');
          return 0;
        }

        const nextSec = prev - 1;

        // Transitions between stages
        if (nextSec === STAGE_2_THRESHOLD) {
          setCurrentStage('STAGE_2_WARNING');
          alertAudio.playStage2Warning();
        } else if (nextSec === STAGE_3_THRESHOLD) {
          setCurrentStage('STAGE_3_WARNING');
          alertAudio.startContinuousSiren();
        }

        return nextSec;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStage]);

  // Trigger Police / Authority Fail-Safe Dispatch
  const triggerFailSafeDispatch = async (reasonType: 'FAIL_SAFE_TIMEOUT' | 'OPERATOR_MANUAL') => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentStage('STAGE_4_ESCALATED_POLICE');
    setIsAutoEscalating(true);
    alertAudio.startContinuousSiren();

    // Turn on CCTV floodlight spotlight
    setSpotlightOn(true);
    if (onToggleSpotlight) onToggleSpotlight(true);

    try {
      const response = await fetch('/api/dispatch-authorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: `INC-${Date.now().toString().slice(-6)}`,
          cameraName: activeCamera.name,
          location: activeCamera.locationDetails,
          threatScore: activeCamera.defaultThreatScore,
          threatLevel: activeCamera.defaultThreatLevel,
          genderRatio: activeCamera.defaultAnalysis.genderDistribution.ratioDescription,
          detectedBehaviors: activeCamera.defaultAnalysis.detectedBehaviors.map((b) => b.tag),
          escalationReason:
            reasonType === 'FAIL_SAFE_TIMEOUT'
              ? 'Human Intermediate Failed to Acknowledge after 3 Sequential Warnings (Fail-Safe Triggered)'
              : 'Direct Emergency Operator Escalation to Police 112',
          operatorNotes: operatorNote || 'Immediate rapid reaction unit requested.',
        }),
      });

      const data = await response.json();
      setDispatchedData(data);

      if (onDispatchUpdate) {
        onDispatchUpdate({
          id: data.incidentId || `INC-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          cameraId: activeCamera.id,
          cameraName: activeCamera.name,
          location: activeCamera.locationDetails,
          threatLevel: activeCamera.defaultThreatLevel,
          threatScore: activeCamera.defaultThreatScore,
          genderRatio: activeCamera.defaultAnalysis.genderDistribution.ratioDescription,
          detectedBehaviors: activeCamera.defaultAnalysis.detectedBehaviors.map((b) => b.tag),
          ambientLux: activeCamera.ambientLux,
          stage: 'STAGE_4_ESCALATED_POLICE',
          dispatchedAt: new Date().toLocaleTimeString(),
          dispatchUnits: data.unitsDispatched,
          operatorNotes: operatorNote,
        });
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsAutoEscalating(false);
    }
  };

  // Human Intermediate Acknowledges Alert
  const handleAcknowledge = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    alertAudio.stopContinuousAlert();
    setCurrentStage('ACKNOWLEDGED');

    if (onDispatchUpdate) {
      onDispatchUpdate({
        id: `INC-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toLocaleTimeString(),
        cameraId: activeCamera.id,
        cameraName: activeCamera.name,
        location: activeCamera.locationDetails,
        threatLevel: activeCamera.defaultThreatLevel,
        threatScore: activeCamera.defaultThreatScore,
        genderRatio: activeCamera.defaultAnalysis.genderDistribution.ratioDescription,
        detectedBehaviors: activeCamera.defaultAnalysis.detectedBehaviors.map((b) => b.tag),
        ambientLux: activeCamera.ambientLux,
        stage: 'ACKNOWLEDGED',
        acknowledgedBy: 'Control Room Operator #4 (Duty Officer Sharma)',
        acknowledgedAt: new Date().toLocaleTimeString(),
        operatorNotes: operatorNote || 'Visual monitoring ongoing; Radio check in progress with Sentry.',
      });
    }
  };

  // Human Intermediate Dismisses as Safe
  const handleDismiss = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    alertAudio.stopContinuousAlert();
    setCurrentStage('DISMISSED_SAFE');
    setShowDismissModal(false);
  };

  // Play Audio Deterrent Voice Announcement on CCTV Speaker
  const handleTriggerVoiceDeterrent = () => {
    alertAudio.playAudioDeterrentVoice();
  };

  // Toggle Camera Spotlight
  const handleToggleSpotlight = () => {
    const nextVal = !spotlightOn;
    setSpotlightOn(nextVal);
    if (onToggleSpotlight) onToggleSpotlight(nextVal);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
      {/* Top Header & Fail-Safe Status Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
              currentStage === 'STAGE_4_ESCALATED_POLICE'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : currentStage === 'STAGE_3_WARNING'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : currentStage === 'STAGE_2_WARNING'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : currentStage === 'STAGE_1_WARNING'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : currentStage === 'ACKNOWLEDGED'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {currentStage === 'STAGE_4_ESCALATED_POLICE' ? (
              <Siren className="w-6 h-6 animate-bounce" />
            ) : currentStage === 'ACKNOWLEDGED' ? (
              <UserCheck className="w-6 h-6" />
            ) : currentStage === 'DISMISSED_SAFE' ? (
              <ShieldCheck className="w-6 h-6" />
            ) : currentStage === 'IDLE' ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base sm:text-lg tracking-tight">
                {currentStage === 'STAGE_4_ESCALATED_POLICE'
                  ? '🚨 Emergency: Police 112 Dispatched'
                  : currentStage === 'ACKNOWLEDGED'
                  ? '✅ Under Operator Investigation'
                  : currentStage === 'DISMISSED_SAFE' || currentStage === 'IDLE'
                  ? '🟢 Area All Clear & Monitored'
                  : '🚨 Safety Alert: Immediate Action Required'}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Automatic Fail-Safe Protection: If you do not respond, the system will auto-call Police 112.
            </p>
          </div>
        </div>

        {/* Audio Siren Mute Toggle */}
        <button
          onClick={toggleMute}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
            isAudioMuted
              ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              : 'bg-rose-600/20 text-rose-300 border-rose-500/40 hover:bg-rose-600/30'
          }`}
          title={isAudioMuted ? 'Turn Alarm Sound ON' : 'Mute Alarm Sound'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />}
          <span>{isAudioMuted ? 'Alarm Sound: Muted' : 'Alarm Sound: ON'}</span>
        </button>
      </div>

      {/* 4-Step Visual Protection Roadmap */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>Automatic 4-Level Protection Ladder:</span>
          {secondsRemaining > 0 && (
            <span className="text-rose-400 font-mono font-bold animate-pulse">
              ⏱️ Auto-dispatch in {secondsRemaining}s
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          {/* Step 1 */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-0.5 transition-all ${
              currentStage === 'STAGE_1_WARNING'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/40 shadow'
                : currentStage === 'STAGE_2_WARNING' || currentStage === 'STAGE_3_WARNING' || currentStage === 'STAGE_4_ESCALATED_POLICE' || currentStage === 'ACKNOWLEDGED'
                ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="font-bold text-[11px]">1. Desk Alert</span>
            <span className="text-[10px] text-slate-400">Audio chime (30s)</span>
          </div>

          {/* Step 2 */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-0.5 transition-all ${
              currentStage === 'STAGE_2_WARNING'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/50 shadow'
                : currentStage === 'STAGE_3_WARNING' || currentStage === 'STAGE_4_ESCALATED_POLICE'
                ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="font-bold text-[11px]">2. Warden Ping</span>
            <span className="text-[10px] text-slate-400">SMS & Radio (15s)</span>
          </div>

          {/* Step 3 */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-0.5 transition-all ${
              currentStage === 'STAGE_3_WARNING'
                ? 'bg-red-500/25 border-red-500 text-red-300 ring-2 ring-red-500/60 animate-pulse shadow'
                : currentStage === 'STAGE_4_ESCALATED_POLICE'
                ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="font-bold text-[11px]">3. Loud Siren</span>
            <span className="text-[10px] text-slate-400">Floodlight on (5s)</span>
          </div>

          {/* Step 4 */}
          <div
            className={`p-2.5 rounded-xl border flex flex-col gap-0.5 transition-all ${
              currentStage === 'STAGE_4_ESCALATED_POLICE'
                ? 'bg-rose-600/30 border-rose-500 text-rose-200 ring-2 ring-rose-500 shadow-lg shadow-rose-950/60'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="font-bold text-[11px]">4. Police 112</span>
            <span className="text-[10px] text-slate-400">Auto-Dispatched</span>
          </div>
        </div>
      </div>

      {/* Main Alert Banner with Live Countdown */}
      {(currentStage === 'STAGE_1_WARNING' || currentStage === 'STAGE_2_WARNING' || currentStage === 'STAGE_3_WARNING') && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border-2 border-rose-500/70 shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            {/* Big Countdown Circle */}
            <div className="relative w-16 h-16 flex-shrink-0 flex flex-col items-center justify-center rounded-full bg-slate-950 border-2 border-rose-500 shadow-lg">
              <span className="font-mono text-xl font-black text-rose-400">
                {secondsRemaining}s
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Timer</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-200">
                  Suspicious Activity Detected — Operator Review Requested
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                A female subject (<span className="text-pink-400 font-bold">♀ Pink Dot</span>) is in an isolated low-light pathway with a trailing male (<span className="text-sky-400 font-bold">♂ Blue Dot</span>).
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-rose-400 font-bold">
                  Danger Score: {activeCamera.defaultThreatScore}/100
                </span>
                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-300">
                  Lighting: {activeCamera.ambientLux} Lux (Dark)
                </span>
                <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                  Location: {activeCamera.name}
                </span>
              </div>
            </div>
          </div>

          {/* User-Friendly Large Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
            {/* Button 1: Safe */}
            <button
              onClick={() => setShowDismissModal(true)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all shadow"
              title="Click if this is normal students walking safely"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark Safe (False Alarm)</span>
            </button>

            {/* Button 2: Acknowledge & Send Security Guard */}
            <button
              onClick={handleAcknowledge}
              className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-950/60 active:scale-95 transition-all"
              title="Stop countdown and dispatch on-duty campus guard"
            >
              <UserCheck className="w-4 h-4" />
              <span>Investigate (Send Guard)</span>
            </button>

            {/* Button 3: Instant Police 112 */}
            <button
              onClick={() => triggerFailSafeDispatch('OPERATOR_MANUAL')}
              className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/70 active:scale-95 transition-all animate-pulse"
              title="Immediately notify 112 Emergency Police Flying Squad"
            >
              <Siren className="w-4 h-4" />
              <span>Call Police (112) Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Stage 4: Dispatched View */}
      {currentStage === 'STAGE_4_ESCALATED_POLICE' && (
        <div className="p-4 rounded-xl bg-rose-950/70 border-2 border-rose-500 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <Siren className="w-5 h-5 animate-spin" />
              <span>FAIL-SAFE ENGAGED: AUTHORITIES AUTOMATICALLY DISPATCHED</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-900 text-rose-200 border border-rose-700">
              DISPATCH ID: {dispatchedData?.dispatchId || 'DISPATCH-POLICE-2026'}
            </span>
          </div>

          <p className="text-xs text-rose-100/90">
            Emergency alert was directed to Law Enforcement (Police Flying Squad 112) and Campus Rapid Reaction Team after no acknowledgement within timeout window.
          </p>

          {/* Units Dispatched Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono mt-1">
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-800/60 flex flex-col gap-0.5">
              <span className="text-slate-400 text-[10px]">PRIMARY RESPONDER</span>
              <strong className="text-rose-300">PCR Flying Squad Van 09</strong>
              <span className="text-emerald-400 text-[11px]">ETA: ~3 mins (En route)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-800/60 flex flex-col gap-0.5">
              <span className="text-slate-400 text-[10px]">CAMPUS QRT</span>
              <strong className="text-sky-300">Rapid Reaction Bike 4 & 5</strong>
              <span className="text-emerald-400 text-[11px]">ETA: ~45 secs (Sector 2)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-800/60 flex flex-col gap-0.5">
              <span className="text-slate-400 text-[10px]">HOSTEL WARDEN DESK</span>
              <strong className="text-yellow-300">Chief Proctor Patrol</strong>
              <span className="text-emerald-400 text-[11px]">ETA: ~1 min (On Scene)</span>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledged View */}
      {currentStage === 'ACKNOWLEDGED' && (
        <div className="p-4 rounded-xl bg-sky-950/50 border border-sky-500/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-sky-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-sky-200">
                Incident Acknowledged by Control Room Operator
              </h4>
              <p className="text-xs text-slate-300">
                Active visual tracking locked on {activeCamera.code}. Guard patrol dispatched via Walkie VHF Ch-4.
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerFailSafeDispatch('OPERATOR_MANUAL')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 flex-shrink-0"
          >
            <Siren className="w-4 h-4" />
            <span>Escalate to Police</span>
          </button>
        </div>
      )}

      {/* Interactive Deterrent & Tactical Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
        {/* Audio Deterrent Broadcast */}
        <button
          onClick={handleTriggerVoiceDeterrent}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs flex items-center gap-2 transition-all active:scale-95"
          title="Play live loudspeaker deterrent: 'You are under AI video surveillance'"
        >
          <Megaphone className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div className="text-left">
            <div className="font-semibold">Voice Deterrent</div>
            <div className="text-[10px] text-slate-400">Trigger CCTV Speaker</div>
          </div>
        </button>

        {/* Spotlight Floodlight Toggle */}
        <button
          onClick={handleToggleSpotlight}
          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all active:scale-95 ${
            spotlightOn
              ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200'
              : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200'
          }`}
          title="Turn on high-lux floodlight on camera post"
        >
          <Zap className={`w-4 h-4 flex-shrink-0 ${spotlightOn ? 'text-yellow-300 animate-spin' : 'text-slate-400'}`} />
          <div className="text-left">
            <div className="font-semibold">{spotlightOn ? 'Floodlight ON' : 'Trigger Spotlight'}</div>
            <div className="text-[10px] text-slate-400">Illuminates 500 lx</div>
          </div>
        </button>

        {/* Radio Dispatch Guard */}
        <button
          onClick={() => {
            alert(`Radio Dispatch Sent to ${activeCamera.nearestGuardPost} (${activeCamera.nearestGuardDistanceMeters}m away). Officer notified on Walkie Channel 2.`);
          }}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs flex items-center gap-2 transition-all active:scale-95"
        >
          <Radio className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <div className="text-left">
            <div className="font-semibold">Guard Walkie-Talkie</div>
            <div className="text-[10px] text-slate-400">Nearest: {activeCamera.nearestGuardDistanceMeters}m</div>
          </div>
        </button>

        {/* SOS Panic Alarm */}
        <button
          onClick={() => alertAudio.playStage2Warning()}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs flex items-center gap-2 transition-all active:scale-95"
        >
          <Flame className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <div className="text-left">
            <div className="font-semibold">Test Siren Tone</div>
            <div className="text-[10px] text-slate-400">Audio Check</div>
          </div>
        </button>
      </div>

      {/* Dismiss Audit Modal */}
      {showDismissModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Operator Audit: Dismiss False Positive</span>
            </div>
            <p className="text-xs text-slate-300">
              In compliance with women safety protocols, dismissing an active threat alert requires logging a justified operator reason into the permanent security ledger.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300">Select Clearance Reason:</label>
              <select
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Routine verified campus activity">Routine verified campus activity (Group study transit)</option>
                <option value="Known student escort / peer walking">Known student escort / peer walking</option>
                <option value="Campus maintenance / sanitation staff on duty">Campus maintenance / sanitation staff on duty</option>
                <option value="Lighting flicker optical anomaly">Lighting flicker optical anomaly</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowDismissModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
              >
                Confirm & Log Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
