'use client';
import { Chip } from '@heroui/react';

const SEVERITY_CONFIG = {
  critical: { color: 'danger', label: 'CRITICAL', border: 'border-l-[#ff3b3b]' },
  high:     { color: 'warning', label: 'HIGH', border: 'border-l-[#ffaa00]' },
  medium:   { color: 'primary', label: 'MED', border: 'border-l-[#4d9fff]' },
  low:      { color: 'default', label: 'LOW', border: 'border-l-[#555577]' },
} as const;

export default function AlertItem({ alert }: { alert: any }) {
  const config = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG];

  return (
    <div className={`px-4 py-3 border-l-2 ${config.border} 
      ${!alert.read ? 'bg-white/[0.02]' : ''}
      ${alert.severity === 'critical' ? 'alert-critical' : ''}
      transition-all hover:bg-white/[0.03]`}>

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#f0f0f5] leading-snug">{alert.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs text-[#555577]">{alert.cameraId}</span>
            <span className="text-[#333355]">·</span>
            <span className="font-mono text-xs text-[#555577]">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
        <Chip size="sm" color={config.color as any} variant="flat" className="shrink-0 font-mono text-xs">
          {config.label}
        </Chip>
      </div>
    </div>
  );
}
