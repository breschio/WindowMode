/**
 * Type definitions for the Diorama platform
 */

export enum DepthLayer {
  BACKGROUND = 0,
  MIDGROUND = 1,
  FOREGROUND = 2
}

export interface Diorama {
  id: string;
  title: string;
  description?: string;
  compositeVvUrl?: string;
  renderMode: 'layered' | 'composite';
  createdAt: Date | string;
  updatedAt: Date | string;
  objects?: DioramaObject[];
}

export interface DioramaObject {
  id: string;
  dioramaId: string;
  name: string;
  prompt?: string;
  depthLayer: number; // 0=background, 1=mid, 2=foreground
  position: {
    x: number;
    y: number;
    z: number;
  };
  scale: number;
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  vvUrl: string; // Path to .vv file
  glbUrl?: string; // Original GLB file
  imageUrl?: string; // Original generated image
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GenerationProgress {
  step: 'idle' | 'image' | '3d' | 'voxel' | 'complete';
  progress: number;
  error?: string;
}
