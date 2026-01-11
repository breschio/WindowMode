/**
 * Layer configuration for diorama depth system
 * Defines z-offsets and scale multipliers for 3-layer depth rendering
 */

export interface LayerConfig {
  id: number;
  name: string;
  zOffset: number;      // Camera/scene z-axis offset for depth
  scale: number;        // Scale multiplier for objects in this layer
  description: string;
}

/**
 * Three preset depth layers for dioramas
 * - Background: Far away, larger scale to appear distant
 * - Midground: Middle distance, normal scale
 * - Foreground: Close up, smaller scale for near appearance
 */
export const DEPTH_LAYERS: LayerConfig[] = [
  {
    id: 0,
    name: 'background',
    zOffset: -0.8,  // Pushed back in z-space
    scale: 1.2,     // Slightly larger to compensate for distance
    description: 'Far away background elements'
  },
  {
    id: 1,
    name: 'midground',
    zOffset: 0.0,   // Neutral position
    scale: 1.0,     // Normal scale
    description: 'Middle distance main elements'
  },
  {
    id: 2,
    name: 'foreground',
    zOffset: 0.6,   // Pulled forward in z-space
    scale: 0.8,     // Slightly smaller for near appearance
    description: 'Close-up foreground elements'
  }
];

/**
 * Get layer configuration by ID
 */
export function getLayerConfig(layerId: number): LayerConfig {
  const config = DEPTH_LAYERS.find(layer => layer.id === layerId);
  if (!config) {
    throw new Error(`Invalid layer ID: ${layerId}`);
  }
  return config;
}

/**
 * Get layer configuration by name
 */
export function getLayerConfigByName(name: string): LayerConfig {
  const config = DEPTH_LAYERS.find(layer => layer.name === name);
  if (!config) {
    throw new Error(`Invalid layer name: ${name}`);
  }
  return config;
}

/**
 * Calculate combined camera offset for multiple layers
 * Used when compositing multiple objects in a single view
 */
export function calculateCameraOffset(layers: number[]): number {
  if (layers.length === 0) return 0;

  // Average the z-offsets of all active layers
  const totalOffset = layers.reduce((sum, layerId) => {
    const config = getLayerConfig(layerId);
    return sum + config.zOffset;
  }, 0);

  return totalOffset / layers.length;
}

/**
 * Validate layer ID
 */
export function isValidLayer(layerId: number): boolean {
  return DEPTH_LAYERS.some(layer => layer.id === layerId);
}

/**
 * Get all layer IDs
 */
export function getAllLayerIds(): number[] {
  return DEPTH_LAYERS.map(layer => layer.id);
}
