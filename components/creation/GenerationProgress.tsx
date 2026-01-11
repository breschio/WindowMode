'use client';

interface GenerationStep {
  id: string;
  label: string;
  description: string;
}

const GENERATION_STEPS: GenerationStep[] = [
  {
    id: 'image',
    label: 'Generating Image',
    description: 'Creating image from your prompt with Gemini AI...'
  },
  {
    id: '3d',
    label: 'Converting to 3D',
    description: 'Transforming image into 3D model with Hunyuan 3D...'
  },
  {
    id: 'voxel',
    label: 'Finalizing',
    description: 'Preparing model for display...'
  },
  {
    id: 'complete',
    label: 'Complete',
    description: 'Your 3D object is ready!'
  }
];

interface GenerationProgressProps {
  currentStep: 'idle' | 'image' | '3d' | 'voxel' | 'complete';
  error?: string | null;
  generatedImageUrl?: string | null;
}

export default function GenerationProgress({
  currentStep,
  error,
  generatedImageUrl
}: GenerationProgressProps) {
  if (currentStep === 'idle') return null;

  const currentStepIndex = GENERATION_STEPS.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / GENERATION_STEPS.length) * 100;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-red-400 font-semibold">Generation Failed</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {!error && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-300 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="space-y-3">
            {GENERATION_STEPS.map((step, index) => {
              const isComplete = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    isCurrent ? 'bg-blue-900/20 border border-blue-700' : ''
                  }`}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isComplete && (
                      <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    )}
                    {isPending && (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                    )}
                  </div>

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-medium ${
                        isComplete ? 'text-green-400' :
                        isCurrent ? 'text-blue-400' :
                        'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-sm text-gray-400 mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generated image preview */}
          {generatedImageUrl && currentStepIndex >= 1 && (
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Generated Image</h4>
              <img
                src={generatedImageUrl}
                alt="Generated"
                className="w-full rounded-lg border border-gray-700"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
