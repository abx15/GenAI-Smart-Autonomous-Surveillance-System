'use client';

import { useCameraPermission } from '@/hooks/useCameraPermission';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import { Camera, ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onGrant?: () => void;
}

export function CameraPermissionGate({ children, onGrant }: Props) {
  const { status, error, requestPermission } = useCameraPermission();

  const handleRequest = async () => {
    const success = await requestPermission();
    if (success && onGrant) onGrant();
  };

  if (status === 'granted') {
    return <>{children}</>;
  }

  return (
    <Card className="max-w-2xl mx-auto mt-10 border-none bg-background/60 backdrop-blur-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
      <CardHeader className="flex flex-col gap-2 pb-0 pt-8 px-8 items-center">
        <div className="p-4 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-pulse">
          <Camera className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Camera Access Required</h2>
        <p className="text-default-500 text-center max-w-md">
          SASS needs camera access for real-time person detection and behavior analysis.
          Select your local webcam or connect to a remote feed.
        </p>
      </CardHeader>
      
      <CardBody className="px-8 pb-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary-400 font-medium">
              <ShieldCheck className="w-5 h-5" />
              <span>Permission Security</span>
            </div>
            <p className="text-xs text-default-400 leading-relaxed">
              We only use your camera stream locally for processing. No video is ever
              uploaded to the cloud. Privacy is our top priority.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-warning-400 font-medium">
              <HelpCircle className="w-5 h-5" />
              <span>Two Camera Modes</span>
            </div>
            <p className="text-xs text-default-400 leading-relaxed">
              Choose "Local" to use your webcam, or "Remote" if you have a detection
              service running with an IP camera.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-danger/10 border border-danger/20 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-danger mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-danger">Access Denied</p>
              <p className="text-xs text-danger/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button 
            color="primary" 
            size="lg" 
            className="w-full font-bold h-14 text-md shadow-lg shadow-primary/20"
            onClick={handleRequest}
            isLoading={status === 'loading'}
          >
            {status === 'loading' ? 'Checking Permissions...' : 'Allow Camera Access'}
          </Button>
          
          <Button 
            variant="flat" 
            className="w-full h-14 bg-white/5 hover:bg-white/10"
            onClick={() => window.open('https://support.google.com/chrome/answer/2693767', '_blank')}
          >
            Help with Permissions
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
