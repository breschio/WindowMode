import * as fal from '@fal-ai/serverless-client';
import { saveFileFromUrl } from '@/lib/storage/file-storage';

/**
 * Quality modes for 3D generation
 */
export type QualityMode = 'fast' | 'balanced' | 'quality';

/**
 * Model configurations for different quality levels
 */
const MODEL_CONFIGS = {
  fast: {
    model: 'fal-ai/triposr',
    name: 'TripoSR',
    speed: '3-8 seconds',
    description: 'Fast generation for development and testing'
  },
  balanced: {
    model: 'fal-ai/stable-fast-3d',
    name: 'Stable Fast 3D',
    speed: '10-20 seconds',
    description: 'Balanced quality and speed'
  },
  quality: {
    model: 'fal-ai/hunyuan3d-v3/image-to-3d',
    name: 'Hunyuan 3D v3',
    speed: '30-60 seconds',
    description: 'Highest quality, slower generation'
  }
};

/**
 * Get the quality mode from environment or default to fast for dev
 */
function getQualityMode(): QualityMode {
  const mode = process.env.NEXT_PUBLIC_3D_QUALITY_MODE as QualityMode;
  return mode || 'fast'; // Default to fast mode
}

/**
 * Initialize fal.ai client
 */
function initializeFal() {
  const apiKey = process.env.FAL_API_KEY;

  if (!apiKey) {
    throw new Error('FAL_API_KEY is not configured in environment variables');
  }

  fal.config({
    credentials: apiKey
  });
}

/**
 * Convert an image to a 3D model
 * Accepts either a public URL or a local file path (will be converted to base64)
 * Supports multiple quality modes: fast (Instant Mesh), balanced (Stable Fast 3D), quality (Hunyuan 3D)
 */
export async function convertImageTo3D(
  imageUrlOrPath: string,
  qualityMode?: QualityMode
): Promise<{ glbUrl: string; localGlbPath: string }> {
  initializeFal();

  const mode = qualityMode || getQualityMode();
  const config = MODEL_CONFIGS[mode];

  try {
    console.log(`Starting 3D conversion with ${config.name} (${mode} mode) for image:`, imageUrlOrPath);

    // If it's a local path, convert to base64 data URI
    let imageInput = imageUrlOrPath;

    if (imageUrlOrPath.startsWith('/dioramas/')) {
      // Read local file and convert to base64 data URI
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.join(process.cwd(), 'public', imageUrlOrPath);
      const imageBuffer = fs.readFileSync(fullPath);
      const base64 = imageBuffer.toString('base64');
      const mimeType = imageUrlOrPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
      imageInput = `data:${mimeType};base64,${base64}`;
      console.log('Converted local image to base64 data URI');
    }

    // Build input based on model
    let input: any;

    if (mode === 'fast') {
      // TripoSR uses 'image_url' parameter
      input = { image_url: imageInput };
    } else if (mode === 'balanced') {
      // Stable Fast 3D uses 'image_url' parameter
      input = { image_url: imageInput };
    } else {
      // Hunyuan 3D uses 'input_image_url' and 'output_format'
      input = {
        input_image_url: imageInput,
        output_format: 'glb'
      };
    }

    const result = await fal.subscribe(config.model, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log(`${config.name} queue update:`, update);
      }
    });

    console.log(`${config.name} result:`, result);

    // Extract GLB URL based on model response format
    let glbRemoteUrl: string | undefined;

    if (mode === 'fast') {
      // TripoSR returns 'model_mesh' with url
      glbRemoteUrl = (result as any).model_mesh?.url;
    } else if (mode === 'balanced') {
      // Stable Fast 3D returns 'model' with url
      glbRemoteUrl = (result as any).model?.url || (result as any).model_file?.url;
    } else {
      // Hunyuan 3D returns 'model_glb' with url
      glbRemoteUrl = (result as any).model_glb?.url;
    }

    if (!glbRemoteUrl) {
      console.error(`Full ${config.name} result:`, JSON.stringify(result, null, 2));
      throw new Error(`No GLB URL in ${config.name} response`);
    }

    // Download and save the GLB file locally
    console.log('Downloading GLB from:', glbRemoteUrl);
    const localGlbPath = await saveFileFromUrl(glbRemoteUrl, 'glb');

    console.log(`✓ 3D model generated successfully with ${config.name} (${config.speed})`);

    return {
      glbUrl: glbRemoteUrl,
      localGlbPath
    };

  } catch (error: any) {
    console.error(`${config.name} conversion error:`, error);

    // Log error details for debugging
    if (error.body) {
      console.error('Error body:', JSON.stringify(error.body, null, 2));
    }
    if (error.response) {
      console.error('Error response:', JSON.stringify(error.response, null, 2));
    }

    throw new Error(
      `Failed to convert image to 3D with ${config.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check the status of a Hunyuan 3D generation
 */
export async function checkGenerationStatus(requestId: string): Promise<any> {
  initializeFal();

  try {
    const status = await fal.queue.status('fal-ai/hunyuan3d-v3/image-to-3d', {
      requestId
    });

    return status;
  } catch (error) {
    console.error('Failed to check generation status:', error);
    throw error;
  }
}

/**
 * Get the current quality mode configuration
 */
export function getCurrentQualityConfig() {
  const mode = getQualityMode();
  return {
    mode,
    ...MODEL_CONFIGS[mode]
  };
}

/**
 * Get all available quality configurations
 */
export function getAllQualityConfigs() {
  return MODEL_CONFIGS;
}
