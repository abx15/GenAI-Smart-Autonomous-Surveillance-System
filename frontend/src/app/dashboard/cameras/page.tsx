'use client';
import { useState, useRef, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';

export default function CamerasPage() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [streams, setStreams] = useState<{ [key: string]: MediaStream }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const [selectedCam, setSelectedCam] = useState('CAM-01');

  const cameras = [
    { id: 'CAM-01', name: 'Main Entrance' },
    { id: 'CAM-02', name: 'Parking Lot' },
    { id: 'CAM-03', name: 'Back Door' },
  ];

  async function requestCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setPermissionGranted(true);
      setPermissionError('');
      // Use the same stream for all cameras for demo
      cameras.forEach(cam => {
        setStreams(prev => ({ ...prev, [cam.id]: stream }));
      });
    } catch (err: any) {
      setPermissionError(err.message || 'Camera permission denied');
      setPermissionGranted(false);
    }
  }

  useEffect(() => {
    // Attach streams to video elements
    Object.entries(streams).forEach(([id, stream]) => {
      const video = videoRefs.current[id];
      if (video && stream) {
        video.srcObject = stream;
      }
    });
  }, [streams]);

  useEffect(() => {
    // Cleanup streams on unmount
    return () => {
      Object.values(streams).forEach(stream => stream.getTracks().forEach(t => t.stop()));
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-[#f0f0f5] font-mono">CAMERA MONITORING</h1>

      {!permissionGranted ? (
        <Card className="bg-[#0f0f1a] border border-[#1e1e35] max-w-md mx-auto">
          <CardBody className="p-6 text-center space-y-4">
            <div className="text-6xl">📷</div>
            <h2 className="text-lg font-mono text-[#f0f0f5]">Camera Permission Required</h2>
            <p className="text-sm text-[#555577] font-mono">
              Access to camera feeds requires your permission. This is required for live surveillance monitoring.
            </p>
            {permissionError && <p className="text-sm text-[#ff3b3b] font-mono">{permissionError}</p>}
            <Button onPress={requestCameraPermission} className="bg-[#4d9fff] text-white">
              Grant Camera Access
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {cameras.map(cam => (
            <Card key={cam.id} className="bg-[#0f0f1a] border border-[#1e1e35]">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-mono text-sm text-[#f0f0f5]">{cam.name}</h3>
                  <span className="font-mono text-xs text-[#555577]">{cam.id}</span>
                </div>
              </CardHeader>
              <CardBody className="p-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={el => { if (el) videoRefs.current[cam.id] = el; }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {selectedCam === cam.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-[#4d9fff] rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    color={selectedCam === cam.id ? 'primary' : 'default'}
                    variant="flat"
                    onPress={() => setSelectedCam(cam.id)}
                    className="font-mono text-xs"
                  >
                    {selectedCam === cam.id ? 'Selected' : 'Select'}
                  </Button>
                  <Button size="sm" variant="bordered" className="font-mono text-xs border-[#1e1e35] text-[#555577]">
                    PTZ
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
