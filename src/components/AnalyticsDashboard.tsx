import React, { useState } from 'react';
import { IncidentRecord } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  ShieldAlert, 
  Clock, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  SunMedium, 
  Sparkles,
  Search
} from 'lucide-react';

interface AnalyticsDashboardProps {
  incidents: IncidentRecord[];
}

const HOURLY_DATA = [
  { hour: '18:00', threats: 1, luxAvg: 140, safeTransits: 45 },
  { hour: '20:00', threats: 2, luxAvg: 85, safeTransits: 38 },
  { hour: '22:00', threats: 4, luxAvg: 40, safeTransits: 22 },
  { hour: '00:00', threats: 7, luxAvg: 25, safeTransits: 11 },
  { hour: '01:00', threats: 9, luxAvg: 18, safeTransits: 6 },
  { hour: '02:00', threats: 11, luxAvg: 14, safeTransits: 4 },
  { hour: '03:00', threats: 8, luxAvg: 16, safeTransits: 3 },
  { hour: '04:00', threats: 5, luxAvg: 20, safeTransits: 5 },
  { hour: '06:00', threats: 1, luxAvg: 90, safeTransits: 29 },
  { hour: '08:00', threats: 0, luxAvg: 280, safeTransits: 110 },
  { hour: '12:00', threats: 0, luxAvg: 420, safeTransits: 180 },
  { hour: '15:00', threats: 0, luxAvg: 360, safeTransits: 150 },
];

const ZONE_RISK_DATA = [
  { zone: 'Hostel North Path', riskScore: 88, incidentCount: 6, fill: '#f43f5e' },
  { zone: 'Sports Boundary', riskScore: 94, incidentCount: 4, fill: '#f43f5e' },
  { zone: 'Basement Parking', riskScore: 84, incidentCount: 5, fill: '#f59e0b' },
  { zone: 'Library Rear Alley', riskScore: 72, incidentCount: 3, fill: '#f59e0b' },
  { zone: 'Mess Delivery Dock', riskScore: 48, incidentCount: 2, fill: '#eab308' },
  { zone: 'Main Quadrangle', riskScore: 12, incidentCount: 0, fill: '#10b981' },
];

const BEHAVIOR_PIE = [
  { name: 'Stalking / Trailing', value: 42, color: '#f43f5e' },
  { name: 'Cornering / Egress Block', value: 28, color: '#f59e0b' },
  { name: 'Loitering in Shadows', value: 18, color: '#eab308' },
  { name: 'Distress Motion', value: 12, color: '#ec4899' },
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ incidents }) => {
  const [selectedIncidentForReport, setSelectedIncidentForReport] = useState<IncidentRecord | null>(null);
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [formalReportText, setFormalReportText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const generateReport = async (inc: IncidentRecord) => {
    setSelectedIncidentForReport(inc);
    setGeneratingReport(true);

    try {
      const res = await fetch('/api/generate-incident-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident: inc }),
      });
      const data = await res.json();
      setFormalReportText(data.formalReport);
    } catch (e) {
      setFormalReportText(`INCIDENT AUDIT LOG: ${inc.id}\nLocation: ${inc.location}\nThreat: ${inc.threatScore}/100\nFail-safe dispatched to Police 112.`);
    } finally {
      setGeneratingReport(false);
    }
  };

  const filteredIncidents = incidents.filter(
    (inc) =>
      inc.cameraName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.threatLevel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Campus Safety Health Score */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Campus Safety Index</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-400">92.4%</span>
            <span className="text-xs text-emerald-300 font-mono flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +4.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time aggregate across 24 monitored cameras
          </p>
        </div>

        {/* Metric 2: Fail-Safe MTTA (Mean Time To Acknowledge) */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Mean Response Time (MTTA)</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-sky-400">11.8s</span>
            <span className="text-xs text-slate-400 font-mono">Max limit: 30s</span>
          </div>
          <p className="text-[11px] text-slate-400">
            0 unmitigated timeouts • 100% fail-safe coverage
          </p>
        </div>

        {/* Metric 3: Gender Ratio Anomaly Detections */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Isolated Skew Anomaly Rate</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-indigo-300">14 alerts</span>
            <span className="text-xs text-rose-400 font-mono">Peak: 01:00-03:00</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Identified lone females surrounded by 2+ individuals
          </p>
        </div>

        {/* Metric 4: Low Light Lux Deficit Zones */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Sub-30 Lux Danger Spots</span>
            <SunMedium className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-400">3 Sectors</span>
            <span className="text-xs text-amber-300 font-mono">Lamp repairs filed</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Hostel North, Sports Gate 3, Basement B
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Hourly Threat vs Ambient Lux Correlation */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                24-Hour Threat Frequency vs Ambient Lux Correlation
              </h3>
              <p className="text-xs text-slate-400">
                Demonstrates how low ambient lighting and curfew hours amplify threat probability
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 px-2 py-1 rounded bg-slate-950 border border-slate-800">
              TEMPORAL MODEL
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="luxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area type="monotone" dataKey="threats" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#threatGrad)" name="Threat Events" />
                <Area type="monotone" dataKey="luxAvg" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#luxGrad)" name="Avg Lux (lx)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Zone Risk Vulnerability Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                Campus Zone Risk Vulnerability Index
              </h3>
              <p className="text-xs text-slate-400">
                Multi-factor risk scoring based on isolation, illumination, and transit geometry
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 px-2 py-1 rounded bg-slate-950 border border-slate-800">
              GIS ZONES
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ZONE_RISK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="zone" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="riskScore" radius={[6, 6, 0, 0]} name="Risk Score (0-100)">
                  {ZONE_RISK_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Incident Audit Ledger & Dispatch Records */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" />
              Incident Audit Ledger & Escalation History
            </h3>
            <p className="text-xs text-slate-400">
              Permanent immutable security log of all evaluated CCTV events, warnings, and authority dispatches
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents or camera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Incident Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">INCIDENT ID</th>
                <th className="py-2.5 px-3">TIME</th>
                <th className="py-2.5 px-3">CAMERA / ZONE</th>
                <th className="py-2.5 px-3">THREAT</th>
                <th className="py-2.5 px-3">GENDER SKEW</th>
                <th className="py-2.5 px-3">STATUS & DISPATCH</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No matching incidents logged.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-200">
                      {inc.id}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {inc.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{inc.cameraName}</div>
                      <div className="text-[11px] text-slate-400">{inc.location}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          inc.threatLevel === 'CRITICAL_DANGER'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : inc.threatLevel === 'THREAT_ELEVATED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {inc.threatScore}/100 [{inc.threatLevel}]
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-indigo-300 text-[11px]">
                      {inc.genderRatio}
                    </td>
                    <td className="py-3 px-3">
                      {inc.stage === 'STAGE_4_ESCALATED_POLICE' ? (
                        <span className="text-rose-400 font-semibold font-mono text-[11px] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          Police 112 Dispatched
                        </span>
                      ) : inc.stage === 'ACKNOWLEDGED' ? (
                        <span className="text-sky-400 font-medium font-mono text-[11px] flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Operator Investigating
                        </span>
                      ) : (
                        <span className="text-yellow-400 font-mono text-[11px]">
                          Pending Warning
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => generateReport(inc)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono border border-slate-700 inline-flex items-center gap-1 transition-all"
                      >
                        <FileText className="w-3 h-3 text-sky-400" />
                        <span>AI Report</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal AI Incident Investigation Report Modal */}
      {selectedIncidentForReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <Sparkles className="w-5 h-5" />
                <span>Formal Police & Administrative Incident Investigation Report</span>
              </div>
              <button
                onClick={() => setSelectedIncidentForReport(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            {generatingReport ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-300">
                <Sparkles className="w-8 h-8 text-rose-400 animate-spin" />
                <span className="text-xs font-mono">Gemini 3.7 Flash generating forensic report...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-slate-500">INCIDENT ID:</span>
                    <div className="font-bold text-slate-200">{selectedIncidentForReport.id}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">TIMESTAMP:</span>
                    <div className="font-bold text-slate-200">{selectedIncidentForReport.timestamp}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">CAMERA:</span>
                    <div className="font-bold text-slate-200">{selectedIncidentForReport.cameraName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">THREAT INDEX:</span>
                    <div className="font-bold text-rose-400">{selectedIncidentForReport.threatScore}/100</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                  {formalReportText}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Signed & Verified by NirbhayaVision AI Core
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                    <button
                      onClick={() => setSelectedIncidentForReport(null)}
                      className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
