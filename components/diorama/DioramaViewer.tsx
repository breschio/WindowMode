'use client';

import { useState, useEffect } from 'react';
import { Diorama, DepthLayer } from '@/types';
import { VoxelPlayer } from '@/components/shared/VoxelPlayer';
import { GLBPlayer } from '@/components/shared/GLBPlayer';
import { GridOverlay } from '@/components/shared/GridOverlay';
import { useCameraTracking } from '@/lib/hooks/useCameraTracking';
import { Loader2, Grid3x3 } from 'lucide-react';

interface DioramaViewerProps {
  diorama: Diorama | null;
}

function useIsPortrait() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  return isPortrait;
}

export function DioramaViewer({ diorama }: DioramaViewerProps) {
  const isPortrait = useIsPortrait();
  const { eyePosition, numFramesFaceHidden, videoRef } = useCameraTracking(isPortrait);
  const [showGrid, setShowGrid] = useState(true); // Enable grid by default

  // Group objects by depth layer
  const objectsByLayer = {
    [DepthLayer.BACKGROUND]: diorama?.objects?.filter(obj => obj.depthLayer === DepthLayer.BACKGROUND) || [],
    [DepthLayer.MIDGROUND]: diorama?.objects?.filter(obj => obj.depthLayer === DepthLayer.MIDGROUND) || [],
    [DepthLayer.FOREGROUND]: diorama?.objects?.filter(obj => obj.depthLayer === DepthLayer.FOREGROUND) || []
  };

  // Check if WebGPU is supported
  const isWebGPUSupported = typeof navigator !== 'undefined' && (navigator as any).gpu != null;

  if (!diorama) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">
            Select a diorama from the sidebar to view it
          </p>
        </div>
      </div>
    );
  }

  // Check if we're using GLB files (not voxelized yet)
  const isGLB = diorama.objects?.[0]?.vvUrl?.endsWith('.glb');

  if (!isWebGPUSupported) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h2 className="text-white text-2xl font-bold mb-4">WebGPU Not Supported</h2>
          <p className="text-gray-400">
            Your browser doesn't support WebGPU, which is required for 3D rendering.
            Please enable WebGPU in your browser settings or use a supported browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center relative">
      {/* Hidden video element for camera tracking */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
      />

      {/* Main viewer container */}
      <div
        className={`relative bg-black rounded-lg overflow-hidden ${
          isPortrait ? 'aspect-[9/16]' : 'aspect-[16/9]'
        }`}
        style={{ width: '100%', height: '100%', maxWidth: '100vw', maxHeight: '100vh' }}
      >
        {diorama.objects && diorama.objects.length > 0 ? (
          <div className="relative w-full h-full">
            {/* Layer rendering: Background, Midground, Foreground */}
            {objectsByLayer[DepthLayer.BACKGROUND].map((obj, index) => {
              if (isGLB) {
                return (
                  <GLBPlayer
                    key={`bg-${obj.id}`}
                    src={obj.vvUrl}
                    eyePosition={eyePosition}
                    depthLayer={DepthLayer.BACKGROUND}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 1 + index
                    }}
                  />
                );
              }
              return (
                <VoxelPlayer
                  key={`bg-${obj.id}`}
                  src={obj.vvUrl}
                  eyePosition={eyePosition}
                  boundingBox={showGrid ? 'show' : 'hide'}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1 + index
                  }}
                />
              );
            })}

            {objectsByLayer[DepthLayer.MIDGROUND].map((obj, index) => {
              if (isGLB) {
                return (
                  <GLBPlayer
                    key={`mid-${obj.id}`}
                    src={obj.vvUrl}
                    eyePosition={eyePosition}
                    depthLayer={DepthLayer.MIDGROUND}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 10 + index
                    }}
                  />
                );
              }
              return (
                <VoxelPlayer
                  key={`mid-${obj.id}`}
                  src={obj.vvUrl}
                  eyePosition={eyePosition}
                  boundingBox={showGrid ? 'show' : 'hide'}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 10 + index
                  }}
                />
              );
            })}

            {objectsByLayer[DepthLayer.FOREGROUND].map((obj, index) => {
              if (isGLB) {
                return (
                  <GLBPlayer
                    key={`fg-${obj.id}`}
                    src={obj.vvUrl}
                    eyePosition={eyePosition}
                    depthLayer={DepthLayer.FOREGROUND}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 20 + index
                    }}
                  />
                );
              }
              return (
                <VoxelPlayer
                  key={`fg-${obj.id}`}
                  src={obj.vvUrl}
                  eyePosition={eyePosition}
                  boundingBox={showGrid ? 'show' : 'hide'}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 20 + index
                  }}
                />
              );
            })}

            {/* Debug Grid Overlay - only for GLB files */}
            {showGrid && isGLB && (
              <GridOverlay
                eyePosition={eyePosition}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 50
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <p className="text-gray-500">
                This diorama is empty
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Add objects in Create mode
              </p>
            </div>
          </div>
        )}

        {/* Face hidden warning overlay */}
        {numFramesFaceHidden > 3 && (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                borderRadius: 'inherit',
                background: `
                  linear-gradient(to bottom, rgba(255, 100, 103, 0.2) 0%, transparent 100%) top,
                  linear-gradient(to top,    rgba(255, 100, 103, 0.2) 0%, transparent 100%) bottom,
                  linear-gradient(to right,  rgba(255, 100, 103, 0.2) 0%, transparent 100%) left,
                  linear-gradient(to left,   rgba(255, 100, 103, 0.2) 0%, transparent 100%) right
                `,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `100% 20%, 100% 20%, 20% 100%, 20% 100%`,
                transition: 'opacity 0.3s',
                zIndex: 100
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '1.5rem 3rem',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                border: '2px solid rgba(112, 112, 112, 0.5)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 700,
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 101
              }}
            >
              CAN'T FIND USER
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '1.2rem',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                Please center your face in the camera frame
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info tooltip and Grid toggle */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        {/* Info tooltip */}
        <div className="relative group">
          <div className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center cursor-help transition-colors duration-200 backdrop-blur-sm border border-white/20">
            <span className="text-lg font-bold italic">i</span>
          </div>

          <div className="absolute left-10 top-0 w-80 bg-black/90 text-white p-4 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none backdrop-blur-sm border border-white/20 shadow-lg">
            <div className="font-semibold mb-2">{diorama.title}</div>
            <div className="text-gray-200 leading-relaxed">
              {diorama.description || 'Move your head to experience the 3D depth effect.'}
            </div>
            <div className="text-gray-400 text-xs mt-2">
              Objects: {diorama.objects?.length || 0}
            </div>
          </div>
        </div>

        {/* Grid toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm border ${
            showGrid
              ? 'bg-blue-500/80 hover:bg-blue-600/80 text-white border-blue-400/40'
              : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
          }`}
          title={showGrid ? 'Hide Grid' : 'Show Grid'}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
