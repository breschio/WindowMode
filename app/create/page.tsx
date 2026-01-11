'use client';

import { useState } from 'react';
import PromptInput from '@/components/creation/PromptInput';
import GenerationProgress from '@/components/creation/GenerationProgress';
import LayerSelector from '@/components/creation/LayerSelector';
import { useGeneration } from '@/lib/hooks/useGeneration';
import Link from 'next/link';

export default function CreatePage() {
  const { steps, result, error, isGenerating, generateObject, reset } = useGeneration();
  const [selectedLayer, setSelectedLayer] = useState(1); // Default to midground
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Determine current step for progress UI
  const currentStep = steps.find(s => s.status === 'in-progress')?.name ||
                      (steps.every(s => s.status === 'complete') ? 'complete' : 'idle');
  const stepMap: Record<string, 'idle' | 'image' | '3d' | 'voxel' | 'complete'> = {
    'Generating image': 'image',
    'Converting to 3D': '3d',
    'Voxelizing model': 'voxel',
    'complete': 'complete'
  };

  const handleSubmit = async (prompt: string) => {
    setGeneratedImageUrl(null);

    try {
      const generationResult = await generateObject(prompt);

      if (generationResult) {
        setGeneratedImageUrl(generationResult.imageUrl);
        console.log('Generation successful!', generationResult);
      }
    } catch (err) {
      console.error('Generation error:', err);
    }
  };

  const handleReset = () => {
    reset();
    setGeneratedImageUrl(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Create Diorama</h1>
              <p className="text-gray-400 text-sm mt-1">
                Generate 3D objects from text and compose them into layered scenes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/browse"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Browse
              </Link>
              <Link
                href="/viewer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View Result
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Input & Controls */}
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Generate 3D Object</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Quality:</span>
                  <span className="px-2 py-1 bg-blue-900/30 border border-blue-700 text-blue-400 text-xs font-medium rounded">
                    {process.env.NEXT_PUBLIC_3D_QUALITY_MODE || 'fast'} mode
                  </span>
                </div>
              </div>
              <PromptInput onSubmit={handleSubmit} isGenerating={isGenerating} />
            </div>

            {/* Layer Selector */}
            {!isGenerating && !result && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <LayerSelector
                  selectedLayer={selectedLayer}
                  onLayerChange={setSelectedLayer}
                  disabled={isGenerating}
                />
              </div>
            )}

            {/* Success state with actions */}
            {result && !error && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-400">Object Generated!</h3>
                    <p className="text-sm text-gray-400">Your 3D object is ready to view</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700 space-y-3">
                  <Link
                    href={`/viewer?model=${result.glbUrl}`}
                    className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
                  >
                    View 3D Model
                  </Link>

                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Generate Another Object
                  </button>
                </div>

                {/* File paths info */}
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Generated Files:</h4>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Image:</span>
                      <code className="text-gray-400">{result.imageUrl}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>3D Model:</span>
                      <code className="text-gray-400">{result.glbUrl}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Voxel:</span>
                      <code className="text-gray-400">{result.vvUrl}</code>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Progress & Preview */}
          <div className="space-y-6">
            {/* Generation Progress */}
            {(isGenerating || error || result) && (
              <GenerationProgress
                currentStep={stepMap[currentStep] || 'idle'}
                error={error}
                generatedImageUrl={generatedImageUrl}
              />
            )}

            {/* Info card when idle */}
            {!isGenerating && !result && !error && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">How it works</h3>
                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">1</span>
                    <div>
                      <h4 className="text-white font-medium">Describe Your Object</h4>
                      <p>Enter a text prompt describing what you want to create</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">2</span>
                    <div>
                      <h4 className="text-white font-medium">AI Generation</h4>
                      <p>Gemini creates an image, Hunyuan converts it to 3D</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">3</span>
                    <div>
                      <h4 className="text-white font-medium">Voxelization</h4>
                      <p>The model is converted to voxel format for window-mode display</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">4</span>
                    <div>
                      <h4 className="text-white font-medium">View & Place</h4>
                      <p>Choose a depth layer and view your 3D object</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-300">
                    <strong>Note:</strong> Currently using <strong>{process.env.NEXT_PUBLIC_3D_QUALITY_MODE || 'fast'}</strong> mode
                    {(process.env.NEXT_PUBLIC_3D_QUALITY_MODE === 'fast' || !process.env.NEXT_PUBLIC_3D_QUALITY_MODE) && ' (3-8 seconds)'}
                    {process.env.NEXT_PUBLIC_3D_QUALITY_MODE === 'balanced' && ' (10-20 seconds)'}
                    {process.env.NEXT_PUBLIC_3D_QUALITY_MODE === 'quality' && ' (30-60 seconds)'}
                    . The AI creates an image first, then converts it to 3D.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
