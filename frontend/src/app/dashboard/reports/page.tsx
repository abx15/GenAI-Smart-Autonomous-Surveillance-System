"use client";

import React, { useState } from "react";
import { 
  FileText, 
  BarChart3, 
  LineChart, 
  RotateCcw, 
  Share2, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  Activity,
  User,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

const mockReports = [
  { id: "SHIFT_D_09", date: "2026-03-31", lead: "AI_ANALYST_v4", status: "COMPLETED" },
  { id: "SHIFT_C_08", date: "2026-03-30", lead: "AI_ANALYST_v4", status: "ARCHIVED" },
  { id: "SHIFT_B_07", date: "2026-03-29", lead: "SYSTEM_GEN", status: "ARCHIVED" },
  { id: "SHIFT_A_06", date: "2026-03-28", lead: "SYSTEM_GEN", status: "ARCHIVED" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(mockReports[0]);

  return (
    <div className="flex flex-col gap-6 h-full font-mono relative overflow-hidden">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[9999] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-card-border pb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-[0.2em] text-primary uppercase m-0 flex items-center gap-3 animate-pulse">
            <FileText className="w-6 h-6 border border-primary/40 p-0.5" />
            DAILY SHIFT REPORTS
          </h1>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="h-9 truncate px-4 text-[11px] tracking-[0.2em] uppercase bg-primary/20 hover:bg-primary/30 border border-primary/30">
              <RotateCcw className="w-4 h-4 mr-2" />
              RE-GENERATE ANALYTICS
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-4 text-[11px] tracking-[0.2em] uppercase border border-card-border hover:border-primary">
              <Share2 className="w-4 h-4 mr-2" />
              EXPORT TO COMMAND
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-primary/70 uppercase tracking-widest mt-2">
          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> UPLINK: STABLE</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> ENCRYPTION: AES-256</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> T_SYNC: 0.002ms</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        {/* Horizontal Shift History */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-card-border">
          {mockReports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className={cn(
                "flex-shrink-0 w-64 p-4 border transition-all text-left group",
                selectedReport.id === report.id 
                  ? "border-primary bg-primary/10 border-l-4" 
                  : "border-card-border bg-card/20 hover:bg-card/40"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                 <span className="text-[9px] text-muted uppercase tracking-tighter">{report.date}</span>
                 <span className={cn(
                   "text-[8px] px-1.5 py-0.5 border font-bold uppercase",
                   report.status === "COMPLETED" ? "border-primary text-primary" : "border-muted text-muted"
                 )}>
                   {report.status}
                 </span>
              </div>
              <h3 className="text-sm font-bold tracking-widest text-foreground group-hover:text-primary mb-1">{report.id}</h3>
              <div className="flex items-center gap-2 text-[10px] text-muted">
                <User className="w-3 h-3" />
                <span>LEAD Analyst: {report.lead}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-6 h-full overflow-hidden">
          {/* Middle: Shift Summary (Markdown Style) */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-thin scrollbar-thumb-card-border">
            <Card className="bg-card/40 border-none relative">
              <div className="absolute top-0 left-0 w-8 h-[1px] bg-primary/40" />
              <div className="absolute top-0 left-0 w-[1px] h-8 bg-primary/40" />
              <CardHeader className="border-b border-card-border/50 bg-primary/5 py-4">
                <CardTitle className="text-sm tracking-[0.2em] text-primary flex items-center justify-between">
                  <span>SHIFT_DATA_ANALYSIS: {selectedReport.id}</span>
                  <span className="text-[10px] text-muted font-normal uppercase">VERSION 1.0.44-STABLE</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 font-mono space-y-8 leading-relaxed">
                <section>
                   <h2 className="text-primary text-lg font-bold mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-primary/20 pb-2">
                     <AlertCircle className="w-5 h-5" /> 1. Incident Summary
                   </h2>
                   <p className="text-foreground/80 text-sm">
                     No unauthorized breaches detected during Shift Delta. Minor thermal fluctuations detected in Sector 7 perimeter at 03:44 UTC. System categorized as <span className="text-primary font-bold">[OPERATIONAL_STABLE]</span>. 
                     Total tracked entities during shift: <span className="text-primary">4,812</span>.
                   </p>
                </section>

                <section className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-card-border p-4">
                    <span className="text-[10px] text-muted uppercase">Total Detections</span>
                    <div className="text-3xl font-bold text-primary mt-1">1,248</div>
                  </div>
                  <div className="bg-black/40 border border-card-border p-4">
                    <span className="text-[10px] text-muted uppercase">Critical Anomalies</span>
                    <div className="text-3xl font-bold text-danger mt-1">000</div>
                  </div>
                </section>

                <section>
                   <h2 className="text-primary text-lg font-bold mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-primary/20 pb-2">
                     <RotateCcw className="w-5 h-5" /> 2. AI Recommendations
                   </h2>
                   <ul className="space-y-4">
                     <li className="flex gap-4 border-l-2 border-primary/40 pl-4 py-1">
                        <span className="text-primary font-bold text-sm">01.</span>
                        <p className="text-sm text-foreground/70">Increase sensor sensitivity in <span className="text-warning">Sector 7</span> perimeter due to recurrent thermal noise spikes.</p>
                     </li>
                     <li className="flex gap-4 border-l-2 border-primary/40 pl-4 py-1">
                        <span className="text-primary font-bold text-sm">02.</span>
                        <p className="text-sm text-foreground/70">Automatic firmware synchronization for <span className="text-primary">CAM_04</span> and <span className="text-primary">CAM_09</span> recommended within next 24 hours.</p>
                     </li>
                     <li className="flex gap-4 border-l-2 border-primary/40 pl-4 py-1">
                        <span className="text-primary font-bold text-sm">03.</span>
                        <p className="text-sm text-foreground/70">Rotate human monitoring focus to <span className="text-warning">G_EXIT_WEST</span> during peak shift transitions (08:00 - 10:00).</p>
                     </li>
                   </ul>
                </section>
              </CardContent>
            </Card>
          </div>

          {/* Right: Tactical Visualizations */}
          <aside className="w-96 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-6 scrollbar-thin">
            {/* Event Frequency Chart */}
            <Card className="bg-card/40 border-card-border relative">
              <CardHeader className="py-3 px-4 border-b border-card-border/50">
                 <CardTitle className="text-[10px] tracking-widest flex items-center gap-2">
                   <BarChart3 className="w-3 h-3 text-primary" /> EVENT FREQUENCY / HR
                 </CardTitle>
              </CardHeader>
              <CardContent className="h-48 p-4 flex items-end gap-1 px-6">
                {[40, 60, 45, 90, 100, 30, 20, 50, 70, 80, 40, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/20 border-t border-x border-primary/40 relative group hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {h*12} EVT
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="px-6 pb-2 text-[8px] text-muted flex justify-between uppercase">
                <span>00:00</span>
                <span>12:00</span>
                <span>23:59</span>
              </div>
            </Card>

            {/* System Stability Chart */}
            <Card className="bg-card/40 border-card-border relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Activity className="w-16 h-16 text-primary" />
              </div>
              <CardHeader className="py-3 px-4 border-b border-card-border/50">
                 <CardTitle className="text-[10px] tracking-widest flex items-center gap-2">
                   <TrendingUp className="w-3 h-3 text-primary" /> SYSTEM_UPTIME_STABILITY
                 </CardTitle>
              </CardHeader>
              <CardContent className="h-40 p-4 relative">
                {/* SVG Line Chart */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path 
                    d="M 0 10 L 10 12 L 20 8 L 30 15 L 40 5 L 50 10 L 60 7 L 70 14 L 80 12 L 90 9 L 100 11" 
                    fill="none" 
                    stroke="#00ff88" 
                    strokeWidth="0.5"
                    className="animate-[dash_5s_linear_infinite]"
                  />
                  <path 
                    d="M 0 10 L 10 12 L 20 8 L 30 15 L 40 5 L 50 10 L 60 7 L 70 14 L 80 12 L 90 9 L 100 11 V 100 H 0 Z" 
                    fill="url(#gradient)" 
                    opacity="0.1" 
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#00ff88', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#00ff88', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute top-4 right-4 text-[14px] font-bold text-primary">99.98%</div>
              </CardContent>
              <div className="px-6 pb-4 flex justify-between items-center text-[10px]">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary animate-pulse" />
                    <span className="text-muted tracking-widest text-[8px] uppercase font-bold">LATENCY_STABLE</span>
                 </div>
                 <div className="text-[8px] text-muted font-bold uppercase tracking-widest">REF: SASS_K8S_STATUS</div>
              </div>
            </Card>

            {/* AI Summary Metadata */}
            <Card className="bg-card/40 border-card-border overflow-hidden p-4">
              <div className="space-y-4">
                <DetailItem label="REPORT_GENERATED" value="2026-03-31T05:24:00Z" />
                <DetailItem label="TOTAL_DATA_PROCESSED" value="1.4 TB" />
                <DetailItem label="ENCRYPTION_HASH" value="sha256:7f99a...b21" />
                <DetailItem label="STATUS" value="READ_ONLY_ARCHIVE" />
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[8px] text-muted uppercase tracking-tighter">{label}</span>
    <span className="text-[10px] font-bold tracking-widest text-primary/80 truncate">{value}</span>
  </div>
);
