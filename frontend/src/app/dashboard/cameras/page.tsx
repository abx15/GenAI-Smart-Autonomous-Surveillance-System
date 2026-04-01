'use client';
import { useState, useRef, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import { CameraPermissionGate } from '@/components/camera/CameraPermissionGate';

export default function CamerasPage() {
  const [streams, setStreams] = useState<{ [key: string]: MediaStream }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const [selectedCam, setSelectedCam] = useState('CAM-01');

  const cameras = [
    { id: 'CAM-01', name: 'Main Entrance' },
    { id: 'CAM-02', name: 'Parking Lot' },
    { id: 'CAM-03', name: 'Back Door' },
  ];

  const handleGrant = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      const newStreams: { [key: string]: MediaStream } = {};
      cameras.forEach(cam => { newStreams[cam.id] = stream; });
      setStreams(newStreams);
    } catch (err) {
      console.error('Failed to get camera stream:', err);
    }
  };

  useEffect(() => {
    Object.entries(streams).forEach(([id, stream]) => {
      const video = videoRefs.current[id];
      if (video && stream) video.srcObject = stream;
    });
  }, [streams]);

  useEffect(() => {
    return () => {
      Object.values(streams).forEach(stream => stream.getTracks().forEach(t => t.stop()));
    };
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tighter">TACTICAL FEED</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-xs font-mono text-primary uppercase tracking-widest">Live Monitoring Active</span>
        </div>
      </div>

      <CameraPermissionGate onGrant={handleGrant}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {cameras.map(cam => (
            <Card 
              key={cam.id} 
              className={`bg-zinc-950/50 border ${selectedCam === cam.id ? 'border-primary/50 ring-1 ring-primary/20' : 'border-white/5'} backdrop-blur-sm transition-all duration-300`}
            >
              <CardHeader className="flex justify-between items-center px-5 py-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">{cam.id}</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">{cam.name}</h3>
                </div>
                {selectedCam === cam.id && (
                  <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-bold text-primary uppercase">
                    Primary
                  </div>
                )}
              </CardHeader>
              <CardBody className="p-4 pt-0">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/5 group">
                  <video
                    ref={el => { if (el) videoRefs.current[cam.id] = el; }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-[10px] border-transparent group-hover:border-white/5 transition-all" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-white/80">REC: 1080P/15FPS</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    fullWidth
                    color={selectedCam === cam.id ? 'primary' : 'default'}
                    variant={selectedCam === cam.id ? 'solid' : 'flat'}
                    onPress={() => setSelectedCam(cam.id)}
                    className="font-bold text-[10px] uppercase tracking-widest h-10"
                  >
                    Set Focus
                  </Button>
                  <Button 
                    size="sm" 
                    variant="flat" 
                    className="font-mono text-[10px] uppercase border-[#1e1e35] text-zinc-500 h-10 min-w-14"
                  >
                    PTZ
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </CameraPermissionGate>
    </div>
  );
}
