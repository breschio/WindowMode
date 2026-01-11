'use client';

import { useState, useCallback } from 'react';

export interface GenerationStep {
  name: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  message?: string;
}

export interface GenerationResult {
  imageUrl: string;
  glbUrl: string;
  vvUrl: string;
}

export function useGeneration() {
  const [steps, setSteps] = useState<GenerationStep[]>([
    { name: 'Generating image', progress: 0, status: 'pending' },
    { name: 'Converting to 3D', progress: 0, status: 'pending' },
    { name: 'Voxelizing model', progress: 0, status: 'pending' }
  ]);

  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateStep = useCallback((
    index: number,
    updates: Partial<GenerationStep>
  ) => {
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[index] = { ...newSteps[index], ...updates };
      return newSteps;
    });
  }, []);

  const generateObject = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    // Reset all steps
    setSteps([
      { name: 'Generating image', progress: 0, status: 'pending' },
      { name: 'Converting to 3D', progress: 0, status: 'pending' },
      { name: 'Voxelizing model', progress: 0, status: 'pending' }
    ]);

    try {
      // Step 1: Generate image from prompt
      updateStep(0, { status: 'in-progress', progress: 10 });

      const imageRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!imageRes.ok) {
        const errorData = await imageRes.json();
        throw new Error(errorData.details || 'Failed to generate image');
      }

      const imageData = await imageRes.json();
      const imageUrl = imageData.imageUrl;

      updateStep(0, {
        status: 'complete',
        progress: 100,
        message: imageData.message
      });

      // Step 2: Convert image to 3D
      updateStep(1, { status: 'in-progress', progress: 10 });

      const glbRes = await fetch('/api/generate-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      if (!glbRes.ok) {
        const errorData = await glbRes.json();
        throw new Error(errorData.details || 'Failed to convert to 3D');
      }

      const glbData = await glbRes.json();
      const glbUrl = glbData.localGlbPath;

      updateStep(1, { status: 'complete', progress: 100 });

      // Step 3: Convert GLB to VV
      updateStep(2, { status: 'in-progress', progress: 10 });

      const vvRes = await fetch('/api/convert-voxel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ glbPath: glbUrl })
      });

      if (!vvRes.ok) {
        const errorData = await vvRes.json();
        throw new Error(errorData.details || 'Failed to convert to voxel format');
      }

      const vvData = await vvRes.json();
      const vvUrl = vvData.vvUrl;

      updateStep(2, { status: 'complete', progress: 100 });

      // Set final result
      const finalResult: GenerationResult = {
        imageUrl,
        glbUrl,
        vvUrl
      };

      setResult(finalResult);
      setIsGenerating(false);

      return finalResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      // Mark current step as error
      const currentStepIndex = steps.findIndex(s => s.status === 'in-progress');
      if (currentStepIndex !== -1) {
        updateStep(currentStepIndex, {
          status: 'error',
          message: errorMessage
        });
      }

      setIsGenerating(false);
      throw err;
    }
  }, [steps, updateStep]);

  const reset = useCallback(() => {
    setSteps([
      { name: 'Generating image', progress: 0, status: 'pending' },
      { name: 'Converting to 3D', progress: 0, status: 'pending' },
      { name: 'Voxelizing model', progress: 0, status: 'pending' }
    ]);
    setResult(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    steps,
    result,
    error,
    isGenerating,
    generateObject,
    reset
  };
}
