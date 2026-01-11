'use client';

import { useState, useEffect } from 'react';
import { ScanFace } from 'lucide-react';

interface CameraPermissionGateProps {
  onPermissionGranted: () => void;
}

export function CameraPermissionGate({ onPermissionGranted }: CameraPermissionGateProps) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const requestCameraPermission = async () => {
    setIsRequestingPermission(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 160 },
          height: { ideal: 120 }
        },
        audio: false
      });

      stream.getTracks().forEach(track => track.stop());
      setCookie('camera_permission_granted', 'true', 365);
      setHasPermission(true);
    } catch (e: any) {
      console.error('Camera permission denied:', e);
      setError('Camera access is required for this experience. Please allow camera access and refresh the page.');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  useEffect(() => {
    // For a cleaner UX, we'll always show the permission screen first
    // This prevents the browser's permission dialog from flashing on page load
    // Clear any saved cookie to ensure fresh permission flow each session
    setCookie('camera_permission_granted', '', -1);
  }, []);

  useEffect(() => {
    if (hasPermission) {
      onPermissionGranted();
    }
  }, [hasPermission, onPermissionGranted]);

  if (hasPermission) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 max-w-md mx-auto text-center px-6">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
            <ScanFace className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          3D Viewer Demo
        </h1>

        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          We use head tracking to enhance this experience. It allows the 3D scene to react naturally to your movements. Try tilting your head to see how the perspective shifts. It is designed for a single viewer.
        </p>

        <button
          onClick={requestCameraPermission}
          disabled={isRequestingPermission}
          className="w-full bg-white text-black font-semibold py-4 px-8 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg"
        >
          {isRequestingPermission ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Requesting Access...
            </div>
          ) : (
            'Allow Camera Access'
          )}
        </button>

        <p className="text-sm text-gray-400 mt-6 leading-relaxed">
          Your data is processed locally on your device and is not stored or transmitted anywhere.
        </p>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
