'use client';

import { useState, useEffect } from 'react';
import { DioramaSidebar } from '@/components/diorama/DioramaSidebar';
import { DioramaViewer } from '@/components/diorama/DioramaViewer';
import { CameraPermissionGate } from '@/components/shared/CameraPermissionGate';
import { useDioramas } from '@/lib/hooks/useDioramas';
import { Diorama } from '@/types';

export default function BrowsePage() {
  const { dioramas, isLoading } = useDioramas();
  const [currentDiorama, setCurrentDiorama] = useState<Diorama | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Auto-select first diorama when loaded
  useEffect(() => {
    if (!currentDiorama && dioramas.length > 0) {
      setCurrentDiorama(dioramas[0]);
    }
  }, [dioramas, currentDiorama]);

  return (
    <div className="min-h-screen bg-black flex relative">
      {/* Camera permission gate */}
      {!hasPermission && (
        <CameraPermissionGate
          onPermissionGranted={() => setHasPermission(true)}
        />
      )}

      {/* Sidebar - only show when permission granted */}
      {hasPermission && (
        <DioramaSidebar
          dioramas={dioramas}
          currentDioramaId={currentDiorama?.id || null}
          onDioramaSelect={setCurrentDiorama}
          isLoading={isLoading}
        />
      )}

      {/* Main viewer area - only show when permission granted */}
      {hasPermission && <DioramaViewer diorama={currentDiorama} />}
    </div>
  );
}
