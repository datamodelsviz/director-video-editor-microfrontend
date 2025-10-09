import { create } from 'zustand';
import { compositionApi, Composition } from '../../../services/compositionApi';

interface CompositionStore {
  // State
  compositions: Composition[];
  currentCompositionId: string | null;
  currentCompositionName: string | null;
  currentComposition: Composition | null;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCompositions: () => Promise<void>;
  loadComposition: (id: string) => Promise<Composition | null>;
  saveComposition: (name: string, data: any) => Promise<Composition | null>;
  updateComposition: (id: string, data: any) => Promise<Composition | null>;
  setCurrentCompositionId: (id: string | null) => void;
  setCurrentCompositionName: (name: string | null) => void;
  setCurrentComposition: (composition: Composition | null) => void;
  markUnsavedChanges: () => void;
  markSaved: () => void;
  clearError: () => void;
}

export const useCompositionStore = create<CompositionStore>((set, get) => ({
  // Initial state
  compositions: [],
  currentCompositionId: null,
  currentCompositionName: null,
  currentComposition: null,
  hasUnsavedChanges: false,
  lastSavedAt: null,
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
    console.log('CompositionStore: loadComposition called with ID:', id);
    set({ isLoading: true, error: null });
    try {
      console.log('CompositionStore: Calling compositionApi.getComposition...');
      const response = await compositionApi.getComposition(id);
      console.log('CompositionStore: API response:', response);
      
      if (response.success && response.data.composition) {
        console.log('CompositionStore: Composition loaded successfully:', response.data.composition.name);
        set({ 
          currentCompositionId: id,
          currentCompositionName: response.data.composition.name
        });
        return response.data.composition;
      } else {
        console.error('CompositionStore: Failed to load composition - response:', response);
        set({ error: 'Failed to load composition' });
        return null;
      }
    } catch (error) {
      console.error('CompositionStore: Error loading composition:', error);
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
          currentCompositionName: newComposition.name,
          currentComposition: newComposition,
          hasUnsavedChanges: false,
          lastSavedAt: new Date()
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

  // Update existing composition
  updateComposition: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const apiData = {
        name: get().currentComposition?.name || 'Untitled',
        description: `Updated on ${new Date().toLocaleDateString()}`,
        duration: data.duration || 0,
        fps: data.fps || 30,
        size: data.size || { width: 1080, height: 1920 },
        tracks_count: data.tracks?.length || 0,
        is_public: false,
        category: 'general',
        tags: [],
        design: data,
        options: {
          fps: data.fps || 30,
          size: data.size || { width: 1080, height: 1920 },
          format: 'mp4'
        }
      };

      const response = await compositionApi.updateComposition(id, apiData);
      if (response.success && response.data.composition) {
        const updatedComposition = response.data.composition;
        set(state => ({
          currentComposition: updatedComposition,
          compositions: state.compositions.map(comp => 
            comp.id === id ? updatedComposition : comp
          ),
          hasUnsavedChanges: false,
          lastSavedAt: new Date()
        }));
        return updatedComposition;
      } else {
        set({ error: 'Failed to update composition' });
        return null;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update composition' });
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

  // Set current composition
  setCurrentComposition: (composition: Composition | null) => {
    set({ 
      currentComposition: composition,
      currentCompositionId: composition?.id || null,
      currentCompositionName: composition?.name || null,
      hasUnsavedChanges: false,
      lastSavedAt: composition ? new Date(composition.updated_at) : null
    });
  },

  // Mark as having unsaved changes
  markUnsavedChanges: () => {
    set({ hasUnsavedChanges: true });
  },

  // Mark as saved
  markSaved: () => {
    set({ 
      hasUnsavedChanges: false, 
      lastSavedAt: new Date() 
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));
