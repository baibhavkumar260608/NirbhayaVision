import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CCTVCamera, BoundingBox } from '../types';
import { 
  Eye, 
  ShieldAlert, 
  Sparkles, 
  Moon, 
  Sun, 
  Radio, 
  Maximize2, 
  Video, 
  RefreshCw, 
  Zap, 
  Flame, 
  Activity, 
  Scan, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Disc, 
  Volume2, 
  Layers,
  Camera,
  Link2,
  Tv,
  Upload,
  Globe
} from 'lucide-react';
import { CctvSourceLinkerModal, VideoSourceMode } from './CctvSourceLinkerModal';

export type VisionMode = 'OPTICAL_RGB' | 'IR_NIGHT' | 'THERMAL_FLIR' | 'AI_SKELETAL' | 'CYBER_CONTOUR';

interface CctvCanvasStreamProps {
  camera: CCTVCamera;
  boundingBoxes?: BoundingBox[];
  showBoundingBoxes?: boolean;
  nightVisionMode?: boolean;
  spotlightActive?: boolean;
  onCaptureFrame?: (dataUrl: string) => void;
  className?: string;
  isCompact?: boolean;
}

export const CctvCanvasStream: React.FC<CctvCanvasStreamProps> = ({
  camera,
  boundingBoxes = camera.defaultAnalysis.boundingBoxes,
  showBoundingBoxes = true,
  nightVisionMode: initialNightVision = camera.isNight,
  spotlightActive = false,
  onCaptureFrame,
  className = '',
  isCompact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Vision Mode State
  const [visionMode, setVisionMode] = useState<VisionMode>(
    camera.isNight ? 'IR_NIGHT' : 'OPTICAL_RGB'
  );

  // Video Source Management (Simulation / Webcam / Uploaded Video / IP Camera)
  const [videoSourceMode, setVideoSourceMode] = useState<VideoSourceMode>('SIMULATION');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const streamMediaTrackRef = useRef<MediaStream | null>(null);
  
  // Interactive Live Recording & Camera Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isRecordingClip, setIsRecordingClip] = useState<boolean>(true);
  const [recordedSeconds, setRecordedSeconds] = useState<number>(142);
  const [showHudOverlay, setShowHudOverlay] = useState<boolean>(true);
  const [showProximityRadar, setShowProximityRadar] = useState<boolean>(true);
  const [clipSavedToast, setClipSavedToast] = useState<string | null>(null);

  // Keep vision mode aligned if camera base changes
  useEffect(() => {
    if (camera.isNight && visionMode === 'OPTICAL_RGB') {
      setVisionMode('IR_NIGHT');
    }
  }, [camera.isNight, camera.id]);

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      if (streamMediaTrackRef.current) {
        streamMediaTrackRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handler to switch video sources (Webcam, File, IP Stream, Simulation)
  const handleSelectSource = async (
    mode: VideoSourceMode, 
    payload?: { file?: File; streamUrl?: string }
  ) => {
    // Stop previous webcam media stream if active
    if (streamMediaTrackRef.current) {
      streamMediaTrackRef.current.getTracks().forEach((t) => t.stop());
      streamMediaTrackRef.current = null;
    }

    setVideoSourceMode(mode);

    if (mode === 'WEBCAM') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        streamMediaTrackRef.current = stream;
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = stream;
          videoElementRef.current.play().catch(console.error);
        }
        setClipSavedToast('Connected to Device Webcam / PTZ Video Feed.');
        setTimeout(() => setClipSavedToast(null), 3000);
      } catch (err) {
        alert('Unable to access camera device. Check browser permissions.');
        setVideoSourceMode('SIMULATION');
      }
    } else if (mode === 'VIDEO_FILE' && payload?.file) {
      const url = URL.createObjectURL(payload.file);
      setUploadedFileName(payload.file.name);
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = null;
        videoElementRef.current.src = url;
        videoElementRef.current.loop = true;
        videoElementRef.current.muted = true;
        videoElementRef.current.play().catch(console.error);
      }
      setClipSavedToast(`Loaded CCTV footage clip: ${payload.file.name}`);
      setTimeout(() => setClipSavedToast(null), 3000);
    } else if (mode === 'STREAM_URL' && payload?.streamUrl) {
      setStreamUrl(payload.streamUrl);
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = null;
        videoElementRef.current.src = payload.streamUrl;
        videoElementRef.current.crossOrigin = 'anonymous';
        videoElementRef.current.loop = true;
        videoElementRef.current.muted = true;
        videoElementRef.current.play().catch(console.error);
      }
      setClipSavedToast(`Connected to IP camera stream: ${payload.streamUrl}`);
      setTimeout(() => setClipSavedToast(null), 3000);
    } else if (mode === 'SIMULATION') {
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = null;
        videoElementRef.current.src = '';
      }
      setClipSavedToast('Switched to Built-in Multi-Spectral CCTV Simulator.');
      setTimeout(() => setClipSavedToast(null), 3000);
    }
  };

  // Simulation physics state
  const simState = useRef({
    time: 0,
    frameCount: 1420,
    p1: { x: 280, y: 550, targetX: 700, targetY: 550, speed: 0.9, dir: 1, history: [] as {x: number, y: number}[] },
    p2: { x: 180, y: 550, targetX: 600, targetY: 550, speed: 0.95, dir: 1, history: [] as {x: number, y: number}[] },
    p3: { x: 750, y: 580, targetX: 750, targetY: 580, speed: 0, dir: 0, history: [] as {x: number, y: number}[] },
    flicker: 1,
    audioLevel: 0.45,
  });

  // Handle Recording Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRecordedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderScene = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    time: number
  ) => {
    const isNight = camera.isNight;
    const lux = camera.ambientLux;
    const st = simState.current;
    st.time += 0.016;
    st.frameCount += 1;
    st.audioLevel = 0.3 + Math.sin(time * 8) * 0.2 + (Math.random() * 0.1);

    // Apply Zoom Transformation
    ctx.save();
    if (zoomLevel > 1) {
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-width / 2, -height / 2);
    }

    // Check if live external video (Webcam / File / IP Stream) is playing
    const isRealVideoActive = videoSourceMode !== 'SIMULATION' && !!videoElementRef.current && videoElementRef.current.readyState >= 2;

    if (isRealVideoActive && videoElementRef.current) {
      // 1. DRAW REAL CCTV VIDEO FRAME
      ctx.drawImage(videoElementRef.current, 0, 0, width, height);

      // Apply Multi-Spectral Filter Shader on real video
      if (visionMode === 'IR_NIGHT') {
        ctx.fillStyle = 'rgba(6, 75, 30, 0.45)';
        ctx.fillRect(0, 0, width, height);
      } else if (visionMode === 'THERMAL_FLIR') {
        ctx.fillStyle = 'rgba(147, 51, 234, 0.38)';
        ctx.fillRect(0, 0, width, height);
      } else if (visionMode === 'CYBER_CONTOUR') {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fillRect(0, 0, width, height);
      } else if (visionMode === 'AI_SKELETAL') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      // 1. BACKGROUND SCENE RENDERING ACCORDING TO VISION MODE (SIMULATOR)
      if (visionMode === 'IR_NIGHT') {
        // Infrared Night Vision (Phosphor Green/Charcoal)
        ctx.fillStyle = '#031008';
        ctx.fillRect(0, 0, width, height);

        const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.75);
        grad.addColorStop(0, 'rgba(16, 75, 38, 0.45)');
        grad.addColorStop(0.7, 'rgba(6, 35, 18, 0.7)');
        grad.addColorStop(1, 'rgba(2, 12, 5, 0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (visionMode === 'THERMAL_FLIR') {
        // Thermal FLIR (Deep Midnight Purple / Indigo Base with Heat Radiance)
        const thermBg = ctx.createLinearGradient(0, 0, 0, height);
        thermBg.addColorStop(0, '#060417');
        thermBg.addColorStop(0.5, '#120b29');
        thermBg.addColorStop(1, '#08051a');
        ctx.fillStyle = thermBg;
        ctx.fillRect(0, 0, width, height);
      } else if (visionMode === 'CYBER_CONTOUR') {
        // Cyber Contour Edge Matrix
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, width, height);

        // Cyber grid matrix background
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.lineWidth = 1;
        const gridSize = 35;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else if (visionMode === 'AI_SKELETAL') {
        // AI Skeletal Pose Dark Blueprint
        ctx.fillStyle = '#060913';
        ctx.fillRect(0, 0, width, height);

        // Radial radar sweep background
        const radGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.6);
        radGrad.addColorStop(0, 'rgba(30, 58, 138, 0.25)');
        radGrad.addColorStop(1, 'rgba(2, 6, 23, 0.85)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // OPTICAL_RGB (Standard Color CCTV)
        if (isNight) {
          ctx.fillStyle = '#080d1a';
          ctx.fillRect(0, 0, width, height);

          // Streetlamp cone volumetrics
          const lampX = width * 0.35;
          const lampGrad = ctx.createRadialGradient(lampX, 80, 10, lampX, 350, 420);
          lampGrad.addColorStop(0, `rgba(251, 191, 36, ${Math.min(0.4, lux / 120)})`);
          lampGrad.addColorStop(0.6, `rgba(245, 158, 11, ${Math.min(0.15, lux / 250)})`);
          lampGrad.addColorStop(1, 'rgba(8, 13, 26, 0)');
          ctx.fillStyle = lampGrad;
          ctx.beginPath();
          ctx.moveTo(lampX, 40);
          ctx.lineTo(lampX - 320, height);
          ctx.lineTo(lampX + 320, height);
          ctx.closePath();
          ctx.fill();
        } else {
          const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
          skyGrad.addColorStop(0, '#64748b');
          skyGrad.addColorStop(0.5, '#94a3b8');
          skyGrad.addColorStop(1, '#475569');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, width, height);
        }
      }
    }

    // 2. ARCHITECTURAL PERSPECTIVE & INFRASTRUCTURE (ONLY IN SIMULATOR)
    if (!isRealVideoActive) {
      // Perspective Pathway Ground
      let groundColor = '#111827';
    if (visionMode === 'IR_NIGHT') groundColor = '#0a2213';
    else if (visionMode === 'THERMAL_FLIR') groundColor = '#1e1035';
    else if (visionMode === 'CYBER_CONTOUR') groundColor = '#090e17';
    else if (visionMode === 'AI_SKELETAL') groundColor = '#0f172a';
    else if (!isNight) groundColor = '#334155';

    ctx.fillStyle = groundColor;
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.45);
    ctx.lineTo(width * 0.7, height * 0.45);
    ctx.lineTo(width * 0.95, height);
    ctx.lineTo(width * 0.05, height);
    ctx.closePath();
    ctx.fill();

    // Pathway Center Line
    let pathLineColor = 'rgba(255, 255, 255, 0.1)';
    if (visionMode === 'IR_NIGHT') pathLineColor = 'rgba(74, 222, 128, 0.25)';
    else if (visionMode === 'THERMAL_FLIR') pathLineColor = 'rgba(236, 72, 153, 0.3)';
    else if (visionMode === 'CYBER_CONTOUR') pathLineColor = 'rgba(6, 182, 212, 0.4)';
    else if (visionMode === 'AI_SKELETAL') pathLineColor = 'rgba(99, 102, 241, 0.3)';

    ctx.strokeStyle = pathLineColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(width * 0.5, height * 0.45);
    ctx.lineTo(width * 0.5, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Campus Architecture (Buildings, Pillars, Structural Framing)
    let buildingColor = '#0b0f19';
    let buildingStroke = '#1e293b';
    if (visionMode === 'IR_NIGHT') {
      buildingColor = '#07180e';
      buildingStroke = '#14532d';
    } else if (visionMode === 'THERMAL_FLIR') {
      buildingColor = '#130924';
      buildingStroke = '#4c1d95';
    } else if (visionMode === 'CYBER_CONTOUR') {
      buildingColor = '#030712';
      buildingStroke = 'rgba(6, 182, 212, 0.6)';
    } else if (visionMode === 'AI_SKELETAL') {
      buildingColor = '#0a0f1d';
      buildingStroke = '#1e293b';
    }

    ctx.fillStyle = buildingColor;
    ctx.strokeStyle = buildingStroke;
    ctx.lineWidth = visionMode === 'CYBER_CONTOUR' ? 1.5 : 1;

    // Left Sector Structure
    ctx.fillRect(0, height * 0.15, width * 0.25, height * 0.85);
    ctx.strokeRect(0, height * 0.15, width * 0.25, height * 0.85);

    // Right Sector Structure
    ctx.fillRect(width * 0.75, height * 0.2, width * 0.25, height * 0.8);
    ctx.strokeRect(width * 0.75, height * 0.2, width * 0.25, height * 0.8);

    // Windows & Internal Illumination
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const winX = 15 + col * 45;
        const winY = height * 0.25 + row * 60;
        const winGlow = Math.sin(time * 0.5 + row * 2 + col) > 0.3;

        if (visionMode === 'IR_NIGHT') {
          ctx.fillStyle = winGlow ? 'rgba(74, 222, 128, 0.45)' : 'rgba(10, 40, 20, 0.7)';
        } else if (visionMode === 'THERMAL_FLIR') {
          ctx.fillStyle = winGlow ? 'rgba(245, 158, 11, 0.4)' : 'rgba(30, 15, 60, 0.7)';
        } else if (visionMode === 'CYBER_CONTOUR') {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
          ctx.strokeRect(winX, winY, 28, 40);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
        } else {
          ctx.fillStyle = winGlow ? 'rgba(253, 224, 71, 0.65)' : 'rgba(30, 41, 59, 0.8)';
        }
        ctx.fillRect(winX, winY, 28, 40);
      }
    }

    // Streetlamp / Surveillance Floodlight
    const poleX = width * 0.35;
    ctx.fillStyle = '#334155';
    ctx.fillRect(poleX - 4, height * 0.12, 8, height * 0.45);
    ctx.fillStyle = isNight && visionMode === 'OPTICAL_RGB' ? '#fef08a' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(poleX, height * 0.12, 10, 0, Math.PI * 2);
    ctx.fill();

    // Spotlight Active Effect (Deterrent Trigger)
    if (spotlightActive) {
      const spotGrad = ctx.createRadialGradient(width * 0.5, height * 0.6, 20, width * 0.5, height * 0.6, 340);
      spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      spotGrad.addColorStop(0.5, 'rgba(240, 249, 255, 0.55)');
      spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.6, 340, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. MOVEMENT TRAJECTORY SIMULATION
    if (camera.scenarioPreset === 'lone_stalker') {
      // Female walking ahead, Male trailing closely behind
      st.p1.x += 0.85 * st.p1.dir;
      if (st.p1.x > width * 0.75) st.p1.dir = -1;
      if (st.p1.x < width * 0.25) st.p1.dir = 1;

      const targetAggressorX = st.p1.dir === 1 ? st.p1.x - 90 : st.p1.x + 90;
      st.p2.x += (targetAggressorX - st.p2.x) * 0.05;
    } else if (camera.scenarioPreset === 'woodland_pursuit') {
      // Sprint chase
      st.p1.x += 2.2 * st.p1.dir;
      if (st.p1.x > width * 0.85) st.p1.dir = -1;
      if (st.p1.x < width * 0.15) st.p1.dir = 1;

      const targetX = st.p1.dir === 1 ? st.p1.x - 65 : st.p1.x + 65;
      st.p2.x += (targetX - st.p2.x) * 0.09;
    } else {
      st.p1.x += 0.4 * st.p1.dir;
      if (st.p1.x > width * 0.8) st.p1.dir = -1;
      if (st.p1.x < width * 0.2) st.p1.dir = 1;
    }

    // Record Trajectory History for Motion Blur / Vectors
    if (st.frameCount % 4 === 0) {
      st.p1.history.push({ x: st.p1.x, y: height * 0.76 });
      st.p2.history.push({ x: st.p2.x, y: height * 0.77 });
      if (st.p1.history.length > 12) st.p1.history.shift();
      if (st.p2.history.length > 12) st.p2.history.shift();
    }

    // Motion Vector Trails with Gender-Coded Dots
    if (visionMode === 'AI_SKELETAL' || visionMode === 'CYBER_CONTOUR' || visionMode === 'OPTICAL_RGB' || visionMode === 'IR_NIGHT') {
      ctx.lineWidth = 2;
      // Female Trail (Vibrant Pink / Magenta glow)
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
      ctx.beginPath();
      st.p1.history.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Male Pursuer Trail (Cyan / Blue / Amber glow)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.55)';
      ctx.beginPath();
      st.p2.history.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }

    // 4. PERSON RENDERING FUNCTION WITH MULTI-SPECTRAL VISION MODES AND GENDER COLOR DOT IDENTIFIERS
    const drawMultiSpectralPerson = (
      x: number,
      baseY: number,
      scale: number,
      gender: 'female' | 'male',
      isAtRisk: boolean,
      isAggressor: boolean,
      legCycle: number
    ) => {
      ctx.save();
      ctx.translate(x, baseY);
      ctx.scale(scale, scale);

      // Foot Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // DISTINCTIVE GENDER COLOR DOT & TRACKING TARGET OVERHEAD
      // Female: Magenta / Hot Pink (#ec4899), Male: Cyan / Sky Blue (#0ea5e9) (or Amber/Red if Aggressor)
      const genderDotColor = gender === 'female' ? '#ec4899' : isAggressor ? '#f59e0b' : '#0ea5e9';
      const genderDotGlow = gender === 'female' ? 'rgba(236, 72, 153, 0.4)' : isAggressor ? 'rgba(245, 158, 11, 0.4)' : 'rgba(14, 165, 233, 0.4)';
      const genderLabel = gender === 'female' ? '♀ FEMALE' : '♂ MALE';

      // Kinematic Angles
      const armSwing = Math.sin(legCycle) * 12;
      const legSwing = Math.sin(legCycle) * 14;
      const headY = -65;
      const neckY = -56;
      const hipY = -25;
      const overheadDotY = headY - 18;

      // Draw Glowing Gender Color Identification Dot
      ctx.save();
      // Outer Pulse Ring
      const pulseRadius = 7 + Math.sin(st.time * 4) * 2;
      ctx.fillStyle = genderDotGlow;
      ctx.beginPath();
      ctx.arc(0, overheadDotY, pulseRadius + 3, 0, Math.PI * 2);
      ctx.fill();

      // Solid Gender Dot Core
      ctx.fillStyle = genderDotColor;
      ctx.beginPath();
      ctx.arc(0, overheadDotY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Gender Micro-Badge Text
      ctx.font = '700 8px "JetBrains Mono", monospace';
      const gWidth = ctx.measureText(genderLabel).width;
      ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
      ctx.fillRect(-gWidth / 2 - 3, overheadDotY - 14, gWidth + 6, 11);
      ctx.strokeStyle = genderDotColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(-gWidth / 2 - 3, overheadDotY - 14, gWidth + 6, 11);

      ctx.fillStyle = genderDotColor;
      ctx.fillText(genderLabel, -gWidth / 2, overheadDotY - 5);
      ctx.restore();

      // ==========================================
      // MODE A: AI SKELETAL POSE TRACKING
      // ==========================================
      if (visionMode === 'AI_SKELETAL') {
        const jointColor = isAtRisk ? '#f43f5e' : isAggressor ? '#f59e0b' : '#38bdf8';
        const boneColor = isAtRisk ? 'rgba(244, 63, 94, 0.85)' : isAggressor ? 'rgba(245, 158, 11, 0.85)' : 'rgba(56, 189, 248, 0.75)';

        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Spine
        ctx.beginPath();
        ctx.moveTo(0, neckY);
        ctx.lineTo(0, hipY);
        ctx.stroke();

        // Shoulder Bar
        ctx.beginPath();
        ctx.moveTo(-10, neckY + 4);
        ctx.lineTo(10, neckY + 4);
        ctx.stroke();

        // Left Arm (Joints: Shoulder -> Elbow -> Wrist)
        const lElbowX = -10 - armSwing * 0.4;
        const lElbowY = -42 + Math.abs(armSwing) * 0.2;
        const lWristX = -12 - armSwing * 0.8;
        const lWristY = -28 + armSwing;
        ctx.beginPath();
        ctx.moveTo(-10, neckY + 4);
        ctx.lineTo(lElbowX, lElbowY);
        ctx.lineTo(lWristX, lWristY);
        ctx.stroke();

        // Right Arm
        const rElbowX = 10 + armSwing * 0.4;
        const rElbowY = -42 + Math.abs(armSwing) * 0.2;
        const rWristX = 12 + armSwing * 0.8;
        const rWristY = -28 - armSwing;
        ctx.beginPath();
        ctx.moveTo(10, neckY + 4);
        ctx.lineTo(rElbowX, rElbowY);
        ctx.lineTo(rWristX, rWristY);
        ctx.stroke();

        // Pelvis / Hip Bar
        ctx.beginPath();
        ctx.moveTo(-8, hipY);
        ctx.lineTo(8, hipY);
        ctx.stroke();

        // Left Leg (Hip -> Knee -> Ankle)
        const lKneeX = -8 - legSwing * 0.4;
        const lKneeY = -12 + Math.abs(legSwing) * 0.2;
        const lAnkleX = -8 - legSwing * 0.8;
        const lAnkleY = legSwing;
        ctx.beginPath();
        ctx.moveTo(-8, hipY);
        ctx.lineTo(lKneeX, lKneeY);
        ctx.lineTo(lAnkleX, lAnkleY);
        ctx.stroke();

        // Right Leg
        const rKneeX = 8 + legSwing * 0.4;
        const rKneeY = -12 + Math.abs(legSwing) * 0.2;
        const rAnkleX = 8 + legSwing * 0.8;
        const rAnkleY = -legSwing;
        ctx.beginPath();
        ctx.moveTo(8, hipY);
        ctx.lineTo(rKneeX, rKneeY);
        ctx.lineTo(rAnkleX, rAnkleY);
        ctx.stroke();

        // Keypoint Node Dots
        const drawJoint = (jx: number, jy: number, r = 3) => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(jx, jy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = jointColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        };

        // Head Node & Ring
        ctx.strokeStyle = jointColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, headY, 8, 0, Math.PI * 2);
        ctx.stroke();
        drawJoint(0, headY, 3);
        drawJoint(0, neckY, 2.5);
        drawJoint(-10, neckY + 4, 2.5);
        drawJoint(10, neckY + 4, 2.5);
        drawJoint(lElbowX, lElbowY, 2.5);
        drawJoint(rElbowX, rElbowY, 2.5);
        drawJoint(lWristX, lWristY, 2.5);
        drawJoint(rWristX, rWristY, 2.5);
        drawJoint(0, hipY, 3);
        drawJoint(-8, hipY, 2.5);
        drawJoint(8, hipY, 2.5);
        drawJoint(lKneeX, lKneeY, 2.5);
        drawJoint(rKneeX, rKneeY, 2.5);
        drawJoint(lAnkleX, lAnkleY, 2.5);
        drawJoint(rAnkleX, rAnkleY, 2.5);

        // Biometric Gait / Cadence Tag
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = jointColor;
        const gaitCadence = isAggressor ? 'CADENCE: 124 BPM [ACCEL]' : isAtRisk ? 'CADENCE: 118 BPM [DISTRESS]' : 'CADENCE: 98 BPM [STEADY]';
        ctx.fillText(gaitCadence, -38, headY - 14);

        ctx.restore();
        return;
      }

      // ==========================================
      // MODE B: THERMAL FLIR HEAT SIGNATURE
      // ==========================================
      if (visionMode === 'THERMAL_FLIR') {
        // Temperature gradient body mapping
        // Aggressor has elevated body temperature (38.8°C), victim 37.2°C
        const coreTemp = isAggressor ? '38.6°C' : isAtRisk ? '37.4°C' : '36.8°C';

        // Outer Heat Halo (Radiance)
        const heatHalo = ctx.createRadialGradient(0, -40, 10, 0, -40, 45);
        heatHalo.addColorStop(0, isAggressor ? 'rgba(239, 68, 68, 0.6)' : 'rgba(245, 158, 11, 0.5)');
        heatHalo.addColorStop(0.6, 'rgba(168, 85, 247, 0.3)');
        heatHalo.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = heatHalo;
        ctx.beginPath();
        ctx.arc(0, -40, 45, 0, Math.PI * 2);
        ctx.fill();

        // Torso Heat Gradient
        const torsoGrad = ctx.createLinearGradient(0, neckY, 0, hipY);
        torsoGrad.addColorStop(0, '#ffffff'); // Hottest core
        torsoGrad.addColorStop(0.3, isAggressor ? '#ef4444' : '#f59e0b');
        torsoGrad.addColorStop(0.7, '#ec4899');
        torsoGrad.addColorStop(1, '#8b5cf6');

        ctx.strokeStyle = torsoGrad;
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, neckY);
        ctx.lineTo(0, hipY);
        ctx.stroke();

        // Head Heat (Bright Yellow / White)
        const headGrad = ctx.createRadialGradient(0, headY, 2, 0, headY, 9);
        headGrad.addColorStop(0, '#ffffff');
        headGrad.addColorStop(0.5, isAggressor ? '#ef4444' : '#f59e0b');
        headGrad.addColorStop(1, '#7c3aed');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(0, headY, 8.5, 0, Math.PI * 2);
        ctx.fill();

        // Limbs in cool violet-pink thermal spectrum
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 5;
        // Arms
        ctx.beginPath();
        ctx.moveTo(0, neckY + 4);
        ctx.lineTo(-10, -35 + armSwing);
        ctx.moveTo(0, neckY + 4);
        ctx.lineTo(10, -35 - armSwing);
        // Legs
        ctx.moveTo(0, hipY);
        ctx.lineTo(-8, -legSwing);
        ctx.moveTo(0, hipY);
        ctx.lineTo(8, legSwing);
        ctx.stroke();

        // Thermal Core Temp Reading Tag
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`CORE: ${coreTemp}`, -24, headY - 12);

        ctx.restore();
        return;
      }

      // ==========================================
      // MODE C: CYBER CONTOUR & MATRIX
      // ==========================================
      if (visionMode === 'CYBER_CONTOUR') {
        const cyberColor = isAtRisk ? '#f43f5e' : isAggressor ? '#f59e0b' : '#06b6d4';

        ctx.strokeStyle = cyberColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = cyberColor;
        ctx.shadowBlur = 8;

        // Head Hexagon / Circle
        ctx.beginPath();
        ctx.arc(0, headY, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Torso Box
        ctx.strokeRect(-6, neckY, 12, hipY - neckY);

        // Limbs Wireframe
        ctx.beginPath();
        ctx.moveTo(-6, neckY + 4);
        ctx.lineTo(-12, -35 + armSwing);
        ctx.moveTo(6, neckY + 4);
        ctx.lineTo(12, -35 - armSwing);
        ctx.moveTo(-4, hipY);
        ctx.lineTo(-8, -legSwing);
        ctx.moveTo(4, hipY);
        ctx.lineTo(8, legSwing);
        ctx.stroke();

        // Target Lock Reticle
        ctx.beginPath();
        ctx.arc(0, -40, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();
        return;
      }

      // ==========================================
      // MODE D: OPTICAL RGB & IR NIGHT VISION
      // ==========================================
      let bodyColor = visionMode === 'IR_NIGHT' ? '#86efac' : isNight ? '#cbd5e1' : '#1e293b';
      if (isAtRisk) bodyColor = visionMode === 'IR_NIGHT' ? '#fca5a5' : '#f43f5e';
      if (isAggressor) bodyColor = visionMode === 'IR_NIGHT' ? '#fde047' : '#e11d48';

      ctx.fillStyle = bodyColor;
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      // Head
      ctx.beginPath();
      ctx.arc(0, headY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Hair silhouette for female
      if (gender === 'female') {
        ctx.fillStyle = visionMode === 'IR_NIGHT' ? '#4ade80' : '#475569';
        ctx.beginPath();
        ctx.arc(0, headY - 1, 9.5, Math.PI * 0.8, Math.PI * 2.2);
        ctx.lineTo(-2, -50);
        ctx.fill();
        ctx.fillStyle = bodyColor;
      }

      // Torso
      ctx.beginPath();
      ctx.moveTo(0, neckY);
      ctx.lineTo(0, hipY);
      ctx.stroke();

      // Arms
      ctx.beginPath();
      if (isAtRisk && camera.scenarioPreset === 'woodland_pursuit') {
        ctx.moveTo(0, neckY + 4);
        ctx.lineTo(-14, -75 + Math.sin(st.time * 8) * 8);
        ctx.moveTo(0, neckY + 4);
        ctx.lineTo(14, -75 + Math.cos(st.time * 8) * 8);
      } else {
        ctx.moveTo(0, neckY + 4);
        ctx.lineTo(-10, -35 + armSwing);
        ctx.moveTo(0, neckY + 4);
        ctx.lineTo(10, -35 - armSwing);
      }
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(-8, -legSwing);
      ctx.moveTo(0, hipY);
      ctx.lineTo(8, legSwing);
      ctx.stroke();

      ctx.restore();
    };

    // Draw Entities
    const legPhase = st.time * 6;
    if (camera.scenarioPreset === 'lone_stalker' || camera.scenarioPreset === 'woodland_pursuit') {
      // Female Subject (Victim at Risk)
      drawMultiSpectralPerson(st.p1.x, height * 0.76, 1.4, 'female', true, false, legPhase);
      // Male Pursuer (Aggressor)
      drawMultiSpectralPerson(st.p2.x, height * 0.77, 1.45, 'male', false, true, legPhase * 1.1);

      // Lookout Sentry
      if (camera.scenarioPreset === 'lone_stalker') {
        drawMultiSpectralPerson(width * 0.82, height * 0.72, 1.3, 'male', false, true, 0);
      }

      // 5. PROXIMITY LASER RADAR & DISTANCE GAUGE
      if (showProximityRadar) {
        const deltaX = Math.abs(st.p1.x - st.p2.x);
        const distanceMeters = (deltaX / 55).toFixed(2);
        const isCriticalProximity = parseFloat(distanceMeters) < 2.5;

        // Laser Radar Connecting Line between P1 and P2
        ctx.save();
        ctx.strokeStyle = isCriticalProximity ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(st.p1.x, height * 0.73);
        ctx.lineTo(st.p2.x, height * 0.73);
        ctx.stroke();
        ctx.setLineDash([]);

        // Radar Distance Badge
        const midX = (st.p1.x + st.p2.x) / 2;
        ctx.fillStyle = isCriticalProximity ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)';
        const radarText = `PROXIMITY: ${distanceMeters}m [${isCriticalProximity ? 'CRITICAL TRAIL' : 'ELEVATED'}]`;
        ctx.font = '700 9px "JetBrains Mono", monospace';
        const rw = ctx.measureText(radarText).width;
        ctx.fillRect(midX - rw / 2 - 4, height * 0.71 - 12, rw + 8, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(radarText, midX - rw / 2, height * 0.71 - 2);
        ctx.restore();
      }
    } else {
      // Normal Campus Transit
      drawMultiSpectralPerson(st.p1.x, height * 0.76, 1.4, 'female', false, false, legPhase);
      drawMultiSpectralPerson(width * 0.65, height * 0.75, 1.4, 'male', false, false, legPhase * 0.8);
      drawMultiSpectralPerson(width * 0.4, height * 0.74, 1.35, 'female', false, false, 0);
    }
  }

    // 6. AI BOUNDING BOXES & SENSORS
    if (showBoundingBoxes && boundingBoxes.length > 0) {
      boundingBoxes.forEach((box) => {
        const [ymin, xmin, ymax, xmax] = box.box_2d;
        const bx = (xmin / 1000) * width;
        const by = (ymin / 1000) * height;
        const bw = ((xmax - xmin) / 1000) * width;
        const bh = ((ymax - ymin) / 1000) * height;

        let strokeColor = '#10b981';
        let bgTag = 'rgba(16, 185, 129, 0.85)';
        if (box.isSubjectAtRisk) {
          strokeColor = '#f43f5e';
          bgTag = 'rgba(244, 63, 94, 0.9)';
        } else if (box.isPotentialAggressor) {
          strokeColor = '#f59e0b';
          bgTag = 'rgba(245, 158, 11, 0.9)';
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // High-Tech HUD Corner Brackets
        const cLen = Math.min(12, bw * 0.25);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx, by + cLen);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + cLen, by);

        ctx.moveTo(bx + bw - cLen, by);
        ctx.lineTo(bx + bw, by);
        ctx.lineTo(bx + bw, by + cLen);

        ctx.moveTo(bx, by + bh - cLen);
        ctx.lineTo(bx, by + bh);
        ctx.lineTo(bx + cLen, by + bh);

        ctx.moveTo(bx + bw - cLen, by + bh);
        ctx.lineTo(bx + bw, by + bh);
        ctx.lineTo(bx + bw, by + bh - cLen);
        ctx.stroke();

        // Label Badge
        const tagText = `${box.label} [${(box.confidence * 100).toFixed(0)}%]`;
        ctx.font = '10px "JetBrains Mono", monospace';
        const textWidth = ctx.measureText(tagText).width;

        ctx.fillStyle = bgTag;
        ctx.fillRect(bx, Math.max(16, by - 18), textWidth + 10, 16);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(tagText, bx + 5, Math.max(16, by - 6));
      });
    }

    ctx.restore(); // End zoom transformation

    // 7. CCTV SCANLINES & VIGNETTE
    if (visionMode === 'IR_NIGHT' || visionMode === 'OPTICAL_RGB') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }
    }

    // Radial Vignette
    const vigGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.72);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    // 8. OSD HUD OVERLAYS & LIVE RECORDING VISION
    if (showHudOverlay) {
      // OSD Header Bar
      ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
      ctx.fillRect(0, 0, width, 28);

      // Flashing Live REC Dot
      const recPulse = Math.floor(time * 2) % 2 === 0;
      ctx.fillStyle = recPulse ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(14, 14, 5, 0, Math.PI * 2);
      ctx.fill();

      // Live Recording Codec & Status
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('REC', 24, 18);

      // Vision Mode Badge
      let modeBadgeBg = '#334155';
      let modeBadgeText = visionMode;
      if (visionMode === 'THERMAL_FLIR') modeBadgeBg = '#7e22ce';
      else if (visionMode === 'IR_NIGHT') modeBadgeBg = '#15803d';
      else if (visionMode === 'AI_SKELETAL') modeBadgeBg = '#0369a1';
      else if (visionMode === 'CYBER_CONTOUR') modeBadgeBg = '#0e7490';

      ctx.fillStyle = modeBadgeBg;
      ctx.fillRect(52, 6, 74, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillText(visionMode.replace('_', ' '), 56, 17);

      // Camera Identifier
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillText(`${camera.code} // ${camera.name.toUpperCase()}`, 134, 18);

      // Recording Timecode: [HH:MM:SS:FF]
      const hrs = String(Math.floor(recordedSeconds / 3600)).padStart(2, '0');
      const mins = String(Math.floor((recordedSeconds % 3600) / 60)).padStart(2, '0');
      const secs = String(recordedSeconds % 60).padStart(2, '0');
      const frames = String(st.frameCount % 30).padStart(2, '0');
      const timecodeStr = `[${hrs}:${mins}:${secs}:${frames}] 4K/60 H.265`;
      const tcWidth = ctx.measureText(timecodeStr).width;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(timecodeStr, width - tcWidth - 12, 18);

      // Crosshairs Center Target
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      const chSize = 16;
      ctx.beginPath();
      ctx.moveTo(width / 2 - chSize, height / 2);
      ctx.lineTo(width / 2 + chSize, height / 2);
      ctx.moveTo(width / 2, height / 2 - chSize);
      ctx.lineTo(width / 2, height / 2 + chSize);
      ctx.stroke();

      // OSD Footer Bar
      ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
      ctx.fillRect(0, height - 24, width, 24);

      // Telemetry Data
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`FPS: 60 | BITRATE: 4.8 Mbps | LUX: ${camera.ambientLux} lx | ZOOM: ${zoomLevel.toFixed(1)}x`, 12, height - 8);

      // Audio Level VU Meter
      ctx.fillStyle = '#334155';
      ctx.fillRect(width * 0.45, height - 16, 60, 8);
      ctx.fillStyle = st.audioLevel > 0.6 ? '#ef4444' : '#10b981';
      ctx.fillRect(width * 0.45, height - 16, 60 * st.audioLevel, 8);

      // Threat Status Banner & Gender Dot Legend
      let badgeColor = '#10b981';
      if (camera.defaultThreatLevel === 'CRITICAL_DANGER') badgeColor = '#ef4444';
      else if (camera.defaultThreatLevel === 'THREAT_ELEVATED') badgeColor = '#f97316';
      else if (camera.defaultThreatLevel === 'SUSPICIOUS') badgeColor = '#eab308';

      // Gender Legend Micro-indicators in footer
      const legX = width * 0.62;
      // Female Dot Indicator
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(legX, height - 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#f472b6';
      ctx.fillText('♀ FEMALE', legX + 6, height - 9);

      // Male Dot Indicator
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.arc(legX + 62, height - 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('♂ MALE', legX + 68, height - 9);

      const statusStr = `THREAT: ${camera.defaultThreatLevel} (${camera.defaultThreatScore}/100)`;
      const sWidth = ctx.measureText(statusStr).width;
      ctx.fillStyle = badgeColor;
      ctx.fillText(statusStr, width - sWidth - 12, height - 8);

      // Thermal Palette Legend Bar (when in Thermal Mode)
      if (visionMode === 'THERMAL_FLIR') {
        const thermLegW = 80;
        const thermLegH = 8;
        const thermLegX = width - thermLegW - 14;
        const thermLegY = 34;

        const thermGrad = ctx.createLinearGradient(thermLegX, 0, thermLegX + thermLegW, 0);
        thermGrad.addColorStop(0, '#0000ff');
        thermGrad.addColorStop(0.3, '#800080');
        thermGrad.addColorStop(0.6, '#ff0000');
        thermGrad.addColorStop(0.85, '#ffff00');
        thermGrad.addColorStop(1, '#ffffff');

        ctx.fillStyle = thermGrad;
        ctx.fillRect(thermLegX, thermLegY, thermLegW, thermLegH);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(thermLegX, thermLegY, thermLegW, thermLegH);

        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('14°C', thermLegX - 22, thermLegY + 7);
        ctx.fillText('39°C', thermLegX + thermLegW + 4, thermLegY + 7);
      }
    }

  }, [camera, visionMode, showBoundingBoxes, boundingBoxes, spotlightActive, zoomLevel, showHudOverlay, showProximityRadar, recordedSeconds]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTimestamp: number | null = null;

    const loop = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = (timestamp - startTimestamp) / 1000;

      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth || (isCompact ? 400 : 800);
        canvas.height = canvas.clientHeight || (isCompact ? 240 : 450);
      }

      renderScene(ctx, canvas.width, canvas.height, elapsed);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderScene, isCompact]);

  // Capture Snapshot / Trigger Gemini AI Scan
  const handleSnap = () => {
    if (!canvasRef.current || !onCaptureFrame) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
    onCaptureFrame(dataUrl);
  };

  // Save Recorded Footage Clip to Local
  const handleDownloadClip = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `CCTV_${camera.code}_${visionMode}_RECORDING_${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
    setClipSavedToast(`Surveillance frame buffer (${visionMode}) exported successfully.`);
    setTimeout(() => setClipSavedToast(null), 3000);
  };

  return (
    <div className={`relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl group flex flex-col ${className}`}>
      {/* Canvas Video Stage */}
      <div className="relative w-full flex-1 aspect-[16/10] overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block cursor-crosshair"
        />

        {/* Hidden Video element for real webcam / IP stream / file video decoding */}
        <video
          ref={videoElementRef}
          playsInline
          muted
          crossOrigin="anonymous"
          className="hidden"
        />

        {/* Vision Mode Selector Floating Top-Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 z-20 pointer-events-none">
          {/* Multi-Spectral Vision Mode Switcher Pills */}
          <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-lg border border-slate-800 pointer-events-auto shadow-lg">
            <button
              onClick={() => setVisionMode('OPTICAL_RGB')}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                visionMode === 'OPTICAL_RGB'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Optical RGB Surveillance Feed"
            >
              <Camera className="w-3 h-3" />
              <span className="hidden sm:inline">OPTICAL RGB</span>
            </button>

            <button
              onClick={() => setVisionMode('IR_NIGHT')}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                visionMode === 'IR_NIGHT'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Infrared Night Vision Sensor"
            >
              <Moon className="w-3 h-3" />
              <span className="hidden sm:inline">IR NIGHT</span>
            </button>

            <button
              onClick={() => setVisionMode('THERMAL_FLIR')}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                visionMode === 'THERMAL_FLIR'
                  ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="FLIR Thermal Heat-Map Signature"
            >
              <Flame className="w-3 h-3" />
              <span className="hidden sm:inline">FLIR THERMAL</span>
            </button>

            <button
              onClick={() => setVisionMode('AI_SKELETAL')}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                visionMode === 'AI_SKELETAL'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="AI Kinematic Pose & Biometric Skeletal Tracking"
            >
              <Activity className="w-3 h-3" />
              <span className="hidden sm:inline">AI SKELETAL</span>
            </button>

            <button
              onClick={() => setVisionMode('CYBER_CONTOUR')}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                visionMode === 'CYBER_CONTOUR'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cyber Edge Matrix Contour"
            >
              <Scan className="w-3 h-3" />
              <span className="hidden sm:inline">CYBER MATRIX</span>
            </button>
          </div>

          {/* Quick Action Buttons (Link Source, Zoom, Export, AI Scan) */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Link Real CCTV Source Button */}
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border backdrop-blur-md shadow transition-all ${
                videoSourceMode === 'SIMULATION'
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 ring-1 ring-emerald-500/30'
              }`}
              title="Link live CCTV camera, webcam, RTSP stream, or upload footage clip"
            >
              <Link2 className={`w-3.5 h-3.5 ${videoSourceMode !== 'SIMULATION' ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {videoSourceMode === 'SIMULATION' && 'Link CCTV'}
                {videoSourceMode === 'WEBCAM' && 'Live Webcam'}
                {videoSourceMode === 'VIDEO_FILE' && 'CCTV Clip'}
                {videoSourceMode === 'STREAM_URL' && 'IP Stream'}
              </span>
            </button>

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-0.5 bg-slate-950/85 backdrop-blur-md p-0.5 rounded-lg border border-slate-800 text-slate-300 text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                disabled={zoomLevel <= 1}
                className="p-1 hover:bg-slate-800 rounded disabled:opacity-40"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] px-1 font-bold">{zoomLevel.toFixed(1)}x</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
                disabled={zoomLevel >= 3}
                className="p-1 hover:bg-slate-800 rounded disabled:opacity-40"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export Frame / Clip */}
            <button
              onClick={handleDownloadClip}
              title="Export Evidence Footage Snapshot"
              className="p-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-md shadow"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* AI Scan Button */}
            {onCaptureFrame && (
              <button
                onClick={handleSnap}
                title="Scan Scene with Gemini Vision"
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-950/50 backdrop-blur-md active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI SCAN</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Recording Toast Notification */}
        {clipSavedToast && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-emerald-500 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur-md shadow-2xl flex items-center gap-2 z-30 animate-in fade-in slide-in-from-bottom-2">
            <Disc className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>{clipSavedToast}</span>
          </div>
        )}

        {/* Alert Pulse Border for Critical Danger Feeds */}
        {camera.defaultThreatLevel === 'CRITICAL_DANGER' && (
          <div className="absolute inset-0 pointer-events-none border-2 border-rose-500/50 animate-pulse rounded-xl" />
        )}
      </div>

      {/* CCTV Source Linker Modal */}
      <CctvSourceLinkerModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        currentSource={videoSourceMode}
        onSelectSource={handleSelectSource}
        streamUrl={streamUrl}
        cameraName={camera.name}
        cameraCode={camera.code}
      />
    </div>
  );
};
