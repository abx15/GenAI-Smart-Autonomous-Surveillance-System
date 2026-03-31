'use client';
import { useState } from 'react';
import { Chip, Button } from '@heroui/react';
import { Maximize2, RefreshCw } from 'lucide-react';

export default function CameraFeed({ cameraId = 'CAM-01' }) {
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const streamUrl = process.env.NEXT_PUBLIC_STREAM_URL;

  return (
    <div className={`relative rounded-xl overflow-hidden bg-[#0f0f1a] border border-[#1e1e35]
      ${fullscreen ? 'fixed inset-4 z-50' : 'aspect-video'}`}>

      {/* Scanline overlay */}
      <div className="scanline absolute inset-0 z-10 pointer-events-none" />

      {/* Camera feed */}
      {!error ? (
        <img
          src={streamUrl}
          alt="Live Camera Feed"
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-[#555577]">
          <div className="text-4xl">📷</div>
          <p className="font-mono text-sm">Camera Offline</p>
          <Button size="sm" variant="bordered" onPress={() => setError(false)}
            startContent={<RefreshCw size={14} />}
            className="border-[#1e1e35] text-[#8888aa]">
            Retry
          </Button>
        </div>
      )}

      {/* Top bar overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur rounded-lg px-3 py-1.5">
          <div className="live-dot" />
          <span className="font-mono text-xs text-[#00ff88]">LIVE</span>
          <span className="font-mono text-xs text-[#8888aa] ml-1">{cameraId}</span>
        </div>
        <button onClick={() => setFullscreen(!fullscreen)}
          className="bg-black/60 backdrop-blur rounded-lg p-1.5 text-[#8888aa] hover:text-white transition-colors z-20">
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Bottom timestamp */}
      <div className="absolute bottom-3 right-3 z-20 bg-black/60 backdrop-blur rounded px-2 py-1">
        <span className="font-mono text-xs text-[#8888aa]">
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
