"use client";

import React, { useState } from "react";
import { 
  Database, 
  Filter, 
  Search, 
  Play, 
  MoreHorizontal, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Shield,
  ExternalLink,
  ChevronRight,
  Video
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { cn, formatRelativeTime } from "../../../lib/utils";
import { SurveillanceEvent } from "../../../types";

const mockEvents: SurveillanceEvent[] = [
  { id: "EVT-8821", timestamp: new Date().toISOString(), type: "Zone Intrusion", severity: "critical", cameraId: "1", tracks: [102], duration: 15, status: "unresolved" },
  { id: "EVT-8820", timestamp: new Date(Date.now() - 300000).toISOString(), type: "Loitering", severity: "high", cameraId: "2", tracks: [45, 48], duration: 120, status: "resolved" },
  { id: "EVT-8819", timestamp: new Date(Date.now() - 900000).toISOString(), type: "Face Match", severity: "medium", cameraId: "4", tracks: [12], duration: 5, status: "resolved" },
  { id: "EVT-8818", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "Package Left", severity: "high", cameraId: "1", tracks: [88], duration: 45, status: "unresolved" },
  { id: "EVT-8817", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "Vehicle Tracking", severity: "low", cameraId: "3", tracks: [201], duration: 300, status: "resolved" },
];

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<SurveillanceEvent | null>(mockEvents[0]);

  return (
    <div className="flex flex-col gap-6 h-full font-mono">
      {/* Header Info */}
      <div className="flex justify-between items-end border-b border-card-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-primary uppercase m-0 flex items-center gap-3">
            <Database className="w-6 h-6" />
            TACTICAL EVENT LOGS
          </h1>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px] text-primary/70 px-2 py-0.5 border border-primary/20 bg-primary/5 uppercase">UPLINK_STABLE</span>
            <span className="text-[10px] text-primary/70 px-2 py-0.5 border border-primary/20 bg-primary/5 uppercase">ENCRYPTED_DB_SYNC</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="h-8 text-[10px] tracking-widest gap-2">
            <Search className="w-3 h-3" />
            QUERY DATABASE
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[10px] tracking-widest gap-2">
             <ExternalLink className="w-3 h-3" />
             EXPORT_REPORT
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left: Sidebar Filters */}
        <aside className="w-64 flex flex-col gap-4 sticky top-0 overflow-y-auto pr-2 pb-6">
          <div className="p-4 border border-card-border bg-card/40 relative">
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-primary" />
            <div className="absolute top-0 left-0 w-[1px] h-8 bg-primary" />
            
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
            </div>

            <div className="space-y-6">
              <FilterGroup label="Severity Tier">
                <FilterOption label="Critical" count={1} color="text-danger" active />
                <FilterOption label="High" count={8} color="text-warning" />
                <FilterOption label="Medium" count={24} color="text-amber-400" />
                <FilterOption label="Low" count={156} color="text-primary" />
              </FilterGroup>

              <FilterGroup label="Active Nodes">
                <FilterOption label="SEC-01 (Gate)" count={3} active />
                <FilterOption label="SEC-02 (Parking)" count={12} />
                <FilterOption label="SEC-03 (Lobby)" count={0} />
                <FilterOption label="SEC-04 (Roof)" count={1} />
              </FilterGroup>

              <FilterGroup label="Temporal Range">
                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-muted uppercase">From:</span>
                    <input type="date" className="bg-black/60 border border-card-border p-2 text-[10px] text-primary focus:border-primary focus:outline-none" defaultValue="2026-03-30" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-muted uppercase">To:</span>
                    <input type="date" className="bg-black/60 border border-card-border p-2 text-[10px] text-primary focus:border-primary focus:outline-none" defaultValue="2026-03-31" />
                  </div>
                </div>
              </FilterGroup>
            </div>
          </div>
        </aside>

        {/* Middle: Event Table */}
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex-1 border border-card-border bg-card/20 overflow-auto scrollbar-thin scrollbar-thumb-card-border">
            <table className="w-full text-left border-collapse border-spacing-0">
              <thead className="sticky top-0 bg-background/90 backdrop-blur-md z-10">
                <tr className="border-b border-card-border/50">
                  <th className="p-4 text-[10px] text-muted tracking-tighter uppercase font-bold">UID</th>
                  <th className="p-4 text-[10px] text-muted tracking-tighter uppercase font-bold">TIMESTAMP</th>
                  <th className="p-4 text-[10px] text-muted tracking-tighter uppercase font-bold">EVENT TYPE</th>
                  <th className="p-4 text-[10px] text-muted tracking-tighter uppercase font-bold">SEVERITY</th>
                  <th className="p-4 text-[10px] text-muted tracking-tighter uppercase font-bold">NODE</th>
                  <th className="p-4 text-[10px] text-muted tracking-tighter uppercase font-bold">STATUS</th>
                  <th className="p-4 text-[10px] text-muted tracking-tighter uppercase font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/20">
                {mockEvents.map((event) => (
                  <tr 
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={cn(
                      "group cursor-pointer transition-colors",
                      selectedEvent?.id === event.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-primary/5"
                    )}
                  >
                    <td className="p-4 text-[11px] font-bold text-primary/80 group-hover:text-primary">#{event.id}</td>
                    <td className="p-4 text-[10px] text-foreground/70">{new Date(event.timestamp).toLocaleString()}</td>
                    <td className="p-4 text-[11px] font-bold uppercase tracking-widest">{event.type}</td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-0.5 text-[9px] border font-bold uppercase",
                        event.severity === "critical" ? "border-danger text-danger bg-danger/5" :
                        event.severity === "high" ? "border-warning text-warning bg-warning/5" :
                        "border-primary/50 text-primary bg-primary/5"
                      )}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-muted">SEC-0{event.cameraId}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", event.status === "unresolved" ? "bg-danger animate-pulse" : "bg-primary")} />
                        <span className={cn("text-[10px] uppercase", event.status === "unresolved" ? "text-danger" : "text-primary/70")}>
                          {event.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border border-card-border bg-card/20">
            <span className="text-[10px] text-muted uppercase">Displaying 1-5 of 1,248 Detections</span>
            <div className="flex gap-2">
               <Button variant="secondary" size="sm" className="h-8 px-4 text-[10px]" disabled>PREV_INDEX</Button>
               <Button variant="secondary" size="sm" className="h-8 px-4 text-[10px]">NEXT_INDEX</Button>
            </div>
          </div>
        </div>

        {/* Right: Replay Module & Event Details */}
        <div className="w-80 flex flex-col gap-4 h-[calc(100vh-180px)] sticky top-0">
          {/* Replay Module */}
          <div className="relative aspect-video bg-black military-border overflow-hidden group">
            <div className="scanline-overlay z-10 pointer-events-none" />
            <img src="/api/placeholder/400/225" alt="Replay Snippet" className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all" />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center bg-primary/10 hover:bg-primary/20 cursor-pointer">
                <Play className="w-6 h-6 text-primary ml-1" />
              </div>
            </div>
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-danger/80 text-white text-[8px] font-bold uppercase tracking-tighter z-20">
              Replay: EVT_{selectedEvent?.id}
            </div>
            <div className="absolute bottom-2 right-2 text-[8px] text-primary/70 z-20 font-mono">
              CAM_0{selectedEvent?.cameraId} // 30 FPS
            </div>
          </div>

          {/* Details Card */}
          <Card className="flex-1 bg-card/40 overflow-hidden flex flex-col">
            <CardHeader className="py-3 px-4 border-b border-card-border/50 bg-primary/5">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs tracking-widest p-0">EVENT_ANALYSIS</CardTitle>
                <span className="text-[9px] text-muted uppercase">REF_099-X</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
              <DetailRow label="SOURCE_NODE" value={`SECTOR-0${selectedEvent?.cameraId}`} />
              <DetailRow label="EVENT_UID" value={selectedEvent?.id || "N/A"} />
              <DetailRow label="OBJECT_TAGS" value={selectedEvent?.tracks.join(", ") || "NONE"} />
              <DetailRow label="DURATION" value={`${selectedEvent?.duration}s`} />
              
              <div className="pt-4 border-t border-card-border/30 space-y-3">
                <h4 className="text-[10px] text-primary font-bold uppercase tracking-widest">TACTICAL ACTIONS</h4>
                <ActionButton icon={<UserPlus className="w-3 h-3" />} label="ASSIGN AGENT" />
                <ActionButton icon={<CheckCircle className="w-3 h-3" />} label="MARK AS RESOLVED" />
                <ActionButton icon={<AlertTriangle className="w-3 h-3" />} label="ESCALATE TO COMMAND" danger />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const FilterGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h4 className="text-[9px] text-muted uppercase tracking-[0.2em] font-bold border-l-2 border-primary pl-2">{label}</h4>
    <div className="space-y-1">{children}</div>
  </div>
);

const FilterOption = ({ label, count, color = "text-foreground", active }: { label: string; count: number; color?: string; active?: boolean }) => (
  <button className={cn(
    "w-full flex items-center justify-between p-2 text-[10px] transition-colors font-bold uppercase",
    active ? "bg-primary/20 text-primary border border-primary/30" : "hover:bg-primary/5 text-muted"
  )}>
    <span className={cn(active ? "text-primary" : color)}>{label}</span>
    <span className="text-muted opacity-50">({count})</span>
  </button>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[8px] text-muted uppercase tracking-tighter">{label}</span>
    <span className="text-[11px] font-bold tracking-tight text-foreground/90">{value}</span>
  </div>
);

const ActionButton = ({ icon, label, danger }: { icon: React.ReactNode; label: string; danger?: boolean }) => (
  <button className={cn(
    "w-full flex items-center gap-2 p-3 text-[10px] font-bold border transition-all uppercase tracking-widest",
    danger 
      ? "border-danger/30 text-danger hover:bg-danger/10" 
      : "border-card-border text-foreground/80 hover:border-primary hover:text-primary hover:bg-primary/5"
  )}>
    {icon}
    <span>{label}</span>
  </button>
);
