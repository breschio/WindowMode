import { readFile } from 'fs/promises';
import { join } from 'path';
import FormData from 'form-data';
import { saveVVFile } from '@/lib/storage/file-storage';

const VOXELIZE_API_URL = 'https://www.splats.com/api/tools/voxelize';

/**
 * Convert a GLB file to VV (voxel volume) format using Splats.com API
 * TEMPORARY: Splats.com API is not accessible, so we're skipping VV conversion
 * and just returning the GLB path. The viewer already supports GLB via Three.js.
 */
export async function convertGLBtoVV(glbPath: string): Promise<string> {
  try {
    console.log('Converting GLB to VV:', glbPath);

    // TEMPORARY BYPASS: Skip voxelization for development
    // The Splats.com API is returning 405 errors
    const SKIP_VOXELIZATION = process.env.SKIP_VOXELIZATION !== 'false';

    if (SKIP_VOXELIZATION) {
      console.log('⚠️  SKIPPING voxelization (development mode) - returning GLB path');
      console.log('   The viewer will load the GLB directly via Three.js');
      // Just return the GLB path as the "VV" path
      // The viewer already handles GLB files
      return glbPath;
    }

    // Read the GLB file
    let glbBuffer: Buffer;

    if (glbPath.startsWith('/dioramas/')) {
      // Local file path
      const fullPath = join(process.cwd(), 'public', glbPath);
      glbBuffer = await readFile(fullPath);
    } else if (glbPath.startsWith('http')) {
      // Remote URL
      const response = await fetch(glbPath);
      if (!response.ok) {
        throw new Error(`Failed to download GLB from ${glbPath}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      glbBuffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error('Invalid GLB path format');
    }

    console.log('GLB buffer size:', glbBuffer.length, 'bytes');

    // Create form data
    const formData = new FormData();
    formData.append('file', glbBuffer, {
      filename: 'model.glb',
      contentType: 'model/gltf-binary'
    });

    console.log('Sending request to Splats.com API...');

    // Call Splats.com API
    const response = await fetch(VOXELIZE_API_URL, {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Voxelize API error response:', errorText);
      throw new Error(`Voxelize API error: ${response.statusText}`);
    }

    // Get the VV buffer
    const vvArrayBuffer = await response.arrayBuffer();
    const vvBuffer = Buffer.from(vvArrayBuffer);

    console.log('Received VV buffer size:', vvBuffer.length, 'bytes');

    // Save the VV file
    const vvPath = await saveVVFile(vvBuffer);

    console.log('Saved VV file to:', vvPath);

    return vvPath;

  } catch (error) {
    console.error('GLB to VV conversion error:', error);
    throw new Error(
      `Failed to convert GLB to VV format: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Convert a GLB URL to VV format
 */
export async function convertGLBUrlToVV(glbUrl: string): Promise<string> {
  return convertGLBtoVV(glbUrl);
}
