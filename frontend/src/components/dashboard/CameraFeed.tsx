"use client";

import React, { useState, useEffect } from "react";
import { Maximize2, RefreshCcw, Video, Radio, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface CameraFeedProps {
  cameraId: string;
  cameraName: string;
}

export const CameraFeed = ({ cameraId, cameraName }: CameraFeedProps) => {
  const [isLive, setIsLive] = useState(true);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [streamUrl, setStreamUrl] = useState(
    `${process.env.NEXT_PUBLIC_DETECTION_SERVICE_URL || "http://localhost:5000"}/stream`
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    setError(false);
    // Force reload by appending timestamp
    setStreamUrl(`${process.env.NEXT_PUBLIC_DETECTION_SERVICE_URL || "http://localhost:5000"}/stream?t=${Date.now()}`);
  };

  return (
    <div className="relative w-full aspect-video bg-black military-border overflow-hidden group">
      {/* Scanline texture */}
      <div className="scanline-overlay z-10" />
      <div className="crt-texture z-11 pointer-events-none" />

      {/* Camera Stream */}
      {!error ? (
        <img
          src={streamUrl}
          alt={`Camera ${cameraName}`}
          className="w-full h-full object-cover scan-effect"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-card/20 text-danger gap-4">
          <Radio className="w-12 h-12 animate-pulse" />
          <span className="font-mono text-sm tracking-widest">SIGNAL LOST: CAM_{cameraId}</span>
          <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
            <RefreshCcw className="w-3 h-3" />
            RE-ESTABLISH LINK
          </Button>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isLive ? "bg-primary animate-pulse" : "bg-danger")} />
            <span className="text-xs font-mono font-bold tracking-tighter text-white uppercase bg-black/40 px-2 py-0.5">
              {cameraName} // FEED_0{cameraId}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-primary/80 font-mono">
            <Video className="w-3 h-3" />
            <span>1080P @ 15 FPS</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-[10px] text-white/70 font-mono bg-black/40 px-2 py-0.5">
            <Clock className="w-3 h-3" />
            <span>{currentTime}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-danger font-mono bg-black/40 px-2 py-0.5 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-danger" />
            <span>REC</span>
          </div>
        </div>
      </div>

      {/* Control Overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="secondary" size="icon" className="w-8 h-8 opacity-80 hover:opacity-100">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 border border-primary/10 pointer-events-none z-15" />
    </div>
  );
};
