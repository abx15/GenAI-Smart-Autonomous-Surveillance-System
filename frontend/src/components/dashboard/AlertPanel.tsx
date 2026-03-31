"use client";

import React, { useState } from "react";
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Clock,
  ExternalLink
} from "lucide-react";
import { useAlertStore } from "../../store/alertStore";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn, formatRelativeTime } from "../../lib/utils";
import { Alert } from "../../types";

export const AlertPanel = () => {
  const { alerts, unreadCount, markRead, markAllRead } = useAlertStore();
  const [isSoundOn, setIsSoundOn] = useState(true);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-card-border/50 bg-card/50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-danger text-[8px] items-center justify-center text-white font-bold leading-none">
                  {unreadCount}
                </span>
              </span>
            )}
          </div>
          <CardTitle className="text-sm font-mono tracking-widest p-0">ALERT MONITOR</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="icon" 
            className="w-7 h-7"
            onClick={() => setIsSoundOn(!isSoundOn)}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-7 text-[10px] tracking-widest px-2"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            ACKNOWLEDGE ALL
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-card-border">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted font-mono py-12">
            <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
            <span className="text-xs uppercase tracking-widest">No Alerts Detected</span>
          </div>
        ) : (
          <div className="divide-y divide-card-border/30">
            {alerts.map((alert) => (
              <AlertItem 
                key={alert.id} 
                alert={alert} 
                onAcknowledge={() => markRead(alert.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AlertItem = ({ alert, onAcknowledge }: { alert: Alert; onAcknowledge: () => void }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return "border-danger text-danger bg-danger/5";
      case "high": return "border-warning text-warning bg-warning/5";
      case "medium": return "border-amber-400 text-amber-400 bg-amber-400/5";
      default: return "border-primary/50 text-primary bg-primary/5";
    }
  };

  const Icon = alert.severity === "critical" ? AlertCircle : AlertTriangle;

  return (
    <div className={cn(
      "p-3 transition-colors border-l-2",
      getSeverityStyle(alert.severity),
      alert.acknowledged ? "opacity-60 border-transparent bg-transparent" : "opacity-100"
    )}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", alert.severity === "critical" && "animate-pulse")} />
          <span className="font-mono text-[10px] tracking-widest font-bold uppercase">
            {alert.type}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono opacity-70">
          <Clock className="w-3 h-3" />
          <span>{formatRelativeTime(alert.timestamp)}</span>
        </div>
      </div>
      
      <p className="text-xs font-mono mb-2 line-clamp-2 text-foreground/90">
        {alert.message}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[9px] font-mono text-muted">
            <span className="uppercase">Camera:</span>
            <span className="text-foreground">CAM_{alert.cameraId}</span>
          </div>
        </div>
        {!alert.acknowledged ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 py-0 px-2 text-[9px] tracking-widest hover:bg-white/10"
            onClick={onAcknowledge}
          >
            ACKNOWLEDGE
          </Button>
        ) : (
          <span className="text-[9px] font-mono text-primary/50 flex items-center gap-1 uppercase">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>
    </div>
  );
};
