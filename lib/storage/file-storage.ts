import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const STORAGE_DIR = join(process.cwd(), 'public', 'dioramas');

/**
 * Ensures the storage directory exists
 */
async function ensureStorageDir() {
  await mkdir(STORAGE_DIR, { recursive: true });
}

/**
 * Save a VV (voxel volume) file
 */
export async function saveVVFile(buffer: Buffer): Promise<string> {
  await ensureStorageDir();

  const filename = `${randomUUID()}.vv`;
  const filepath = join(STORAGE_DIR, filename);

  await writeFile(filepath, buffer);

  return `/dioramas/${filename}`;
}

/**
 * Save a GLB (3D model) file
 */
export async function saveGLBFile(buffer: Buffer): Promise<string> {
  await ensureStorageDir();

  const filename = `${randomUUID()}.glb`;
  const filepath = join(STORAGE_DIR, filename);

  await writeFile(filepath, buffer);

  return `/dioramas/${filename}`;
}

/**
 * Save an image file
 */
export async function saveImageFile(
  buffer: Buffer,
  extension: string = 'png'
): Promise<string> {
  await ensureStorageDir();

  const filename = `${randomUUID()}.${extension}`;
  const filepath = join(STORAGE_DIR, filename);

  await writeFile(filepath, buffer);

  return `/dioramas/${filename}`;
}

/**
 * Save a file from a URL by downloading it
 */
export async function saveFileFromUrl(
  url: string,
  extension: string
): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file from ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await ensureStorageDir();

  const filename = `${randomUUID()}.${extension}`;
  const filepath = join(STORAGE_DIR, filename);

  await writeFile(filepath, buffer);

  return `/dioramas/${filename}`;
}

/**
 * Convert a base64 string to a Buffer and save it
 */
export async function saveBase64File(
  base64Data: string,
  extension: string = 'png'
): Promise<string> {
  const buffer = Buffer.from(base64Data, 'base64');

  await ensureStorageDir();

  const filename = `${randomUUID()}.${extension}`;
  const filepath = join(STORAGE_DIR, filename);

  await writeFile(filepath, buffer);

  return `/dioramas/${filename}`;
}
