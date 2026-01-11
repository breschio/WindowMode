import { NextRequest, NextResponse } from 'next/server';
import { generateImageFromPrompt } from '@/lib/api/gemini';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Generating image for prompt:', prompt);

    // Use Gemini 2.5 Flash Image (Nano Banana) for real image generation
    const result = await generateImageFromPrompt(prompt);

    return NextResponse.json({
      imageUrl: result.imageUrl,
      message: 'Image generated successfully with Gemini 2.5 Flash Image (Nano Banana)'
    });

  } catch (error) {
    console.error('Image generation failed:', error);
    return NextResponse.json(
      {
        error: 'Image generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
