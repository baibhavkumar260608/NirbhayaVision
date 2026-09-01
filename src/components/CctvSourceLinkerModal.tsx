import React, { useState } from 'react';
import { 
  Video, 
  Camera, 
  Upload, 
  Globe, 
  Server, 
  Smartphone, 
  ShieldCheck, 
  Check, 
  Copy, 
  Terminal, 
  Radio, 
  Layers, 
  ExternalLink,
  HelpCircle,
  Sparkles,
  Info,
  X,
  Play
} from 'lucide-react';

export type VideoSourceMode = 'SIMULATION' | 'WEBCAM' | 'VIDEO_FILE' | 'STREAM_URL';

interface CctvSourceLinkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSource: VideoSourceMode;
  onSelectSource: (mode: VideoSourceMode, payload?: { file?: File; streamUrl?: string }) => void;
  streamUrl: string;
  cameraName: string;
  cameraCode: string;
}

export const CctvSourceLinkerModal: React.FC<CctvSourceLinkerModalProps> = ({
  isOpen,
  onClose,
  currentSource,
  onSelectSource,
  streamUrl: initialStreamUrl,
  cameraName,
  cameraCode,
}) => {
  const [activeTab, setActiveTab] = useState<'quick_connect' | 'rtsp_hardware' | 'phone_ip_cam' | 'ai_backend'>('quick_connect');
  const [inputUrl, setInputUrl] = useState<string>(
    initialStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-600 to-sky-600 text-white shadow-md">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Link Live CCTV Footage</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  {cameraCode} // {cameraName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connect physical IP cameras, RTSP streams, phone webcams, or uploaded surveillance clips
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-950/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('quick_connect')}
            className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'quick_connect'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>1. Instant Connect (Webcam / File / URL)</span>
          </button>

          <button
            onClick={() => setActiveTab('rtsp_hardware')}
            className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'rtsp_hardware'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>2. IP Cameras & NVR (RTSP / ONVIF)</span>
          </button>

          <button
            onClick={() => setActiveTab('phone_ip_cam')}
            className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'phone_ip_cam'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>3. Smartphone as Wireless CCTV</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_backend')}
            className={`px-3 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'ai_backend'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Production SOC Architecture</span>
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-900/60">
          
          {/* TAB 1: QUICK CONNECT (IN-APP) */}
          {activeTab === 'quick_connect' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-slate-100 block">Choose how you want to feed video into NirbhayaVision:</strong>
                  <p className="text-slate-400">
                    Once linked, the video plays continuously on this surveillance channel. NirbhayaVision will apply real-time AI overlays, multi-spectral filters (IR Night Vision / Thermal), and pink/blue dot tracking!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Option A: Device Webcam / USB Camera */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  currentSource === 'WEBCAM'
                    ? 'bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-sky-400" />
                        Live Webcam / USB Camera
                      </span>
                      {currentSource === 'WEBCAM' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                          CURRENTLY ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Use your laptop camera, USB PTZ camera, or HDMI capture card directly in real-time.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectSource('WEBCAM');
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Switch to Device Webcam</span>
                  </button>
                </div>

                {/* Option B: Upload CCTV Video File (MP4/WebM) */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  currentSource === 'VIDEO_FILE'
                    ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-rose-400" />
                        Upload CCTV Recording (.mp4, .webm)
                      </span>
                      {currentSource === 'VIDEO_FILE' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          CURRENTLY ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Upload actual security footage from an NVR or DVR to test the AI analytics loop.
                    </p>
                  </div>

                  <label className="w-full py-2.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse & Load CCTV File</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onSelectSource('VIDEO_FILE', { file });
                          onClose();
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Option C: Live IP Camera / HLS / MP4 Stream URL */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 md:col-span-2 transition-all ${
                  currentSource === 'STREAM_URL'
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-400" />
                        Live IP Camera Stream URL (HLS / MJPEG / MP4)
                      </span>
                      {currentSource === 'STREAM_URL' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          CURRENTLY ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Enter a public or local network HTTP video stream URL (e.g. from an IP camera gateway or proxy).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="http://192.168.1.100:8080/video or https://.../stream.mp4"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => {
                        if (inputUrl.trim()) {
                          onSelectSource('STREAM_URL', { streamUrl: inputUrl.trim() });
                          onClose();
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Connect Stream</span>
                    </button>
                  </div>
                </div>

                {/* Option D: Synthetic CCTV Simulator */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 md:col-span-2 transition-all ${
                  currentSource === 'SIMULATION'
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Built-in Multi-Spectral CCTV Simulator
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Default simulation with dynamic night-lighting, stalking trajectory physics, and scenario presets.
                      </p>
                    </div>
                    {currentSource === 'SIMULATION' ? (
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ACTIVE DEFAULT
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectSource('SIMULATION');
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                      >
                        Reset to Simulator
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RTSP / ONVIF PHYSICAL HARDWARE */}
          {activeTab === 'rtsp_hardware' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-400" />
                  Connecting Commercial CCTV Cameras (Hikvision, Dahua, CP Plus, Axis)
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Commercial security CCTV cameras broadcast video using the <strong>RTSP (Real Time Streaming Protocol)</strong>. Because web browsers cannot decode raw RTSP directly, a lightweight edge media gateway (like <code>go2rtc</code>, <code>MediaMTX</code>, or <code>FFmpeg</code>) bridges RTSP into <strong>WebRTC / HLS / WebSockets</strong>.
                </p>
              </div>

              {/* Step by step guide */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Step-by-Step Setup Guide:
                </h4>

                {/* Step 1: Find RTSP URL */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400">Step 1: Obtain your Camera RTSP URL</span>
                    <span className="text-[10px] text-slate-500 font-mono">Standard Formats</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">Hikvision:</span>
                      <code className="text-emerald-400">rtsp://admin:password@192.168.1.64:554/Streaming/Channels/101</code>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">CP Plus / Dahua:</span>
                      <code className="text-emerald-400">rtsp://admin:password@192.168.1.108:554/cam/realmonitor?channel=1&subtype=0</code>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">Axis / Generic ONVIF:</span>
                      <code className="text-emerald-400">rtsp://admin:password@192.168.1.50:554/axis-media/media.amp</code>
                    </div>
                  </div>
                </div>

                {/* Step 2: 1-Line Edge Gateway via Docker */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400">Step 2: Run High-Performance RTSP-to-Web Gateway</span>
                    <button
                      onClick={() => handleCopy('docker run -d --name go2rtc -p 1984:1984 -p 8555:8555/tcp -p 8555:8555/udp alexxit/go2rtc', 'docker')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono flex items-center gap-1"
                    >
                      {copiedIndex === 'docker' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === 'docker' ? 'Copied' : 'Copy Command'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-amber-300 border border-slate-800 overflow-x-auto">
                    docker run -d --name go2rtc -p 1984:1984 -p 8555:8555/tcp -p 8555:8555/udp alexxit/go2rtc
                  </div>
                  <p className="text-[11px] text-slate-400">
                    This launches an ultra-low latency (under 50ms) WebRTC streaming gateway on your local server.
                  </p>
                </div>

                {/* Step 3: Stream Ingestion */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-sky-400">Step 3: Point NirbhayaVision to the Stream</span>
                  <p className="text-slate-300">
                    In Tab 1 ("Instant Connect"), paste your local WebRTC or HLS endpoint: <code>http://localhost:1984/api/stream.mp4?src=camera1</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SMARTPHONE AS WIRELESS CCTV */}
          {activeTab === 'phone_ip_cam' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  Turn Any Smartphone into an Instant Test CCTV Camera
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  During live jury presentations or campus pilots, you can turn any Android or iPhone into a live wireless CCTV camera streaming directly into NirbhayaVision in under 2 minutes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Method 1: Android IP Webcam */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <span className="font-bold text-emerald-400 text-xs">Android: "IP Webcam" App</span>
                  <ol className="list-decimal list-inside text-slate-400 space-y-1 text-[11px]">
                    <li>Install <strong>IP Webcam</strong> (Google Play).</li>
                    <li>Scroll down and tap <strong>Start Server</strong>.</li>
                    <li>Note down the URL (e.g. <code>http://192.168.1.15:8080/video</code>).</li>
                    <li>Paste the URL in Tab 1 and click <strong>Connect</strong>!</li>
                  </ol>
                </div>

                {/* Method 2: iPhone EpocCam / DroidCam */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <span className="font-bold text-sky-400 text-xs">iPhone / Android: DroidCam</span>
                  <ol className="list-decimal list-inside text-slate-400 space-y-1 text-[11px]">
                    <li>Install <strong>DroidCam Wireless Webcam</strong>.</li>
                    <li>Connect phone & laptop to the same Wi-Fi.</li>
                    <li>Open browser on <code>http://&lt;phone-ip&gt;:4747/video</code> or use as USB webcam.</li>
                  </ol>
                </div>

                {/* Method 3: Direct WebRTC Camera Share */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <span className="font-bold text-rose-400 text-xs">Direct Web Browser Camera</span>
                  <ol className="list-decimal list-inside text-slate-400 space-y-1 text-[11px]">
                    <li>Open this app on your phone's browser.</li>
                    <li>Click <strong>Device Webcam</strong>.</li>
                    <li>Select back-camera for live campus surveillance simulation.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTION SOC ARCHITECTURE */}
          {activeTab === 'ai_backend' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  SIH 2026 Production Security Operations Center (SOC) Pipeline
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  How NirbhayaVision connects to city-wide or campus-wide CCTV infrastructure at scale:
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-3">
                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-rose-400 font-bold">[1. Edge Cameras]</span>: 100+ Hikvision/CP Plus RTSP Streams (H.264/H.265)<br />
                  &nbsp;&nbsp;↳ Sent over private fiber VLAN to On-Premise GPU Edge Node (NVIDIA Jetson / RTX 4090)
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-amber-400 font-bold">[2. Inference Engine]</span>: YOLOv8-Pose + ByteTrack (30 FPS local tracking)<br />
                  &nbsp;&nbsp;↳ Computes bounding boxes, pink (♀) and blue (♂) demographic tags, velocity, and distance vectors
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-sky-400 font-bold">[3. Situational AI]</span>: Gemini 3.7 Flash + Multi-Factor Rules Engine<br />
                  &nbsp;&nbsp;↳ Triggered on anomalies (stalking &gt; 10s, low Lux, severe gender imbalance, scream audio)
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-emerald-400 font-bold">[4. Fail-Safe Dispatch]</span>: WebSocket to Control Room + SMS/112 API Gateway<br />
                  &nbsp;&nbsp;↳ If human intermediate fails to acknowledge within 30s, auto-escalates to Police ERSS 112
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400">
            Current Active Source: <strong className="text-slate-200 font-mono">{currentSource}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
