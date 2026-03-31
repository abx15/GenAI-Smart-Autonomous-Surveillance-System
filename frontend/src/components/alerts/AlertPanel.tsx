'use client';
import { useEffect, useRef } from 'react';
import { Button, Badge } from '@heroui/react';
import { useAlertStore } from '@/store/alertStore';
import { getSocket } from '@/lib/socket';
import AlertItem from './AlertItem';

export default function AlertPanel() {
  const { alerts, unreadCount, addAlert, markAllRead } = useAlertStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const socket = getSocket();
    socket.on('alert', (alert) => {
      addAlert(alert);
      // Play beep for critical
      if (alert.severity === 'critical') {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 150);
      }
    });

    return () => { socket.off('alert'); };
  }, [addAlert]);

  return (
    <div className="flex flex-col h-full bg-[#0f0f1a] rounded-xl border border-[#1e1e35]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e35]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#f0f0f5]">ALERTS</span>
          {unreadCount > 0 && (
            <Badge content={unreadCount} color="danger" size="sm">
              <div />
            </Badge>
          )}
        </div>
        <Button size="sm" variant="light" onPress={markAllRead}
          className="text-xs text-[#8888aa] hover:text-white">
          Mark all read
        </Button>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e1e35]">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#555577] text-sm font-mono">
            No alerts yet
          </div>
        ) : (
          alerts.map(alert => <AlertItem key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
}
