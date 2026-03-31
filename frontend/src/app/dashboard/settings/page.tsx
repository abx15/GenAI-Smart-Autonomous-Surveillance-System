"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  Cpu, 
  Database, 
  Bell, 
  Users, 
  Terminal, 
  ShieldAlert, 
  Network, 
  Lock, 
  RefreshCcw,
  Plus,
  Trash2,
  ChevronRight,
  Zap,
  Activity,
  HardDrive
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

const mockUsers = [
  { id: "U-01", name: "S. Varma", role: "COMMANDER", level: "L-4", status: "ONLINE" },
  { id: "U-02", name: "R. Chen", role: "ANALYST", level: "L-2", status: "OFFLINE" },
  { id: "U-03", name: "J. Doe", role: "OPERATOR", level: "L-1", status: "ONLINE" },
];

export default function SettingsPage() {
  const [sensitivity, setSensitivity] = useState(65);
  const [logs, setLogs] = useState<string[]>([
    "[10:44:01] SYSTEM_INITIALIZED // SASS_CORE_v1.0",
    "[10:44:05] KAFKA_BROKER_SYNC: SUCCESS",
    "[10:44:12] MONGODB_CLIENT: CONNECTED_STABLE",
    "[10:44:20] HEARTBEAT_PULSE_IDLE",
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `[${new Date().toLocaleTimeString('en-GB')}] HEARTBEAT_PULSE_${Math.random() > 0.9 ? "ANOMALY_CHECK" : "IDLE"}`;
      setLogs(prev => [...prev.slice(-10), newLog]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col gap-6 h-full font-mono relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-card-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-primary uppercase m-0 flex items-center gap-3">
            <Settings className="w-6 h-6" />
            SYSTEM_TERMINAL_CONFIG
          </h1>
          <div className="flex gap-4 mt-2 font-bold tracking-[0.1em]">
            <span className="text-[10px] text-primary/70 px-2 py-0.5 border border-primary/20 bg-primary/5 uppercase">ENV: PRODUCTION</span>
            <span className="text-[10px] text-primary/70 px-2 py-0.5 border border-primary/20 bg-primary/5 uppercase">STATUS: SECURE_UPLINK</span>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="h-8 text-[10px] tracking-widest border-primary/30 hover:bg-primary/20">
              <RefreshCcw className="w-3 h-3 mr-2" />
              HOT_RELOAD_SYSTEM
           </Button>
           <Button variant="secondary" size="sm" className="h-8 text-[10px] tracking-widest">
              SAVE_VOLATILE_MEMORY
           </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2 scrollbar-thin">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Configuration */}
          <SectionCard icon={<Cpu />} title="HEURISTIC_AI_ENGINE" id="MOD_01">
            <div className="space-y-6">
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted uppercase">Object Detection Sensitivity</span>
                    <span className="text-[11px] font-bold text-primary">{sensitivity}%</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" max="100" 
                   value={sensitivity}
                   onChange={(e) => setSensitivity(parseInt(e.target.value))}
                   className="w-full accent-primary h-1 bg-card-border/50 rounded-none cursor-pointer"
                 />
                 <p className="text-[8px] text-muted-foreground uppercase leading-relaxed">
                   Higher sensitivity increases risk of false positives (ghosting). 
                   Optimal suggested range: 60-75% for urban surveillance.
                 </p>
              </div>

              <div className="flex items-center justify-between p-3 border border-card-border bg-black/20">
                 <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase">Enable GenAI Post-Processing</span>
                 </div>
                 <TacticalSwitch active />
              </div>
            </div>
          </SectionCard>

          {/* Infrastructure Config */}
          <SectionCard icon={<Database />} title="INFRASTRUCTURE_NODES" id="MOD_02">
            <div className="space-y-4">
               <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                     <span className="text-[8px] text-muted uppercase">Broker URL</span>
                     <input type="text" className="w-full bg-black/60 border border-card-border p-2 text-[10px] text-primary focus:border-primary focus:outline-none mt-1" defaultValue="kafka-cluster:9092" />
                  </div>
                  <div>
                     <span className="text-[8px] text-muted uppercase">Partition ID</span>
                     <input type="text" className="w-full bg-black/60 border border-card-border p-2 text-[10px] text-primary focus:border-primary focus:outline-none mt-1" defaultValue="SASS_MAIN_01" />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 border border-card-border bg-black/20 flex flex-col gap-1">
                     <span className="text-[8px] text-muted uppercase">Storage status</span>
                     <div className="flex items-center gap-2">
                        <HardDrive className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary">84.2% [CAPACITY]</span>
                     </div>
                  </div>
                  <div className="p-3 border border-card-border bg-black/20 flex flex-col gap-1">
                     <span className="text-[8px] text-muted uppercase">Uptime Stability</span>
                     <div className="flex items-center gap-2">
                        <Network className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary">99.98% [H_SYNC]</span>
                     </div>
                  </div>
               </div>
            </div>
          </SectionCard>

          {/* Notification Rules */}
          <SectionCard icon={<Bell />} title="ALARM_PROTOCOL_RULES" id="MOD_03">
             <div className="space-y-2">
                <ToggleRow label="Push Critical to CLI" active />
                <ToggleRow label="Auto-Escalate Unresolved" />
                <ToggleRow label="Broadcast to Mobile Nodes" active />
                <ToggleRow label="Audible Command Alerts" active />
             </div>
          </SectionCard>

          {/* Identity Management */}
          <SectionCard icon={<Users />} title="PERSONNEL_PERMISSIONS" id="MOD_04">
             <div className="space-y-3">
                {mockUsers.map(user => (
                   <div key={user.id} className="flex items-center justify-between p-2 border border-card-border/50 bg-card/10 group hover:border-primary/40 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className={cn("w-2 h-2 rounded-full", user.status === "ONLINE" ? "bg-primary animate-pulse" : "bg-muted")} />
                         <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-foreground/90">{user.name}</span>
                            <span className="text-[8px] text-muted uppercase tracking-tighter">{user.role} // {user.level}</span>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-danger hover:bg-danger/10">
                         <Trash2 className="w-3 h-3" />
                      </Button>
                   </div>
                ))}
                <Button variant="outline" className="w-full h-8 text-[9px] border-dashed border-card-border gap-2 hover:bg-primary/5 uppercase tracking-[0.2em]">
                   <Plus className="w-3 h-3" />
                   ADD_PERSONNEL_IDENTIFIER
                </Button>
             </div>
          </SectionCard>
        </div>

        {/* Console Log Subsystem */}
        <div className="mt-auto">
           <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Live_System_Console</span>
           </div>
           <div className="bg-black/80 border border-primary/30 p-4 font-mono h-32 overflow-hidden relative">
              <div className="scanline-overlay pointer-events-none opacity-20" />
              <div className="space-y-1 relative z-10">
                 {logs.map((log, i) => (
                    <div key={i} className="text-[10px] text-primary/80 group">
                       <span className="opacity-40 group-hover:opacity-100 text-[8px] mr-2">&gt;</span>
                       {log}
                    </div>
                 ))}
                 <div ref={logEndRef} />
              </div>
              <div className="absolute top-2 right-4 flex items-center gap-2">
                 <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[8px] text-primary font-bold uppercase tracking-widest">TERMINAL_READY</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const SectionCard = ({ icon, title, id, children }: { icon: React.ReactNode; title: string; id: string; children: React.ReactNode }) => (
  <Card className="bg-card/40 relative overflow-hidden border-card-border p-0">
    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
       {icon}
    </div>
    <CardHeader className="py-3 px-4 border-b border-card-border/50 bg-primary/5">
      <div className="flex justify-between items-center">
        <div className="text-xs tracking-widest p-0 flex items-center gap-3">
          <span className="p-1 border border-primary/40 bg-primary/10">{icon}</span>
          {title}
        </div>
        <span className="text-[9px] text-muted uppercase font-bold">{id}</span>
      </div>
    </CardHeader>
    <CardContent className="p-6">
      {children}
    </CardContent>
  </Card>
);

const TacticalSwitch = ({ active }: { active?: boolean }) => (
  <button className={cn(
    "relative w-8 h-4 transition-all duration-300",
    active ? "bg-primary/40 border border-primary/60 shadow-[0_0_10px_rgba(34,197,94,0.2)]" : "bg-card-border/30 border border-card-border"
  )}>
    <div className={cn(
      "absolute top-[1px] w-[14px] h-[12px] bg-foreground transition-all duration-300",
      active ? "left-[15px]" : "left-[1px]"
    )} />
  </button>
);

const ToggleRow = ({ label, active }: { label: string; active?: boolean }) => (
  <div className="flex items-center justify-between p-3 border-b border-card-border/20 last:border-0 hover:bg-primary/5 transition-colors group">
     <span className={cn("text-[10px] uppercase font-bold tracking-widest transition-colors", active ? "text-foreground" : "text-muted group-hover:text-foreground")}>{label}</span>
     <TacticalSwitch active={active} />
  </div>
);
