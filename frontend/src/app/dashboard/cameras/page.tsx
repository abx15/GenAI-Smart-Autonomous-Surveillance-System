"use client";

import React, { useState } from "react";
import { 
  Video, 
  Settings, 
  Maximize2, 
  Shield, 
  Radio, 
  Zap,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Target,
  CircleStop,
  Camera
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

const cameras = [
  { id: "SEC-01", name: "Main Perimeter", status: "RECORDING", fps: 30, resolution: "1920x1080", bitrate: "4.2 Mbps" },
  { id: "SEC-02", name: "Back Entrance", status: "ACTIVE", fps: 24, resolution: "1280x720", bitrate: "2.1 Mbps" },
  { id: "SEC-03", name: "Lobby East", status: "ACTIVE", fps: 30, resolution: "1920x1080", bitrate: "3.8 Mbps" },
  { id: "SEC-04", name: "Roof Access", status: "RECORDING", fps: 15, resolution: "1280x720", bitrate: "1.2 Mbps" },
  { id: "SEC-05", name: "North Wing", status: "ACTIVE", fps: 30, resolution: "1920x1080", bitrate: "4.0 Mbps" },
];

export default function CamerasPage() {
  const [activeCam, setActiveCam] = useState(cameras[0]);

  return (
    <div className="flex flex-col gap-6 h-full font-mono relative overflow-hidden">
      {/* HUD Header */}
      <div className="flex justify-between items-end border-b border-card-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-primary uppercase m-0 flex items-center gap-3">
            <Video className="w-6 h-6" />
            CAMERA_MONITORING_GRID
          </h1>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px] text-primary/70 px-2 py-0.5 border border-primary/20 bg-primary/5 uppercase">MULTIVIEW_ACTIVE</span>
            <span className="text-[10px] text-primary/70 px-2 py-0.5 border border-primary/20 bg-primary/5 uppercase tracking-[0.2em]">NODES: 05/32</span>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm" className="h-8 text-[10px] tracking-widest gap-2">
              <Shield className="w-3 h-3" />
              ARM_ALL_SENSORS
           </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Main Feed Section (Large Left) */}
        <div className="flex-[2] flex flex-col gap-4">
          <div className="relative flex-1 bg-black military-border overflow-hidden group">
            <div className="scanline-overlay z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10 pointer-events-none" />
            
            {/* Feed ID Overlay */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-danger animate-pulse" />
                  <span className="text-xs font-bold text-white tracking-[0.2em] uppercase">{activeCam.status} // {activeCam.id}</span>
               </div>
               <span className="text-[10px] text-primary/80 font-bold uppercase">{activeCam.name}</span>
            </div>

            <div className="absolute top-4 right-4 z-20 text-[10px] text-primary/70 text-right font-bold uppercase">
               {activeCam.resolution}<br />
               {activeCam.fps} FPS<br />
               {activeCam.bitrate}
            </div>

            {/* Simulated Main Feed */}
            <div className="w-full h-full flex items-center justify-center opacity-40 grayscale">
               <Camera className="w-24 h-24 text-primary/20" />
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[8px] text-primary/40 uppercase mb-2 tracking-[0.5em]">BUFFERING_ENCRYPTED_STREAM</div>
                  <div className="w-48 h-[1px] bg-primary/10 relative overflow-hidden">
                     <div className="absolute inset-0 bg-primary/40 -translate-x-full animate-[progress_2s_infinite]" />
                  </div>
               </div>
            </div>

            {/* Corner HUD Markers */}
            <div className="absolute bottom-4 left-4 z-20 text-[10px] text-primary/60 border-l border-b border-primary/40 pl-2 pb-1 uppercase">
               34.0522° N, 118.2437° W
            </div>
            <div className="absolute bottom-4 right-4 z-20">
               <Button variant="outline" size="sm" className="h-7 text-[9px] tracking-widest border-primary/30 hover:bg-primary/20">
                  <Maximize2 className="w-3 h-3 mr-2" />
                  FULL_HD_OVERRIDE
               </Button>
            </div>
          </div>

          {/* PTZ / Control Panel */}
          <Card className="bg-card/20 border-card-border h-48">
            <CardHeader className="py-2 px-4 border-b border-card-border/50 bg-primary/5">
               <CardTitle className="text-[10px] tracking-widest uppercase">NODE_CONTROL_INPUT [PTZ]</CardTitle>
            </CardHeader>
            <CardContent className="h-full p-4 flex gap-8 items-center justify-center">
               {/* D-PAD */}
               <div className="relative w-32 h-32 border border-card-border/50 flex items-center justify-center">
                  <ControlButton icon={<ChevronUp />} className="absolute top-0" />
                  <ControlButton icon={<ChevronDown />} className="absolute bottom-0" />
                  <ControlButton icon={<ChevronLeft />} className="absolute left-0" />
                  <ControlButton icon={<ChevronRight />} className="absolute right-0" />
                  <div className="w-10 h-10 border border-primary/40 bg-primary/5 flex items-center justify-center text-primary">
                     <Target className="w-4 h-4 animate-pulse" />
                  </div>
               </div>

               {/* Zoom/Focus */}
               <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                     <ControlButton icon={<ZoomIn />} label="IN" />
                     <ControlButton icon={<ZoomOut />} label="OUT" />
                  </div>
                  <Button variant="outline" className="text-[9px] border-danger/30 text-danger hover:bg-danger/10 truncate tracking-widest">
                     <CircleStop className="w-3 h-3 mr-2" />
                     KILL_FEED
                  </Button>
               </div>

               <div className="flex-1 border-l border-card-border/30 pl-8 space-y-4">
                  <div className="space-y-1">
                     <span className="text-[8px] text-muted uppercase">Sensor Sensitivity</span>
                     <div className="h-1 bg-card/40 relative w-full border border-card-border/30">
                        <div className="absolute inset-0 bg-primary/40 w-[65%]" />
                     </div>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-2 border border-card-border">
                     <div className="flex items-center gap-2">
                        <Radio className="w-3 h-3 text-primary animate-pulse" />
                        <span className="text-[9px] text-primary/80 uppercase">AI Tracking Mode</span>
                     </div>
                     <span className="text-[9px] text-primary font-bold">OPTIMIZED</span>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Grid (Right) */}
        <aside className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 pb-6 scrollbar-thin scrollbar-thumb-card-border">
          <div className="flex items-center justify-between mb-2">
             <span className="text-[10px] text-muted uppercase font-bold tracking-widest">All Nodes ({cameras.length})</span>
             <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="w-3 h-3" />
             </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {cameras.map((cam) => (
              <div 
                key={cam.id}
                onClick={() => setActiveCam(cam)}
                className={cn(
                  "relative aspect-video bg-black/40 military-border cursor-pointer group transition-all",
                  activeCam.id === cam.id ? "border-primary bg-primary/5" : "hover:bg-primary/5"
                )}
              >
                <div className="scanline-overlay pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 grayscale">
                   <Video className="w-8 h-8 text-primary" />
                </div>
                
                {/* Overlay Text */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-0.5">
                   <span className={cn(
                     "text-[8px] font-bold px-1 py-0.2 uppercase border",
                     activeCam.id === cam.id ? "border-primary text-primary" : "border-muted text-muted"
                   )}>{cam.id}</span>
                   <span className="text-[8px] text-white/50 uppercase truncate max-w-[120px]">{cam.name}</span>
                </div>

                <div className="absolute bottom-2 right-2 text-[8px] text-primary/60 font-bold">
                   {cam.fps} FPS
                </div>

                {activeCam.id === cam.id && (
                  <div className="absolute top-2 right-2 flex gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Add Node Placeholder */}
            <button className="aspect-video border border-dashed border-card-border/60 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all group">
               <Zap className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
               <span className="text-[9px] text-muted uppercase tracking-widest group-hover:text-primary">Link New Node</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const ControlButton = ({ icon, label, className, onClick }: { icon: React.ReactNode; label?: string; className?: string; onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
       "p-2 border border-card-border/50 bg-black/20 text-muted hover:border-primary hover:text-primary hover:bg-primary/10 transition-all active:scale-95 flex items-center justify-center min-w-[32px] min-h-[32px]",
       className
    )}
  >
    {icon}
    {label && <span className="text-[8px] ml-2 font-bold">{label}</span>}
  </button>
);
