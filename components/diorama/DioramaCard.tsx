'use client';

import { Diorama } from '@/types';
import { Layers } from 'lucide-react';

interface DioramaCardProps {
  diorama: Diorama;
  isSelected: boolean;
  onClick: () => void;
}

export function DioramaCard({ diorama, isSelected, onClick }: DioramaCardProps) {
  const objectCount = diorama.objects?.length || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
        isSelected
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
      }`}
    >
      {/* Thumbnail placeholder */}
      <div className="w-full aspect-video bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg mb-3 flex items-center justify-center">
        <Layers className="w-8 h-8 text-gray-500" />
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-sm mb-1 truncate">
        {diorama.title}
      </h3>

      {/* Description */}
      {diorama.description && (
        <p className="text-gray-400 text-xs mb-2 line-clamp-2">
          {diorama.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{objectCount} object{objectCount !== 1 ? 's' : ''}</span>
        <span>•</span>
        <span>{new Date(diorama.createdAt).toLocaleDateString()}</span>
      </div>
    </button>
  );
}
