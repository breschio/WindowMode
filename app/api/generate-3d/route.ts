import { NextRequest, NextResponse } from 'next/server';
import { convertImageTo3D } from '@/lib/api/hunyuan';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL or path is required' },
        { status: 400 }
      );
    }

    console.log('Converting image to 3D:', imageUrl);

    // Convert image to 3D using Hunyuan 3D
    // The function will automatically handle local paths by converting to base64
    const result = await convertImageTo3D(imageUrl);

    return NextResponse.json({
      glbUrl: result.glbUrl,
      localGlbPath: result.localGlbPath,
      message: 'Successfully converted image to 3D model'
    });

  } catch (error) {
    console.error('3D generation failed:', error);
    return NextResponse.json(
      {
        error: '3D generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
