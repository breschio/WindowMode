import { NextRequest, NextResponse } from 'next/server';
import { convertGLBtoVV } from '@/lib/api/splats';

export async function POST(request: NextRequest) {
  try {
    const { glbPath } = await request.json();

    if (!glbPath) {
      return NextResponse.json(
        { error: 'GLB path is required' },
        { status: 400 }
      );
    }

    console.log('Converting GLB to VV:', glbPath);

    // Convert GLB to VV using Splats.com API
    const vvPath = await convertGLBtoVV(glbPath);

    return NextResponse.json({
      vvUrl: vvPath,
      message: 'Successfully converted GLB to VV format'
    });

  } catch (error) {
    console.error('Voxel conversion failed:', error);
    return NextResponse.json(
      {
        error: 'Voxel conversion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
