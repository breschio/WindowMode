'use client';

import { useState, useEffect } from 'react';
import { Diorama } from '@/types';
import { DioramaCard } from './DioramaCard';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface DioramaSidebarProps {
  dioramas: Diorama[];
  currentDioramaId: string | null;
  onDioramaSelect: (diorama: Diorama) => void;
  isLoading?: boolean;
}

export function DioramaSidebar({
  dioramas,
  currentDioramaId,
  onDioramaSelect,
  isLoading
}: DioramaSidebarProps) {
  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Dioramas</h2>
          <Link
            href="/create"
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            title="Create new diorama"
          >
            <Plus className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>

      {/* Diorama list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        ) : dioramas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No dioramas yet</p>
            <Link
              href="/create"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create your first diorama
            </Link>
          </div>
        ) : (
          dioramas.map((diorama) => (
            <DioramaCard
              key={diorama.id}
              diorama={diorama}
              isSelected={diorama.id === currentDioramaId}
              onClick={() => onDioramaSelect(diorama)}
            />
          ))
        )}
      </div>
    </div>
  );
}
