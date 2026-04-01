'use client';

import { useState, useEffect } from 'react';

export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'loading';

export function useCameraPermission() {
  const [status, setStatus] = useState<PermissionStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkPermission() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setStatus('denied');
          setError('Media devices API not available');
          return;
        }

        // Check if permissions API is supported (standard way)
        if (navigator.permissions && (navigator.permissions as any).query) {
          const result = await navigator.permissions.query({ name: 'camera' as any });
          setStatus(result.state);
          result.onchange = () => setStatus(result.state);
        } else {
          // Fallback: assume prompt if not known
          setStatus('prompt');
        }
      } catch (err) {
        console.error('Permission check failed:', err);
        setStatus('prompt');
      }
    }

    checkPermission();
  }, []);

  const requestPermission = async () => {
    setStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // If we got here, permission is granted
      setStatus('granted');
      setError(null);
      
      // Immediately stop the stream (we just wanted the permission)
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err: any) {
      console.error('Camera request failed:', err);
      setStatus('denied');
      setError(err.message || 'Permission denied');
      return false;
    }
  };

  return { status, error, requestPermission };
}
