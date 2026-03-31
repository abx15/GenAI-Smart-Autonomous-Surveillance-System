import React from "react";
import { useRouter } from "next/navigation";
import { User, Shield, Radio, Activity, Cpu } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/auth";

export const Header = () => {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const userRole = user?.role?.toUpperCase() || "SYSTEM ADMIN";

  return (
    <header className="h-16 border-b border-card-border bg-background flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Tactical Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary flex items-center justify-center">
          <Shield className="text-background w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-mono tracking-[0.2em] m-0 leading-none">
            SASS - SYSTEM
          </h1>
          <span className="text-[10px] text-primary/70 font-mono">
            SECURE ACCESS: v1.0.4.52
          </span>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="hidden md:flex items-center gap-6">
        <StatusItem icon={<Activity className="w-4 h-4" />} label="SYSTEM" value="ONLINE" active />
        <StatusItem icon={<Radio className="w-4 h-4" />} label="CAMERAS" value="4 ACTIVE" active />
        <StatusItem icon={<Cpu className="w-4 h-4" />} label="KAFKA" value="CONNECTED" active />
      </div>

      {/* User Session */}
      <div className="flex items-center gap-4 pl-6 border-l border-card-border/50">
        <div className="text-right">
          <div className="text-xs font-mono text-primary uppercase font-bold">{userRole}</div>
          <div className="text-[10px] text-muted uppercase tracking-widest leading-none">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : 'Session: SEC-A1'
            }
          </div>
        </div>
        <div className="w-10 h-10 border border-primary/50 flex items-center justify-center bg-primary/5">
          <User className="text-primary w-6 h-6" />
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-mono text-danger hover:text-danger/80 transition-colors uppercase tracking-wider"
        >
          LOGOUT
        </button>
      </div>
    </header>
  );
};

const StatusItem = ({ 
  icon, 
  label, 
  value, 
  active 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  active?: boolean 
}) => (
  <div className="flex items-center gap-2 font-mono">
    <div className={cn("text-muted", active && "text-primary")}>{icon}</div>
    <div className="flex flex-col">
      <span className="text-[9px] text-muted leading-tight">{label}</span>
      <span className={cn("text-[11px] leading-tight", active ? "text-primary" : "text-danger")}>
        {value}
      </span>
    </div>
  </div>
);
