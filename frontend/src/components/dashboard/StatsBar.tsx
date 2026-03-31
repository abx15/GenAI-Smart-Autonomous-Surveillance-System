"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  AlertCircle, 
  Video, 
  UserPlus, 
  TrendingUp, 
  Cpu,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

interface StatItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  status?: "normal" | "danger" | "warning";
}

export const StatsBar = () => {
  const [stats, setStats] = useState({
    totalToday: 124,
    critical: 3,
    activeCameras: 4,
    personsTracked: 12
  });

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        personsTracked: prev.personsTracked + (Math.random() > 0.7 ? 1 : Math.random() > 0.8 ? -1 : 0),
        totalToday: prev.totalToday + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      <StatCard 
        label="TOTAL TODAY" 
        value={stats.totalToday} 
        icon={<TrendingUp className="w-4 h-4" />} 
        status="normal"
        trend="+12% VS LAST SHIFT"
      />
      <StatCard 
        label="CRITICAL EVENTS" 
        value={stats.critical} 
        icon={<AlertCircle className="w-4 h-4" />} 
        status="danger"
        trend="HIGHER THAN AVG"
      />
      <StatCard 
        label="ACTIVE CAMERAS" 
        value={stats.activeCameras} 
        icon={<Video className="w-4 h-4" />} 
        status="normal"
        trend="SYSTEM HEALTH: 100%"
      />
      <StatCard 
        label="PERSONS TRACKED" 
        value={stats.personsTracked} 
        icon={<UserPlus className="w-4 h-4" />} 
        status={stats.personsTracked > 15 ? "warning" : "normal"}
        trend="LIVE MONITORING"
      />
    </div>
  );
};

const StatCard = ({ label, value, icon, trend, status = "normal" }: StatItemProps) => {
  return (
    <Card className="p-4 border-l-4 border-l-primary relative overflow-hidden group">
      {/* Background Matrix-like glow */}
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 blur-3xl transition-opacity opacity-20 group-hover:opacity-40",
        status === "danger" ? "bg-danger" : status === "warning" ? "bg-warning" : "bg-primary"
      )} />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5",
            status === "danger" ? "text-danger" : status === "warning" ? "text-warning" : "text-primary"
          )}>
            {icon}
          </div>
          <span className="text-[10px] font-mono text-muted tracking-widest uppercase">{label}</span>
        </div>
        <Zap className="w-3 h-3 text-card-border" />
      </div>

      <div className="flex items-baseline gap-2">
        <motion.span 
          key={value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-3xl font-mono font-bold font-mono tracking-tighter",
            status === "danger" ? "text-danger" : status === "warning" ? "text-warning" : "text-primary text-glow"
          )}
        >
          {value.toString().padStart(3, '0')}
        </motion.span>
        {trend && (
          <span className="text-[9px] font-mono text-muted uppercase tracking-tighter italic">
            {trend}
          </span>
        )}
      </div>

      {/* Decorative ID */}
      <div className="absolute top-2 right-2 text-[8px] font-mono text-card-border uppercase">
        REF_{label.split(" ")[0]}-09
      </div>
    </Card>
  );
};
