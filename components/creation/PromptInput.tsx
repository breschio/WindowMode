'use client';

import { useState } from 'react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

export default function PromptInput({ onSubmit, isGenerating }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    // Add to history
    setPromptHistory(prev => [prompt, ...prev].slice(0, 10)); // Keep last 10

    // Submit prompt
    onSubmit(prompt);

    // Clear input
    setPrompt('');
  };

  const handleHistoryClick = (historicPrompt: string) => {
    setPrompt(historicPrompt);
  };

  return (
    <div className="space-y-4">
      {/* Main input form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-200 mb-2">
            Describe what you want to create
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a cute red panda eating bamboo, a vintage typewriter, a futuristic spaceship..."
            disabled={isGenerating}
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate 3D Object'}
        </button>
      </form>

      {/* Prompt history */}
      {promptHistory.length > 0 && (
        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Prompts</h3>
          <div className="space-y-2">
            {promptHistory.map((historicPrompt, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(historicPrompt)}
                disabled={isGenerating}
                className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:hover:bg-gray-800 text-gray-300 text-sm rounded border border-gray-700 hover:border-gray-600 transition-colors disabled:cursor-not-allowed truncate"
              >
                {historicPrompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 Tips for best results:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Be specific about the object's appearance and details</li>
          <li>Mention colors, materials, and style (e.g., "realistic", "cartoon", "low-poly")</li>
          <li>Single objects work better than complex scenes</li>
          <li>Clear subjects on simple backgrounds convert better to 3D</li>
        </ul>
      </div>
    </div>
  );
}
