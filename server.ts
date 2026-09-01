import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 30mb limit for CCTV base64 frames
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Lazy/Safe Gemini client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    system: "NirbhayaVision - Women Safety Analytics",
    timestamp: new Date().toISOString(),
  });
});

// CCTV Frame Vision Analysis with Multi-Factor Context
app.post("/api/analyze-cctv", async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = "image/jpeg",
      location = "Campus Location",
      cameraName = "CAM-01",
      timeOfDay = "23:45",
      isNight = true,
      ambientLux = 20,
      isolationLevel = "High",
      scenarioContext = "Standard Monitoring",
    } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      // Return highly structured fallback if API key is not yet set
      return res.json({
        threatLevel: isNight && ambientLux < 30 ? "THREAT_ELEVATED" : "SUSPICIOUS",
        threatScore: isNight && ambientLux < 30 ? 78 : 45,
        genderDistribution: {
          femaleCount: 1,
          maleCount: 3,
          unknownCount: 0,
          ratioDescription: "1 Female : 3 Males (Severe gender skew in isolated zone)",
        },
        detectedBehaviors: [
          {
            tag: "Close Proximity Trailing",
            description: "Individual closely matching movement cadence of lone subject in shadow corridor.",
            severity: "high",
          },
          {
            tag: "Loitering in Blindspot",
            description: "Two subjects stationary near corner with restricted line of sight.",
            severity: "medium",
          },
        ],
        lightingEvaluation: {
          luxEstimate: `${ambientLux} Lux (Sub-standard perimeter illumination)`,
          visibilityScore: 32,
          darkSpotsIdentified: true,
          commentary: "Deep shadow pocket near pillar obscuring rapid exit paths.",
        },
        contextualRiskFactors: [
          `Time Factor: ${timeOfDay} (${isNight ? "Late-night curfew window" : "Daylight"})`,
          `Location Risk: ${location} (${isolationLevel} Isolation Profile)`,
          `Lux Level: ${ambientLux} Lux (Low visibility / shadow occlusion)`,
          "Gender Skew: 1 Female surrounded/trailed by multiple males",
        ],
        boundingBoxes: [
          {
            label: "Subject at Risk (Female)",
            box_2d: [380, 220, 780, 390],
            confidence: 0.94,
            gender: "female",
            behavior: "Rapid hurried walking, looking back",
            isSubjectAtRisk: true,
            isPotentialAggressor: false,
          },
          {
            label: "Suspicious Individual 1 (Male)",
            box_2d: [350, 120, 810, 280],
            confidence: 0.91,
            gender: "male",
            behavior: "Trailing within 2.5m, concealed posture",
            isSubjectAtRisk: false,
            isPotentialAggressor: true,
          },
          {
            label: "Loitering Individual 2 (Male)",
            box_2d: [410, 520, 790, 640],
            confidence: 0.88,
            gender: "male",
            behavior: "Stationary near exit corner",
            isSubjectAtRisk: false,
            isPotentialAggressor: false,
          },
        ],
        immediateActionRecommended: "Trigger Intermediate Alert (Stage 1) to Control Room Operator with live CCTV feed lock.",
        failSafeEscalationRecommended: isNight && ambientLux < 30,
        reasoningSummary: `Multi-factor risk score evaluated at ${isNight ? "78/100" : "45/100"}. The combination of late night (${timeOfDay}), low ambient lighting (${ambientLux} Lux), isolated location (${location}), and skewed gender ratio (1F:3M) with trailing behavior requires immediate intermediate operator acknowledgement.`,
        isFallback: true,
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, "") : null;

    const promptText = `
You are the AI Core of "NirbhayaVision" - an advanced real-time CCTV Women Safety Analytics & Threat Monitoring System for Smart India Hackathon (SIH) 2026.

Analyze this CCTV camera frame in detail using multi-factor situational reasoning.

CONTEXTUAL TELEMETRY:
- Camera: ${cameraName}
- Location: ${location}
- Time of Day: ${timeOfDay} (${isNight ? "NIGHT TIME / CURFEW" : "DAY TIME"})
- Ambient Lighting: ${ambientLux} Lux (${ambientLux < 35 ? "Poor / Dim / Dark" : ambientLux < 100 ? "Moderate" : "Well-illuminated"})
- Isolation Profile: ${isolationLevel}
- Scenario: ${scenarioContext}

EVALUATION RULES:
1. GENDER RATIO ANALYSIS: Count female individuals, male individuals, and note if a lone female is present around multiple males.
2. BEHAVIOR & SPATIAL ANOMALY: Detect stalking, trailing footsteps, cornering, aggressive blocking, crowd gathering, loitering in dark zones, running/hurried gait, distress hand signals, physical struggles, or normal peaceful transit.
3. CONTEXTUAL RISK MULTIPLIERS:
   - Late night (after 21:00 or before 06:00) significantly raises risk.
   - Low ambient lighting (< 40 Lux) / shadows multiplies threat vulnerability.
   - Isolated areas (alleys, basements, perimeter gates, back pathways) amplify danger.
   - Skewed ratio (e.g., 1 Female : Multiple Males in secluded space) is an elevated safety trigger.
4. THREAT SCORING:
   - 0-30: SAFE (Normal transit, balanced crowd, daytime or well-lit benign activity)
   - 31-60: SUSPICIOUS (Loitering, unusual grouping, single female at night with neutral distance)
   - 61-80: THREAT_ELEVATED (Trailing, close following, skewed ratio in dark corner, distress hesitation)
   - 81-100: CRITICAL_DANGER (Cornering, physical intimidation, aggressive grab, explicit distress gestures)

5. BOUNDING BOXES:
   Provide approximate bounding boxes in standard 0-1000 scale [ymin, xmin, ymax, xmax] for any detected humans, identifying their gender, behavior, whether they are 'isSubjectAtRisk' or 'isPotentialAggressor'.

Respond strictly in JSON matching the requested schema.
`;

    const parts: any[] = [];
    if (cleanBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatLevel: {
              type: Type.STRING,
              description: "Must be SAFE, SUSPICIOUS, THREAT_ELEVATED, or CRITICAL_DANGER",
            },
            threatScore: {
              type: Type.INTEGER,
              description: "Threat index score from 0 to 100",
            },
            genderDistribution: {
              type: Type.OBJECT,
              properties: {
                femaleCount: { type: Type.INTEGER },
                maleCount: { type: Type.INTEGER },
                unknownCount: { type: Type.INTEGER },
                ratioDescription: { type: Type.STRING },
              },
              required: ["femaleCount", "maleCount", "ratioDescription"],
            },
            detectedBehaviors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tag: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "low, medium, high, or critical" },
                },
                required: ["tag", "description", "severity"],
              },
            },
            lightingEvaluation: {
              type: Type.OBJECT,
              properties: {
                luxEstimate: { type: Type.STRING },
                visibilityScore: { type: Type.INTEGER },
                darkSpotsIdentified: { type: Type.BOOLEAN },
                commentary: { type: Type.STRING },
              },
              required: ["luxEstimate", "visibilityScore", "darkSpotsIdentified", "commentary"],
            },
            contextualRiskFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            boundingBoxes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: "[ymin, xmin, ymax, xmax] in 0-1000 scale",
                  },
                  confidence: { type: Type.NUMBER },
                  gender: { type: Type.STRING, description: "female, male, or unidentified" },
                  behavior: { type: Type.STRING },
                  isSubjectAtRisk: { type: Type.BOOLEAN },
                  isPotentialAggressor: { type: Type.BOOLEAN },
                },
                required: ["label", "box_2d", "confidence", "gender", "behavior"],
              },
            },
            immediateActionRecommended: { type: Type.STRING },
            failSafeEscalationRecommended: { type: Type.BOOLEAN },
            reasoningSummary: { type: Type.STRING },
          },
          required: [
            "threatLevel",
            "threatScore",
            "genderDistribution",
            "detectedBehaviors",
            "lightingEvaluation",
            "contextualRiskFactors",
            "boundingBoxes",
            "immediateActionRecommended",
            "failSafeEscalationRecommended",
            "reasoningSummary",
          ],
        },
      },
    });

    const text = response.text || "{}";
    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/analyze-cctv:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze CCTV frame",
      threatLevel: "SUSPICIOUS",
      threatScore: 50,
      reasoningSummary: "Analysis temporarily unavailable, defaulting to precautionary monitoring status.",
    });
  }
});

// Fail-Safe Authority Escalation Dispatch API
app.post("/api/dispatch-authorities", async (req, res) => {
  try {
    const {
      incidentId = `INC-${Date.now().toString().slice(-6)}`,
      cameraName,
      location,
      threatScore,
      threatLevel,
      genderRatio,
      detectedBehaviors,
      escalationReason = "Unacknowledged Human Intermediate Warnings (Fail-Safe Triggered)",
      operatorNotes = "Automatic fail-safe timer elapsed without human clearance.",
    } = req.body;

    const dispatchRecord = {
      dispatchId: `DISPATCH-POLICE-${Date.now().toString().slice(-8)}`,
      incidentId,
      timestamp: new Date().toISOString(),
      status: "AUTHORITIES_DISPATCHED",
      unitsDispatched: [
        {
          unitId: "PCR-VAN-09",
          agency: "City Police Women Safety Flying Squad",
          eta: "3 mins",
          contact: "+91 112 / PCR-9",
          coordinates: "Lat 28.5452° N, Long 77.1926° E",
        },
        {
          unitId: "CAMPUS-QRT-02",
          agency: "Campus Rapid Reaction Force (Bikes 4 & 5)",
          eta: "45 secs",
          contact: "Walkie VHF Ch-4 (Officer Balraj)",
          coordinates: "North Gate Sector 2",
        },
        {
          unitId: "WARDEN-PATROL",
          agency: "Chief Proctor & Hostel Emergency Response",
          eta: "1 min",
          contact: "Ext 4099",
          coordinates: "Sector 1 Girls Hostel Hub",
        },
      ],
      alertSummary: {
        camera: cameraName,
        location,
        threatScore,
        threatLevel,
        genderRatio,
        detectedBehaviors,
        escalationReason,
        operatorNotes,
        broadcastSiren: true,
        spotlightActivated: true,
      },
    };

    res.json(dispatchRecord);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Comprehensive AI Incident Report Generator
app.post("/api/generate-incident-report", async (req, res) => {
  try {
    const { incident } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        formalReport: `INCIDENT AUDIT LOG #${incident?.id || "INC-2026-001"}
Location: ${incident?.location || "Perimeter Lane"}
Threat Assessment: ${incident?.threatScore || 85}/100 [${incident?.threatLevel || "CRITICAL"}]
Fail-Safe Action: Transferred to Law Enforcement (112) and Quick Reaction Unit following 3 unacknowledged warnings.
Recommended Corrective Actions: Increase lighting to minimum 100 Lux along pathway; add physical emergency panic button post.`,
      });
    }

    const prompt = `Generate a formal Police & Campus Security Incident Investigation Report for the following Women Safety Analytics Incident:
Data: ${JSON.stringify(incident, null, 2)}
Include:
1. Executive Summary & Timestamp
2. Multi-Factor Context Breakdown (Time, Lux Lighting, Gender Ratio, Spatial Proximity)
3. Fail-Safe Escalation Chain Record (Intermediate Operator warnings and dispatch triggers)
4. Forensic Video Evidence Summary
5. Immediate Corrective Preventive Recommendations for Campus Administration.
Keep it formatted in clean markdown.`;

    const resp = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({
      formalReport: resp.text || "Report generated successfully.",
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NirbhayaVision Server running on http://localhost:${PORT}`);
  });
}

startServer();
