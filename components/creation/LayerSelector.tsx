'use client';

interface Layer {
  id: number;
  name: string;
  label: string;
  description: string;
  icon: string;
}

const LAYERS: Layer[] = [
  {
    id: 0,
    name: 'background',
    label: 'Background',
    description: 'Far away, larger scale',
    icon: '🏔️'
  },
  {
    id: 1,
    name: 'midground',
    label: 'Midground',
    description: 'Middle distance, normal scale',
    icon: '🌳'
  },
  {
    id: 2,
    name: 'foreground',
    label: 'Foreground',
    description: 'Close up, smaller scale',
    icon: '🎯'
  }
];

interface LayerSelectorProps {
  selectedLayer: number;
  onLayerChange: (layer: number) => void;
  disabled?: boolean;
}

export default function LayerSelector({
  selectedLayer,
  onLayerChange,
  disabled = false
}: LayerSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-gray-200 mb-1">Depth Layer</h3>
        <p className="text-xs text-gray-500">
          Choose where this object will appear in the diorama
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            onClick={() => onLayerChange(layer.id)}
            disabled={disabled}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${selectedLayer === layer.id
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Selection indicator */}
            {selectedLayer === layer.id && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Layer content */}
            <div className="space-y-2">
              <div className="text-3xl">{layer.icon}</div>
              <div className="text-left">
                <h4 className={`font-medium text-sm ${
                  selectedLayer === layer.id ? 'text-blue-400' : 'text-gray-200'
                }`}>
                  {layer.label}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{layer.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Visual depth guide */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400">Depth Preview</span>
        </div>
        <div className="relative h-20 bg-gradient-to-b from-gray-900 to-gray-800 rounded overflow-hidden">
          {/* Background layer indicator */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-all ${
              selectedLayer === 0 ? 'opacity-100 scale-110' : 'opacity-40'
            }`}
            style={{ width: '60%' }}
          >
            <div className="text-center text-3xl">🏔️</div>
          </div>
          {/* Midground layer indicator */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-all ${
              selectedLayer === 1 ? 'opacity-100 scale-110' : 'opacity-40'
            }`}
            style={{ width: '45%' }}
          >
            <div className="text-center text-2xl">🌳</div>
          </div>
          {/* Foreground layer indicator */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 transition-all ${
              selectedLayer === 2 ? 'opacity-100 scale-110' : 'opacity-40'
            }`}
            style={{ width: '30%' }}
          >
            <div className="text-center text-xl">🎯</div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Far</span>
          <span>Near</span>
        </div>
      </div>
    </div>
  );
}
