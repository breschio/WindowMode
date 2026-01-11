import { create } from 'zustand';
import { Diorama, DioramaObject, GenerationProgress } from '@/types';

interface DioramaState {
  // Current view state
  currentDiorama: Diorama | null;
  selectedObject: DioramaObject | null;

  // Browse mode
  dioramas: Diorama[];
  isLoading: boolean;
  error: string | null;

  // Create mode
  isCreating: boolean;
  generationProgress: GenerationProgress;

  // Temporary composition state (for create mode)
  tempObjects: Partial<DioramaObject>[];

  // Actions
  setCurrentDiorama: (diorama: Diorama | null) => void;
  setSelectedObject: (object: DioramaObject | null) => void;
  setDioramas: (dioramas: Diorama[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  loadDioramas: () => Promise<void>;
  loadDiorama: (id: string) => Promise<void>;
  createDiorama: (title: string, description?: string) => Promise<Diorama>;
  deleteDiorama: (id: string) => Promise<void>;

  // Create mode actions
  setGenerationProgress: (progress: GenerationProgress) => void;
  addTempObject: (object: Partial<DioramaObject>) => void;
  removeTempObject: (index: number) => void;
  clearTempObjects: () => void;
  saveDiorama: () => Promise<void>;
}

export const useDioramaStore = create<DioramaState>((set, get) => ({
  // Initial state
  currentDiorama: null,
  selectedObject: null,
  dioramas: [],
  isLoading: false,
  error: null,
  isCreating: false,
  generationProgress: { step: 'idle', progress: 0 },
  tempObjects: [],

  // Setters
  setCurrentDiorama: (diorama) => set({ currentDiorama: diorama }),
  setSelectedObject: (object) => set({ selectedObject: object }),
  setDioramas: (dioramas) => set({ dioramas }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Load all dioramas
  loadDioramas: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/dioramas');
      if (!res.ok) throw new Error('Failed to fetch dioramas');

      const { dioramas } = await res.json();
      set({ dioramas, isLoading: false });
    } catch (error) {
      console.error('Failed to load dioramas:', error);
      set({ error: 'Failed to load dioramas', isLoading: false });
    }
  },

  // Load a single diorama
  loadDiorama: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/dioramas/${id}`);
      if (!res.ok) throw new Error('Failed to fetch diorama');

      const { diorama } = await res.json();
      set({ currentDiorama: diorama, isLoading: false });
    } catch (error) {
      console.error('Failed to load diorama:', error);
      set({ error: 'Failed to load diorama', isLoading: false });
    }
  },

  // Create a new diorama
  createDiorama: async (title: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/dioramas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });

      if (!res.ok) throw new Error('Failed to create diorama');

      const { diorama } = await res.json();
      set({
        currentDiorama: diorama,
        dioramas: [diorama, ...get().dioramas],
        isLoading: false
      });

      return diorama;
    } catch (error) {
      console.error('Failed to create diorama:', error);
      set({ error: 'Failed to create diorama', isLoading: false });
      throw error;
    }
  },

  // Delete a diorama
  deleteDiorama: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/dioramas/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete diorama');

      const { dioramas, currentDiorama } = get();
      set({
        dioramas: dioramas.filter(d => d.id !== id),
        currentDiorama: currentDiorama?.id === id ? null : currentDiorama,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to delete diorama:', error);
      set({ error: 'Failed to delete diorama', isLoading: false });
    }
  },

  // Create mode actions
  setGenerationProgress: (progress) => set({ generationProgress: progress }),

  addTempObject: (object) => {
    const { tempObjects } = get();
    set({ tempObjects: [...tempObjects, object] });
  },

  removeTempObject: (index) => {
    const { tempObjects } = get();
    set({ tempObjects: tempObjects.filter((_, i) => i !== index) });
  },

  clearTempObjects: () => set({ tempObjects: [] }),

  saveDiorama: async () => {
    const { currentDiorama, tempObjects } = get();
    if (!currentDiorama) {
      throw new Error('No current diorama to save to');
    }

    set({ isLoading: true, error: null });
    try {
      // Create diorama objects in database
      for (const obj of tempObjects) {
        await fetch('/api/diorama-objects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dioramaId: currentDiorama.id,
            ...obj
          })
        });
      }

      // Reload current diorama
      await get().loadDiorama(currentDiorama.id);

      // Clear temp objects
      set({ tempObjects: [], isLoading: false });
    } catch (error) {
      console.error('Failed to save diorama:', error);
      set({ error: 'Failed to save diorama', isLoading: false });
      throw error;
    }
  }
}));
