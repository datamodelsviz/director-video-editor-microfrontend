import { create } from 'zustand';
import { compositionApi, Composition } from '../../../services/compositionApi';

interface CompositionStore {
  // State
  compositions: Composition[];
  currentCompositionId: string | null;
  currentCompositionName: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCompositions: () => Promise<void>;
  loadComposition: (id: string) => Promise<Composition | null>;
  saveComposition: (name: string, data: any) => Promise<Composition | null>;
  setCurrentCompositionId: (id: string | null) => void;
  setCurrentCompositionName: (name: string | null) => void;
  clearError: () => void;
}

export const useCompositionStore = create<CompositionStore>((set, get) => ({
  // Initial state
  compositions: [],
  currentCompositionId: null,
  currentCompositionName: null,
  isLoading: false,
  error: null,

  // Load list of compositions
  loadCompositions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await compositionApi.listCompositions();
      if (response.success && response.data.compositions) {
        set({ compositions: response.data.compositions });
      } else {
        set({ error: 'Failed to load compositions' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load compositions' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Load specific composition
  loadComposition: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await compositionApi.getComposition(id);
      if (response.success && response.data.composition) {
        set({ 
          currentCompositionId: id,
          currentCompositionName: response.data.composition.name
        });
        return response.data.composition;
      } else {
        set({ error: 'Failed to load composition' });
        return null;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load composition' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Save composition - save the exact render API payload
  saveComposition: async (name: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      // Save the exact data structure as-is (render API payload)
      const apiData = {
        name,
        description: `Composition saved on ${new Date().toLocaleDateString()}`,
        duration: data.duration || 0,
        fps: data.fps || 30,
        size: data.size || { width: 1080, height: 1920 },
        tracks_count: data.tracks?.length || 0,
        is_public: false,
        category: 'general',
        tags: [],
        design: data, // Save the entire data object as-is
        options: {
          fps: data.fps || 30,
          size: data.size || { width: 1080, height: 1920 },
          format: 'mp4'
        }
      };

      const response = await compositionApi.createComposition(apiData);
      if (response.success && response.data.composition) {
        // Add to local compositions list
        const newComposition = response.data.composition;
        set(state => ({
          compositions: [newComposition, ...state.compositions],
          currentCompositionId: newComposition.id,
          currentCompositionName: newComposition.name
        }));
        return newComposition;
      } else {
        set({ error: 'Failed to save composition' });
        return null;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save composition' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Set current composition ID
  setCurrentCompositionId: (id: string | null) => {
    set({ currentCompositionId: id });
  },

  // Set current composition name
  setCurrentCompositionName: (name: string | null) => {
    set({ currentCompositionName: name });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));
