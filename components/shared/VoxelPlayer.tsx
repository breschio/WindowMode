'use client';

import { useRef, useEffect } from 'react';

const WORLD_TO_VOXEL_SCALE = 0.0075;
const SCREEN_SCALE = 0.2 * 1.684;
const SCREEN_POSITION = [0.0, 0.0, -0.5];
const SCREEN_TARGET = [0.0, 0.0, 0.0];

interface VoxelPlayerProps {
  src: string;
  eyePosition?: [number, number, number] | null;
  className?: string;
  style?: React.CSSProperties;
  boundingBox?: 'show' | 'hide';
  topColor?: string;
  botColor?: string;
  videoControls?: 'show' | 'hide' | 'hover';
}

export function VoxelPlayer({
  src,
  eyePosition,
  className,
  style,
  boundingBox = 'hide',
  topColor = '0 0 0 1',
  botColor = '0 0 0 1',
  videoControls = 'hide'
}: VoxelPlayerProps) {
  const vvRef = useRef<HTMLDivElement | null>(null);

  // Update camera when eye position changes
  useEffect(() => {
    if (eyePosition && customElements.get('vv-player')) {
      (vvRef.current as any)?.setCamera('portal', {
        eyePosWorld: eyePosition,
        screenScale: SCREEN_SCALE,
        worldToVoxelScale: WORLD_TO_VOXEL_SCALE,
        screenPos: SCREEN_POSITION,
        screenTarget: SCREEN_TARGET
      });
    }
  }, [eyePosition]);

  // Import spatial-player dynamically
  useEffect(() => {
    import('spatial-player/src/index.js' as any);
  }, []);

  return (
    /* @ts-expect-error - vv-player is a custom element from spatial-player */
    <vv-player
      ref={vvRef}
      src={src}
      bounding-box={boundingBox}
      top-color={topColor}
      bot-color={botColor}
      video-controls={videoControls}
      className={className}
      style={style || { width: '100%', height: '100%', display: 'block' }}
    />
  );
}
