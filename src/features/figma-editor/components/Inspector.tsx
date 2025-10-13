import React from 'react';
import { Project, EditorState, InspectorTab, Frame } from '../types';

interface InspectorProps {
  state: {
    activeTab: InspectorTab;
    selectedItem: { type: 'frame' | 'layer'; id: string } | null;
  };
  onStateChange: (state: any) => void;
  project: Project;
  editorState: EditorState;
  onFrameUpdate: (frameId: string, updates: Partial<Frame>) => void;
  focusedFrame: Frame | null;
}

export const Inspector: React.FC<InspectorProps> = ({
  state,
  onStateChange,
  project,
  editorState,
  onFrameUpdate,
  focusedFrame
}) => {
  const tabs: Array<{ id: InspectorTab; label: string }> = [
    { id: 'frame', label: 'Frame' },
    { id: 'layers', label: 'Layers' },
    { id: 'properties', label: 'Properties' },
    { id: 'timeline', label: 'Timeline' }
  ];

  const selectedFrame = state.selectedItem?.type === 'frame' 
    ? project.frames.find(f => f.id === state.selectedItem?.id)
    : focusedFrame;

  return (
    <div 
      className="sidebar"
      style={{
        width: 320,
        borderLeft: '1px solid var(--stroke)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Tab Headers */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--stroke)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onStateChange({ ...state, activeTab: tab.id })}
            style={{
              flex: 1,
              padding: 'var(--space-8) var(--space-12)',
              fontSize: 'var(--fs-12)',
              fontWeight: 500,
              background: state.activeTab === tab.id ? 'var(--bg-elev-1)' : 'transparent',
              color: state.activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: state.activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--dur-1) var(--ease-standard)',
              border: 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-16)' }}>
        {state.activeTab === 'frame' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <h3 style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Frame Properties
            </h3>
            
            {selectedFrame ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedFrame.name}
                    onChange={(e) => onFrameUpdate(selectedFrame.id, { name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--space-6) var(--space-8)',
                      fontSize: 'var(--fs-12)',
                      background: 'var(--bg-elev-1)',
                      border: '1px solid var(--stroke)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                {/* Size */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                      Width
                    </label>
                    <input
                      type="number"
                      value={selectedFrame.size.w}
                      onChange={(e) => onFrameUpdate(selectedFrame.id, { 
                        size: { ...selectedFrame.size, w: parseInt(e.target.value) || 0 }
                      })}
                      style={{
                        width: '100%',
                        padding: 'var(--space-6) var(--space-8)',
                        fontSize: 'var(--fs-12)',
                        background: 'var(--bg-elev-1)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                      Height
                    </label>
                    <input
                      type="number"
                      value={selectedFrame.size.h}
                      onChange={(e) => onFrameUpdate(selectedFrame.id, { 
                        size: { ...selectedFrame.size, h: parseInt(e.target.value) || 0 }
                      })}
                      style={{
                        width: '100%',
                        padding: 'var(--space-6) var(--space-8)',
                        fontSize: 'var(--fs-12)',
                        background: 'var(--bg-elev-1)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>

                {/* Duration & FPS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                      Duration (s)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedFrame.duration}
                      onChange={(e) => onFrameUpdate(selectedFrame.id, { duration: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: 'var(--space-6) var(--space-8)',
                        fontSize: 'var(--fs-12)',
                        background: 'var(--bg-elev-1)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                      FPS
                    </label>
                    <input
                      type="number"
                      value={selectedFrame.fps}
                      onChange={(e) => onFrameUpdate(selectedFrame.id, { fps: parseInt(e.target.value) || 30 })}
                      style={{
                        width: '100%',
                        padding: 'var(--space-6) var(--space-8)',
                        fontSize: 'var(--fs-12)',
                        background: 'var(--bg-elev-1)',
                        border: '1px solid var(--stroke)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>

                {/* Background */}
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    Background
                  </label>
                  <input
                    type="color"
                    value={selectedFrame.background}
                    onChange={(e) => onFrameUpdate(selectedFrame.id, { background: e.target.value })}
                    style={{
                      width: '100%',
                      height: 32,
                      border: '1px solid var(--stroke)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Focus Button */}
                {editorState.mode === 'board' && (
                  <button
                    onClick={() => {
                      // This would trigger focus
                    }}
                    className="btn btn--primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Focus Frame
                    <kbd className="kbd" style={{ marginLeft: 'var(--space-8)' }}>Enter</kbd>
                  </button>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 'var(--fs-12)', color: 'var(--text-tertiary)' }}>
                Select a frame to edit properties
              </div>
            )}
          </div>
        )}

        {state.activeTab === 'layers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <h3 style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Layers
            </h3>
            <div style={{ fontSize: 'var(--fs-12)', color: 'var(--text-tertiary)' }}>
              {editorState.mode === 'frame' 
                ? 'Your existing layer list will appear here'
                : 'Focus a frame to edit layers'
              }
            </div>
          </div>
        )}

        {state.activeTab === 'properties' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <h3 style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Properties
            </h3>
            <div style={{ fontSize: 'var(--fs-12)', color: 'var(--text-tertiary)' }}>
              {editorState.mode === 'frame' && editorState.selectedLayerIds.length > 0
                ? 'Your existing properties panel will appear here'
                : 'Select a layer to edit properties'
              }
            </div>
          </div>
        )}

        {state.activeTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <h3 style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Timeline
            </h3>
            <div style={{ fontSize: 'var(--fs-12)', color: 'var(--text-tertiary)' }}>
              {editorState.mode === 'frame' 
                ? 'Timeline is shown in the bottom dock'
                : 'Focus a frame to edit timeline'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
