import React, { useRef } from 'react';
import { Frame } from '../types';
import StateManager from "@designcombo/state";
import Timeline from '../../editor/timeline';
import { RightDrawer } from '../../editor/components';
import useStore from '../../editor/store/use-store';

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
  const timelinePanelRef = useRef(null);
  const { playerRef } = useStore();

  // Create a state manager for this frame
  const stateManagerRef = useRef<StateManager>(
    new StateManager({
      size: {
        width: frame.size.w,
        height: frame.size.h,
      },
    })
  );

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

      {/* Main Content - Existing Timeline Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas */}
          <div 
            className="flex-1 flex items-center justify-center"
            style={{ background: 'var(--bg-canvas)' }}
          >
            <div 
              style={{
                width: frame.size.w * 0.5,
                height: frame.size.h * 0.5,
                background: frame.background,
                border: '1px solid var(--stroke)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-tertiary)'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                <div style={{ fontSize: 'var(--fs-13)', marginBottom: 8 }}>Frame Canvas</div>
                <div style={{ fontSize: 'var(--fs-11)' }}>
                  Your existing timeline editor will render here
                </div>
                <div style={{ fontSize: 'var(--fs-11)', marginTop: 8, color: 'var(--text-tertiary)' }}>
                  Add media from Gallery or drag & drop
                </div>
              </div>
            </div>
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
        <div style={{ width: 320, borderLeft: '1px solid var(--stroke)' }}>
          <RightDrawer />
        </div>
      </div>
    </div>
  );
};
