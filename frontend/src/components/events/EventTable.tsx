'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function EventTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.get('/events?limit=10').then(r => r.data),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="bg-[#0f0f1a] rounded-xl border border-[#1e1e35] p-4">
        <div className="flex items-center justify-center h-32 text-[#555577]">
          Loading events...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f1a] rounded-xl border border-[#1e1e35] p-4">
      <h3 className="text-sm font-semibold text-[#f0f0f5] mb-3">RECENT EVENTS</h3>
      <div className="space-y-2">
        {data?.data?.slice(0, 5).map((event: any) => (
          <div key={event.eventId} className="flex items-center justify-between p-2 bg-[#161625] rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                event.severity === 'critical' ? 'bg-[#ff3b3b]' :
                event.severity === 'high' ? 'bg-[#ffaa00]' :
                event.severity === 'medium' ? 'bg-[#4d9fff]' : 'bg-[#555577]'
              }`} />
              <span className="text-sm text-[#f0f0f5] font-mono">{event.eventId}</span>
              <span className="text-xs text-[#8888aa]">{event.cameraId}</span>
            </div>
            <span className="text-xs text-[#555577] font-mono">
              {new Date(event.startTime).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
