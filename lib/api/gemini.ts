import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveBase64File, saveFileFromUrl } from '@/lib/storage/file-storage';

/**
 * Generate an image from a text prompt using Gemini 2.5 Flash Image (Nano Banana)
 */
export async function generateImageFromPrompt(
  prompt: string
): Promise<{ imageUrl: string; imageData?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use Gemini 2.5 Flash Image (aka "Nano Banana")
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        responseModalities: ['image']
      }
    });

    const enhancedPrompt = `Create a detailed, high-quality image: ${prompt}.
    The image should have a clear subject with good depth and detail, on a neutral or simple background.
    Make it suitable for creating a 3D model.`;

    console.log('Generating image with Gemini 2.5 Flash Image (Nano Banana)...');

    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;

    // Extract image from response
    // The response should contain image data
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No image generated');
    }

    const parts = candidates[0].content.parts;
    const imagePart = parts.find((part: any) => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      throw new Error('No image data in response');
    }

    const imageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const extension = mimeType.split('/')[1] || 'png';

    // Save the image
    const imageUrl = await saveBase64File(imageData, extension);

    console.log('Image generated successfully:', imageUrl);

    return { imageUrl, imageData };

  } catch (error) {
    console.error('Gemini generation error:', error);
    throw new Error(`Failed to generate image with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Alternative: Use a simple placeholder for testing
 * In production, you'd use Imagen or another image generation API
 */
export async function generatePlaceholderImage(
  prompt: string
): Promise<{ imageUrl: string }> {
  // Create a simple placeholder
  // In production, this would be replaced with actual image generation
  const placeholderUrl = 'https://placehold.co/512x512/png?text=' + encodeURIComponent(prompt.substring(0, 30));

  return { imageUrl: placeholderUrl };
}
