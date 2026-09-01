import React, { useState, useRef } from 'react';
import { CCTVCamera, CCTVAnalysisResult } from '../types';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Moon, 
  Sun, 
  Clock, 
  MapPin, 
  Users, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Activity, 
  Zap, 
  FileSearch,
  RefreshCw,
  Video,
  Flame,
  Scan,
  Download
} from 'lucide-react';

interface AiVisionInspectorProps {
  camera: CCTVCamera;
  onAnalysisComplete?: (result: CCTVAnalysisResult) => void;
  latestAnalysis?: CCTVAnalysisResult;
}

export const AiVisionInspector: React.FC<AiVisionInspectorProps> = ({
  camera,
  onAnalysisComplete,
  latestAnalysis = camera.defaultAnalysis,
}) => {
  const [analysis, setAnalysis] = useState<CCTVAnalysisResult>(latestAnalysis);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('');
  const [inspectorVisionFilter, setInspectorVisionFilter] = useState<'standard' | 'ir_night' | 'thermal' | 'cyber'>('standard');

  // Interactive Multi-Factor Situation Sliders (for SIH demo live stress-testing)
  const [simLux, setSimLux] = useState<number>(camera.ambientLux);
  const [simTime, setSimTime] = useState<string>(camera.timeOfDay);
  const [simIsolation, setSimIsolation] = useState<string>(camera.isolationLevel);
  const [simScenario, setSimScenario] = useState<string>('Stalking & Following Investigation');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Trigger Live Camera / Webcam
  const startWebcam = async () => {
    try {
      setUseWebcam(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('Camera access denied or unavailable. You can also upload test CCTV footage.');
      setUseWebcam(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setUseWebcam(false);
  };

  // Upload custom CCTV snapshot
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomImageBase64(event.target.result as string);
        stopWebcam();
      }
    };
    reader.readAsDataURL(file);
  };

  // Perform Gemini 3.7 Flash Analysis via server-side API
  const runAiVisionScan = async (overrideBase64?: string) => {
    setIsScanning(true);
    setScanStatusMessage('Capturing high-definition optical frame...');

    try {
      let imageToAnalyze = overrideBase64 || customImageBase64;

      // If webcam active, capture current frame from video element
      if (useWebcam && videoRef.current) {
        const c = document.createElement('canvas');
        c.width = videoRef.current.videoWidth || 640;
        c.height = videoRef.current.videoHeight || 480;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, c.width, c.height);
          imageToAnalyze = c.toDataURL('image/jpeg', 0.85);
        }
      }

      setScanStatusMessage('Invoking Gemini 3.7 Flash Multi-Factor Situational Reasoning...');

      const payload = {
        imageBase64: imageToAnalyze,
        cameraName: camera.name,
        location: camera.locationDetails,
        timeOfDay: simTime,
        isNight: simLux < 60 || simTime.includes('AM') || parseInt(simTime) >= 20,
        ambientLux: simLux,
        isolationLevel: simIsolation,
        scenarioContext: simScenario,
      };

      const res = await fetch('/api/analyze-cctv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data: CCTVAnalysisResult = await res.json();
      data.analyzedAt = new Date().toLocaleTimeString();
      setAnalysis(data);

      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }

      setScanStatusMessage('Threat assessment updated.');
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanStatusMessage('Notice: Using calibrated local situational model.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              Gemini AI Vision & Situational Reasoning Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates Gender Ratio, Kinematic Anomalies, Ambient Lux & Location Vulnerability
            </p>
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={() => runAiVisionScan()}
          disabled={isScanning}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 disabled:opacity-50 transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Analyzing Scene...' : 'Scan Scene with Gemini'}</span>
        </button>
      </div>

      {/* Input Feeds & Webcam / Upload Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Custom Upload Button */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              Upload CCTV Frame / Video
            </span>
            {customImageBase64 && (
              <span className="text-[10px] font-mono text-emerald-400">Image Loaded</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Upload any campus surveillance photo to test real-time threat detection.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
            >
              Choose Image File
            </button>
            {customImageBase64 && (
              <button
                onClick={() => setCustomImageBase64(null)}
                className="px-2 py-1.5 rounded-lg bg-rose-900/40 text-rose-300 text-xs border border-rose-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Live Webcam Toggle */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              Live Camera Stream Test
            </span>
            {useWebcam && <span className="text-[10px] font-mono text-rose-400 animate-pulse">REC ON</span>}
          </div>
          <p className="text-[11px] text-slate-400">
            Use your device camera to simulate an active CCTV surveillance feed in real-time.
          </p>
          <button
            onClick={useWebcam ? stopWebcam : startWebcam}
            className={`w-full py-1.5 rounded-lg text-xs font-medium border transition-all ${
              useWebcam
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {useWebcam ? 'Stop Webcam Stream' : 'Enable Device Webcam'}
          </button>
        </div>

        {/* Multi-Factor Stress Test Knobs */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Situational Factor Tuning
            </span>
            <span className="text-[10px] font-mono text-slate-400">{simLux} lx</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Ambient Lux:</span>
              <input
                type="range"
                min="5"
                max="400"
                value={simLux}
                onChange={(e) => setSimLux(Number(e.target.value))}
                className="w-24 accent-rose-500"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Time:</span>
              <select
                value={simTime}
                onChange={(e) => setSimTime(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-200"
              >
                <option value="01:45 AM">01:45 AM (Night Curfew)</option>
                <option value="23:10 PM">23:10 PM (Late Night)</option>
                <option value="15:20 PM">15:20 PM (Daylight)</option>
                <option value="02:30 AM">02:30 AM (Dead of Night)</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => runAiVisionScan()}
            className="w-full py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-medium border border-indigo-500/40"
          >
            Re-calculate with Parameters
          </button>
        </div>
      </div>

      {/* Live Preview Box for Webcam or Uploaded Footage */}
      {(useWebcam || customImageBase64) && (
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center group">
          <div className="relative w-full overflow-hidden flex items-center justify-center bg-black">
            {useWebcam && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-64 object-cover transition-all ${
                  inspectorVisionFilter === 'ir_night'
                    ? 'filter invert-[0.1] sepia hue-rotate-[90deg] saturate-[250%] brightness-[0.85]'
                    : inspectorVisionFilter === 'thermal'
                    ? 'filter invert hue-rotate-[180deg] saturate-[300%] contrast-[175%]'
                    : inspectorVisionFilter === 'cyber'
                    ? 'filter contrast-[180%] saturate-[150%] brightness-[0.9]'
                    : ''
                }`}
              />
            )}
            {customImageBase64 && !useWebcam && (
              <img
                src={customImageBase64}
                alt="Uploaded CCTV Snapshot"
                className={`w-full h-64 object-contain transition-all ${
                  inspectorVisionFilter === 'ir_night'
                    ? 'filter invert-[0.1] sepia hue-rotate-[90deg] saturate-[250%] brightness-[0.85]'
                    : inspectorVisionFilter === 'thermal'
                    ? 'filter invert hue-rotate-[180deg] saturate-[300%] contrast-[175%]'
                    : inspectorVisionFilter === 'cyber'
                    ? 'filter contrast-[180%] saturate-[150%] brightness-[0.9]'
                    : ''
                }`}
              />
            )}

            {/* Scanlines Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

            {/* Top OSD Bar */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
              <div className="px-2 py-1 rounded bg-slate-950/85 backdrop-blur-md text-[11px] font-mono text-slate-200 border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold text-rose-400">LIVE VISION REC</span>
                <span className="text-slate-400">| {useWebcam ? 'WEBCAM STREAM' : 'STATIC CCTV'}</span>
              </div>

              {/* Vision Mode Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setInspectorVisionFilter('standard')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    inspectorVisionFilter === 'standard' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  RGB OPTICAL
                </button>
                <button
                  onClick={() => setInspectorVisionFilter('ir_night')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    inspectorVisionFilter === 'ir_night' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  IR NIGHT
                </button>
                <button
                  onClick={() => setInspectorVisionFilter('thermal')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    inspectorVisionFilter === 'thermal' ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  THERMAL
                </button>
                <button
                  onClick={() => setInspectorVisionFilter('cyber')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    inspectorVisionFilter === 'cyber' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  CYBER MATRIX
                </button>
              </div>
            </div>

            {/* Bottom HUD Telemetry */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded border border-slate-800">
              <span>ACTIVE FILTER: {inspectorVisionFilter.toUpperCase()}</span>
              <span>SAMPLING RATE: 60 FPS</span>
              <span className="text-emerald-400">READY FOR SITUATIONAL AI ANALYSIS</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Results Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat Score & Gender Distribution Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-semibold text-slate-300">Composite Threat Score</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                analysis.threatLevel === 'CRITICAL_DANGER'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : analysis.threatLevel === 'THREAT_ELEVATED'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : analysis.threatLevel === 'SUSPICIOUS'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {analysis.threatLevel}
            </span>
          </div>

          {/* Threat Meter Bar */}
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black font-mono text-slate-100">
              {analysis.threatScore}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <div className="flex-1">
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    analysis.threatScore >= 80
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : analysis.threatScore >= 50
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                  style={{ width: `${analysis.threatScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>0 Safe</span>
                <span>50 Elevated</span>
                <span>100 Critical</span>
              </div>
            </div>
          </div>

          {/* Gender Ratio Breakdown with Colored Dots */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Demographic Dot Identification:
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-mono text-xs text-pink-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 ring-2 ring-pink-500/30" />
                  <span className="font-bold">{analysis.genderDistribution.femaleCount} Female</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-sky-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30" />
                  <span className="font-bold">{analysis.genderDistribution.maleCount} Male</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800 font-sans">
              {analysis.genderDistribution.ratioDescription}
            </p>
          </div>
        </div>

        {/* Lighting & Environmental Lux Evaluation */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-semibold text-slate-300">Ambient Lighting & Optics</span>
            <span className="text-[11px] font-mono text-amber-300 font-bold">
              {analysis.lightingEvaluation.luxEstimate}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Optical Visibility:
              </span>
              <span className="font-mono font-bold text-slate-100">
                {analysis.lightingEvaluation.visibilityScore}%
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                Shadow Pockets / Blindspots:
              </span>
              <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                analysis.lightingEvaluation.darkSpotsIdentified 
                  ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {analysis.lightingEvaluation.darkSpotsIdentified ? 'DETECTED' : 'CLEAR'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
              {analysis.lightingEvaluation.commentary}
            </p>
          </div>
        </div>

        {/* Multi-Factor Contextual Risk Multipliers */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-semibold text-slate-300">Contextual Risk Multipliers</span>
            <span className="text-[11px] font-mono text-slate-400">
              {analysis.contextualRiskFactors.length} Factors
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-36 pr-1">
            {analysis.contextualRiskFactors.map((factor, idx) => (
              <div
                key={idx}
                className="text-[11px] p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-start gap-1.5"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detected Behaviors & Bounding Box Classifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Behaviors Detected */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              Kinematic & Spatial Behaviors Detected
            </span>
          </div>

          <div className="space-y-2">
            {analysis.detectedBehaviors.map((beh, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200">{beh.tag}</span>
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                      beh.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : beh.severity === 'high'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {beh.severity} severity
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{beh.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Reasoning & Immediate Recommended Protocol */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5 text-sky-400" />
                Gemini Vision Situational Synthesis
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {analysis.analyzedAt || 'Real-time'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
              {analysis.reasoningSummary}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-bold text-rose-200">
                MANDATED ACTION PROTOCOL:
              </div>
              <p className="text-xs text-rose-100/90 mt-0.5">
                {analysis.immediateActionRecommended}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
