import { Diorama as PrismaDiorama, DioramaObject as PrismaDioramaObject } from '@prisma/client';

export type Diorama = PrismaDiorama & {
  objects?: DioramaObject[];
};

export type DioramaObject = PrismaDioramaObject;

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface GenerationProgress {
  step: 'idle' | 'image' | '3d' | 'voxel' | 'complete';
  progress: number;
  error?: string;
}

export enum DepthLayer {
  BACKGROUND = 0,
  MIDGROUND = 1,
  FOREGROUND = 2
}
