import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BarChart3, 
  Video, 
  Bell, 
  FileText, 
  Settings, 
  LogOut,
  Maximize2,
  Terminal
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/auth";

const menuItems = [
  { icon: BarChart3, label: "DASHBOARD", href: "/dashboard" },
  { icon: Video, label: "CAMERAS", href: "/dashboard/cameras" },
  { icon: Bell, label: "ALERTS", href: "/dashboard/alerts" },
  { icon: FileText, label: "REPORTS", href: "/dashboard/reports" },
  { icon: Terminal, label: "SYSTEM LOGS", href: "/dashboard/logs" },
  { icon: Settings, label: "SETTINGS", href: "/dashboard/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  return (
    <aside className="w-64 border-r border-card-border bg-background flex flex-col h-full sticky left-0 top-16 z-40 overflow-y-auto">
      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 text-sm font-mono tracking-widest transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary border-r-2 border-primary" 
                      : "text-muted hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System Health */}
      <div className="p-6 border-t border-card-border">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted">
            <span>NETWORK</span>
            <span className="text-primary">SECURE</span>
          </div>
          <div className="h-1 bg-card-border overflow-hidden">
            <div className="h-full bg-primary w-3/4 animate-pulse" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-muted">
            <span>STORAGE</span>
            <span className="text-warning">78%</span>
          </div>
          <div className="h-1 bg-card-border overflow-hidden">
            <div className="h-full bg-warning w-[78%]" />
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full mt-6 flex items-center justify-center gap-2 py-3 border border-card-border text-muted hover:text-danger hover:border-danger transition-colors font-mono text-sm tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          <span>TERMINATE</span>
        </button>
      </div>
    </aside>
  );
};
