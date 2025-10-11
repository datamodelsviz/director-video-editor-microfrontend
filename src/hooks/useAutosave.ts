import { useEffect, useRef, useCallback, useState } from 'react';
import { useCompositionStore } from '../features/editor/store/use-composition-store';
import { LocalStorageService } from '../services/localStorageService';
import { generateId } from '@designcombo/timeline';
import { IDesign } from '@designcombo/types';
import StateManager from '@designcombo/state';
import { generateDefaultWorkspaceName } from '../utils/workspaceName';
import { parentComm } from '../services/parentCommunication';

interface AutosaveState {
  isAutosaving: boolean;
  lastAutosaveAt: Date | null;
  lastLocalBackupAt: Date | null;
  autosaveEnabled: boolean;
  error: string | null;
}

interface AutosaveConfig {
  debounceDelay: number; // 30 seconds
  periodicInterval: number; // 60 seconds
  enableLocalStorage: boolean;
  enableBackendAutosave: boolean;
  maxRetries: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: AutosaveConfig = {
  debounceDelay: 5000, // 5 seconds
  periodicInterval: 5000, // 5 seconds
  enableLocalStorage: true,
  enableBackendAutosave: true,
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
};

export const useAutosave = (
  stateManager: StateManager,
  config: Partial<AutosaveConfig> = {}
) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  console.log('[Autosave] Initializing with config:', mergedConfig);
  
  const {
    hasUnsavedChanges,
    currentComposition,
    autosaveComposition,
    markSaved,
    isLoading
  } = useCompositionStore();

  const [autosaveState, setAutosaveState] = useState<AutosaveState>({
    isAutosaving: false,
    lastAutosaveAt: null,
    lastLocalBackupAt: null,
    autosaveEnabled: true,
    error: null,
  });

  // Refs for timers and state
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const periodicTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastChangeTimeRef = useRef<number>(Date.now());

  /**
   * Save to localStorage (instant backup)
   */
  const saveToLocalStorage = useCallback((data: IDesign) => {
    if (!mergedConfig.enableLocalStorage || !LocalStorageService.isAvailable()) {
      return;
    }

    try {
      const workspaceId = currentComposition?.id || 'untitled';
      LocalStorageService.saveWorkspace(workspaceId, data);
      
      setAutosaveState(prev => ({
        ...prev,
        lastLocalBackupAt: new Date(),
        error: null
      }));
      
      console.log('[Autosave] Saved to localStorage');
    } catch (error) {
      console.error('[Autosave] localStorage save failed:', error);
      setAutosaveState(prev => ({
        ...prev,
        error: 'Local backup failed'
      }));
    }
  }, [currentComposition?.id, mergedConfig.enableLocalStorage]);

  /**
   * Save to backend (debounced)
   */
  const saveToBackend = useCallback(async (data: IDesign, workspaceName?: string): Promise<boolean> => {
    if (!mergedConfig.enableBackendAutosave) {
      return false;
    }

    // Check if running in iframe - don't attempt backend save if standalone
    if (!parentComm.isRunningInIframe()) {
      console.log('[Autosave] Skipping backend save - running in standalone mode');
      setAutosaveState(prev => ({
        ...prev,
        error: 'Running in standalone mode - backend save disabled'
      }));
      return false;
    }

    if (isLoading) {
      console.log('[Autosave] Skipping - already saving');
      return false;
    }

    setAutosaveState(prev => ({
      ...prev,
      isAutosaving: true,
      error: null
    }));

    try {
      let result;
      
      if (currentComposition) {
        // Update existing composition
        result = await autosaveComposition(data);
      } else {
        // Only create new composition if this is a manual save, not autosave
        console.log('[Autosave] No current composition, but skipping creation during autosave');
        return false; // Don't create new compositions during autosave
      }
      
      if (result) {
        setAutosaveState(prev => ({
          ...prev,
          isAutosaving: false,
          lastAutosaveAt: new Date(),
          error: null
        }));
        
        markSaved();
        retryCountRef.current = 0;
        console.log('[Autosave] Backend save successful');
        return true;
      } else {
        throw new Error('Save composition returned null');
      }
    } catch (error) {
      console.error('[Autosave] Backend save failed:', error);
      
      // Retry logic
      if (retryCountRef.current < mergedConfig.maxRetries) {
        retryCountRef.current++;
        console.log(`[Autosave] Retrying... (${retryCountRef.current}/${mergedConfig.maxRetries})`);
        
        setTimeout(() => {
          saveToBackend(data, workspaceName);
        }, mergedConfig.retryDelay);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Autosave failed after retries';
        setAutosaveState(prev => ({
          ...prev,
          isAutosaving: false,
          error: errorMessage
        }));
        retryCountRef.current = 0;
      }
      
      return false;
    }
  }, [
    mergedConfig.enableBackendAutosave,
    mergedConfig.maxRetries,
    mergedConfig.retryDelay,
    currentComposition,
    autosaveComposition,
    markSaved,
    isLoading
  ]);

  /**
   * Save to localStorage only (fast, instant backup)
   */
  const saveToLocalStorageOnly = useCallback(() => {
    if (!autosaveState.autosaveEnabled) {
      return;
    }

    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };

    console.log('[Autosave] Saving to localStorage (instant backup)');
    saveToLocalStorage(data);
  }, [
    autosaveState.autosaveEnabled,
    saveToLocalStorage
  ]); // Remove stateManager from dependencies to prevent infinite loops

  /**
   * Main autosave function (saves to both localStorage and backend)
   */
  const performAutosave = useCallback(async (forceBackend = false) => {
    console.log('[Autosave] performAutosave called', { autosaveEnabled: autosaveState.autosaveEnabled, forceBackend, currentComposition: !!currentComposition });
    
    if (!autosaveState.autosaveEnabled) {
      console.log('[Autosave] Skipping autosave - disabled');
      return;
    }

    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };

    // Always save to localStorage first (instant)
    saveToLocalStorage(data);

    // Save to backend (for persistence)
    console.log('[Autosave] Saving to backend');
    await saveToBackend(data);
  }, [
    autosaveState.autosaveEnabled,
    saveToLocalStorage,
    saveToBackend,
    currentComposition
  ]); // Remove stateManager from dependencies to prevent infinite loops

  /**
   * Debounced autosave (triggered by changes - saves to localStorage only)
   */
  const debouncedAutosave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    lastChangeTimeRef.current = Date.now();

    debounceTimerRef.current = setTimeout(() => {
      const timeSinceLastChange = Date.now() - lastChangeTimeRef.current;
      
      // Only autosave if no changes for the debounce delay
      // This only saves to localStorage for instant backup
      if (timeSinceLastChange >= mergedConfig.debounceDelay) {
        saveToLocalStorageOnly();
      }
    }, mergedConfig.debounceDelay);
  }, [saveToLocalStorageOnly, mergedConfig.debounceDelay]);

  /**
   * Periodic autosave (every X seconds)
   */
  const startPeriodicAutosave = useCallback(() => {
    if (periodicTimerRef.current) {
      clearInterval(periodicTimerRef.current);
    }

    periodicTimerRef.current = setInterval(() => {
      if (hasUnsavedChanges && autosaveState.autosaveEnabled) {
        performAutosaveRef.current();
      }
    }, mergedConfig.periodicInterval);
  }, [hasUnsavedChanges, autosaveState.autosaveEnabled, mergedConfig.periodicInterval]); // Remove performAutosave from dependencies

  /**
   * Handle page unload (emergency save)
   */
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges && autosaveState.autosaveEnabled) {
      // Save to localStorage immediately
      const data: IDesign = {
        id: generateId(),
        ...stateManager.getState(),
      };
      saveToLocalStorage(data);
      
      // Try to save to backend synchronously (limited time)
      if (currentComposition) {
        // Note: This is a best-effort save, may not complete
        navigator.sendBeacon('/api/autosave', JSON.stringify({
          compositionId: currentComposition.id,
          data
        }));
      }
    }
  }, [hasUnsavedChanges, autosaveState.autosaveEnabled, saveToLocalStorage, currentComposition]); // Remove stateManager from dependencies

  /**
   * Handle visibility change (tab switch)
   */
  const performAutosaveRef = useRef(performAutosave);
  
  // Update the ref whenever performAutosave changes
  useEffect(() => {
    performAutosaveRef.current = performAutosave;
  }, [performAutosave]);
  
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && hasUnsavedChanges && autosaveState.autosaveEnabled) {
      // Save when tab becomes hidden
      performAutosaveRef.current();
    }
  }, [hasUnsavedChanges, autosaveState.autosaveEnabled]); // Remove performAutosave from dependencies

  // Effect to trigger debounced autosave on changes
  // Only trigger when hasUnsavedChanges becomes true
  const prevHasUnsavedChangesRef = useRef(false);
  const debouncedAutosaveRef = useRef(debouncedAutosave);
  
  // Update the ref whenever debouncedAutosave changes
  useEffect(() => {
    debouncedAutosaveRef.current = debouncedAutosave;
  }, [debouncedAutosave]);
  
  useEffect(() => {
    // Only trigger autosave when transitioning from saved to unsaved
    if (hasUnsavedChanges && !prevHasUnsavedChangesRef.current && autosaveState.autosaveEnabled) {
      console.log('[Autosave] Changes detected, triggering debounced autosave');
      debouncedAutosaveRef.current();
    }
    prevHasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges, autosaveState.autosaveEnabled]); // Remove debouncedAutosave from dependencies

  // Effect to start/stop periodic autosave
  useEffect(() => {
    if (autosaveState.autosaveEnabled) {
      startPeriodicAutosave();
    } else {
      if (periodicTimerRef.current) {
        clearInterval(periodicTimerRef.current);
      }
    }

    return () => {
      if (periodicTimerRef.current) {
        clearInterval(periodicTimerRef.current);
      }
    };
  }, [autosaveState.autosaveEnabled, startPeriodicAutosave]);

  // Effect to trigger periodic backend autosave
  useEffect(() => {
    if (!autosaveState.autosaveEnabled) return;

    const interval = setInterval(() => {
      console.log(`[Autosave] Periodic backend autosave triggered (every ${mergedConfig.periodicInterval / 1000}s)`);
      performAutosaveRef.current();
    }, mergedConfig.periodicInterval);

    return () => clearInterval(interval);
  }, [autosaveState.autosaveEnabled, mergedConfig.periodicInterval]); // Remove performAutosave from dependencies

  // Effect to set up event listeners
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleBeforeUnload, handleVisibilityChange]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (periodicTimerRef.current) {
        clearInterval(periodicTimerRef.current);
      }
    };
  }, []);

  /**
   * Manual autosave trigger
   */
  const triggerAutosave = useCallback(() => {
    performAutosave(true);
  }, [performAutosave]);

  /**
   * Toggle autosave on/off
   */
  const toggleAutosave = useCallback((enabled: boolean) => {
    setAutosaveState(prev => ({
      ...prev,
      autosaveEnabled: enabled
    }));
  }, []);

  /**
   * Clear autosave error
   */
  const clearError = useCallback(() => {
    setAutosaveState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    // State
    ...autosaveState,
    
    // Actions
    triggerAutosave,
    toggleAutosave,
    clearError,
    
    // Utils
    getLastSavedTime: () => autosaveState.lastAutosaveAt,
    getLastBackupTime: () => autosaveState.lastLocalBackupAt,
    isLocalStorageAvailable: LocalStorageService.isAvailable(),
  };
};
