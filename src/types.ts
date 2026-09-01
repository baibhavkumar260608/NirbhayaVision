/**
 * NirbhayaVision - Women Safety Analytics & CCTV Fail-Safe Monitoring
 * Types definition
 */

export type ThreatLevel = 'SAFE' | 'SUSPICIOUS' | 'THREAT_ELEVATED' | 'CRITICAL_DANGER';

export type AlertStage = 
  | 'IDLE'                   // Normal monitoring
  | 'STAGE_1_WARNING'       // 1st warning to human intermediate (30s countdown, soft chime)
  | 'STAGE_2_WARNING'       // 2nd warning to human intermediate (15s countdown, urgent siren + SMS)
  | 'STAGE_3_WARNING'       // 3rd critical warning (5s countdown, flashing strobe alert)
  | 'STAGE_4_ESCALATED_POLICE' // Fail-safe auto-escalated to Police 112 & Rapid Reaction Force
  | 'ACKNOWLEDGED'          // Human intermediate acknowledged & investigating
  | 'DISMISSED_SAFE';       // False positive resolved with audit note

export interface BoundingBox {
  label: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  confidence: number;
  gender: 'female' | 'male' | 'unidentified';
  behavior: string;
  isSubjectAtRisk?: boolean;
  isPotentialAggressor?: boolean;
}

export interface DetectedBehavior {
  tag: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface GenderDistribution {
  femaleCount: number;
  maleCount: number;
  unknownCount: number;
  ratioDescription: string;
}

export interface LightingEvaluation {
  luxEstimate: string;
  visibilityScore: number; // 0-100
  darkSpotsIdentified: boolean;
  commentary: string;
}

export interface CCTVAnalysisResult {
  threatLevel: ThreatLevel;
  threatScore: number; // 0-100
  genderDistribution: GenderDistribution;
  detectedBehaviors: DetectedBehavior[];
  lightingEvaluation: LightingEvaluation;
  contextualRiskFactors: string[];
  boundingBoxes: BoundingBox[];
  immediateActionRecommended: string;
  failSafeEscalationRecommended: boolean;
  reasoningSummary: string;
  analyzedAt?: string;
  isFallback?: boolean;
}

export interface CCTVCamera {
  id: string;
  code: string;
  name: string;
  zone: string;
  locationDetails: string;
  isolationLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  ambientLux: number; // in Lux (e.g., 15 - 400)
  timeOfDay: string; // "23:45"
  isNight: boolean;
  status: 'ONLINE' | 'MAINTENANCE' | 'ALERT_TRIGGERED';
  streamFps: number;
  resolution: string;
  coordinates: { x: number; y: number; lat: number; lng: number };
  nearestGuardPost: string;
  nearestGuardDistanceMeters: number;
  scenarioPreset: string;
  defaultThreatLevel: ThreatLevel;
  defaultThreatScore: number;
  defaultAnalysis: CCTVAnalysisResult;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  location: string;
  threatLevel: ThreatLevel;
  threatScore: number;
  genderRatio: string;
  detectedBehaviors: string[];
  ambientLux: number;
  stage: AlertStage;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  dispatchedAt?: string;
  dispatchUnits?: Array<{
    unitId: string;
    agency: string;
    eta: string;
    contact: string;
  }>;
  operatorNotes?: string;
  snapshotUrl?: string;
  formalReport?: string;
}

export interface SIHScenarioPreset {
  id: string;
  title: string;
  subtitle: string;
  cameraId: string;
  time: string;
  lux: number;
  genderRatio: string;
  threatExpected: ThreatLevel;
  riskSummary: string;
  description: string;
}
