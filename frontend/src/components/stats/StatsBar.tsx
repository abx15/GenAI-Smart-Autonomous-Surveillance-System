'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Camera, Users } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex items-center gap-3 bg-[#0f0f1a] rounded-xl border border-[#1e1e35] px-4 py-3 flex-1">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center`}
        style={{ background: `${color}20` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="font-mono text-xl font-bold text-[#f0f0f5]">{value ?? '—'}</p>
        <p className="text-xs text-[#555577] font-mono">{label}</p>
      </div>
    </div>
  );
}

export default function StatsBar() {
  const { data } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/events/stats').then(r => r.data),
    refetchInterval: 10000,
  });

  return (
    <div className="flex gap-3">
      <StatCard label="TOTAL TODAY" value={data?.total} icon={Shield} color="#4d9fff" />
      <StatCard label="CRITICAL" value={data?.critical} icon={AlertTriangle} color="#ff3b3b" />
      <StatCard label="CAMERAS LIVE" value={data?.cameras} icon={Camera} color="#00ff88" />
      <StatCard label="TRACKED" value={data?.tracked} icon={Users} color="#9b5eff" />
    </div>
  );
}
