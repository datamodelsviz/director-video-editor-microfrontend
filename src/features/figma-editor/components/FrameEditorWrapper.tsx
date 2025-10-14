import React, { useRef, useEffect, useState } from 'react';
import { Frame } from '../types';
import StateManager from "@designcombo/state";
import Timeline from '../../editor/timeline';
import { RightDrawer } from '../../editor/components';
import Scene from '../../editor/scene';
import useStore from '../../editor/store/use-store';
import HorizontalMediaToolbar from '../../editor/horizontal-media-toolbar';
import MenuList from '../../editor/menu-list';
import { MenuItem } from '../../editor/menu-item';
import FloatingControl from '../../editor/control-item/floating-controls/floating-control';
import CropModal from '../../editor/crop-modal/crop-modal';
import useLayoutStore from '../../editor/store/use-layout-store';
import useTimelineEvents from '../../editor/hooks/use-timeline-events';
import { 
  frameToStateManagerData, 
  updateFrameFromStateManager 
} from '../utils/stateManagerConverter';

interface FrameEditorWrapperProps {
  frame: Frame;
  onFrameUpdate: (frameId: string, updates: Partial<Frame>) => void;
  onExitFocus: () => void;
  onLayerSelect: (layerId: string) => void;
  selectedLayerIds: string[];
}

export const FrameEditorWrapper: React.FC<FrameEditorWrapperProps> = ({
  frame,
  onFrameUpdate,
  onExitFocus,
  onLayerSelect,
  selectedLayerIds
}) => {
  const { playerRef, activeIds, trackItemsMap } = useStore();
  const { isSidebarHovered, setIsSidebarHovered } = useLayoutStore();
  const [stateManagerInitialized, setStateManagerInitialized] = useState(false);
  
  // Debug: Log when activeIds or trackItemsMap changes
  useEffect(() => {
    console.log('FrameEditorWrapper: Zustand store updated:', {
      activeIds,
      trackItemsMapKeys: Object.keys(trackItemsMap),
      selectedItem: activeIds.length > 0 ? trackItemsMap[activeIds[0]] : null
    });
  }, [activeIds, trackItemsMap]);

  // Debug: Log StateManager state changes
  useEffect(() => {
    if (!stateManagerRef.current) return;
    
    const subscription = stateManagerRef.current.subscribe((state: any) => {
      console.log('FrameEditorWrapper: StateManager state changed:', {
        activeIds: state.activeIds,
        trackItemsMapKeys: Object.keys(state.trackItemsMap || {}),
        hasChanges: Object.keys(state).length > 0
      });
      
      // Debug: Check if position changes are in the trackItemsMap
      if (state.trackItemsMap) {
        Object.values(state.trackItemsMap).forEach((item: any) => {
          if (item.details && (item.details.left || item.details.top)) {
            console.log('FrameEditorWrapper: Position change detected:', {
              id: item.id,
              left: item.details.left,
              top: item.details.top
            });
          }
          if (item.details && item.details.transform) {
            console.log('FrameEditorWrapper: Transform change detected:', {
              id: item.id,
              transform: item.details.transform
            });
          }
        });
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [stateManagerInitialized]);
  
  // Create a state manager for this frame
  const stateManagerRef = useRef<StateManager | null>(null);

  // Initialize StateManager early (before hooks)
  if (!stateManagerRef.current) {
    const initialState = frameToStateManagerData(frame);
    stateManagerRef.current = new StateManager(initialState);
  }

  // Initialize timeline events (coordinates player with timeline)
  useTimelineEvents();
  
  // NOTE: We do NOT call useStateManagerEvents here!
  // Timeline component already calls it when we pass stateManager as prop
  // Calling it twice causes the duplicate protection to block the second call

  // Initialize StateManager state once
  useEffect(() => {
    if (!stateManagerInitialized) {
      const initialState = frameToStateManagerData(frame);
      console.log('FrameEditorWrapper: Initializing StateManager with state:', {
        trackItemIds: initialState.trackItemIds,
        trackItemsMapKeys: Object.keys(initialState.trackItemsMap || {}),
        activeIds: initialState.activeIds
      });
      
      stateManagerRef.current!.updateState(initialState);
      setStateManagerInitialized(true);
      
      // Sync with Zustand store
      const { setState } = useStore.getState();
      setState(initialState);
      
      console.log('FrameEditorWrapper: Synced to Zustand store');
    }
  }, [stateManagerInitialized]);

  // Sync frame changes to StateManager
  useEffect(() => {
    if (stateManagerRef.current && stateManagerInitialized) {
      const currentState = stateManagerRef.current.getState();
      const newState = frameToStateManagerData(frame);
      
      // Preserve activeIds to prevent clearing selection
      if (currentState.activeIds && currentState.activeIds.length > 0) {
        newState.activeIds = currentState.activeIds;
      }
      
      // Only update if there are actual changes
      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        stateManagerRef.current.updateState(newState);
        const { setState } = useStore.getState();
        setState(newState);
      }
    }
  }, [frame, stateManagerInitialized]);

  // Sync StateManager changes back to frame
  useEffect(() => {
    if (!stateManagerRef.current || !stateManagerInitialized) return;

    // Subscribe to state changes
    const subscription = stateManagerRef.current.subscribe((state: any) => {
      // Update frame with current state, but debounce to avoid too many updates
      const updates = updateFrameFromStateManager(frame, state);
      
      // Only update if there are meaningful changes (not just activeIds changes)
      if (Object.keys(updates).length > 0) {
        onFrameUpdate(frame.id, updates);
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [frame.id, stateManagerInitialized]);

  // Handle click outside to hide sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.sidebar-container') && !target.closest('.floating-panel')) {
        setIsSidebarHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsSidebarHovered]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Save final state before unmounting
      if (stateManagerRef.current && stateManagerInitialized) {
        const finalState = stateManagerRef.current.getState();
        const updates = updateFrameFromStateManager(frame, finalState);
        onFrameUpdate(frame.id, updates);
      }
      
      // Reset sidebar state
      setIsSidebarHovered(false);
    };
  }, [stateManagerInitialized]);

  // Don't render until StateManager is initialized
  if (!stateManagerRef.current || !stateManagerInitialized) {
    return (
      <div className="frame-editor-wrapper h-full w-full flex items-center justify-center" style={{ background: 'var(--bg-canvas)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Initializing frame editor...</div>
      </div>
    );
  }

  return (
    <div className="frame-editor-wrapper h-full w-full flex flex-col" style={{ background: 'var(--bg-canvas)' }}>
      {/* Frame Header */}
      <div 
        className="h-12 flex items-center justify-between px-4"
        style={{ 
          background: 'var(--bg-panel)', 
          borderBottom: '1px solid var(--stroke)' 
        }}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={onExitFocus}
            className="btn"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}
          >
            <span>←</span>
            <span>Back to Board</span>
            <kbd className="kbd">Esc</kbd>
          </button>
          <div style={{ width: 1, height: 16, background: 'var(--stroke)' }} />
          <h2 style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {frame.name}
          </h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', fontSize: 'var(--fs-12)', color: 'var(--text-secondary)' }}>
          <span>{frame.size.w}×{frame.size.h}</span>
          <span>•</span>
          <span>{frame.duration}s</span>
          <span>•</span>
          <span>{frame.fps}fps</span>
          <span>•</span>
          <span>{frame.layers.length} layers</span>
        </div>
      </div>

      {/* Horizontal Media Toolbar */}
      <HorizontalMediaToolbar />

      {/* Floating panel for media library */}
      <div className="relative">
        <div 
          className={`floating-panel fixed left-4 top-[120px] z-[9999] transition-all duration-200 ${
            isSidebarHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-zinc-900 border border-border/80 rounded-lg shadow-xl min-w-[280px] max-w-[320px] h-[calc(100vh-140px)] overflow-hidden">
            <div className="h-full overflow-y-auto">
              <MenuItem />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Real Editor */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Canvas Area with Scene */}
          <div className="flex-1 relative overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
            <FloatingControl />
            <CropModal />
            <Scene stateManager={stateManagerRef.current} />
          </div>

          {/* Timeline Dock */}
          <div 
            className="timeline-dock"
            style={{ 
              height: 280,
              borderTop: '1px solid var(--stroke-strong)',
              background: 'var(--bg-panel)'
            }}
          >
            {playerRef && (
              <Timeline stateManager={stateManagerRef.current} />
            )}
          </div>
        </div>

        {/* Right Drawer - Properties Panel */}
        <RightDrawer />
      </div>
    </div>
  );
};
