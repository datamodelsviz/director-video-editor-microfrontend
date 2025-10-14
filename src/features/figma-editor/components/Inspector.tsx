import React, { useState, useCallback } from 'react';
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
  onFrameSelect: (frameId: string, multiSelect?: boolean) => void;
  onFrameReorder: (fromIndex: number, toIndex: number) => void;
  focusedFrame: Frame | null;
}

export const Inspector: React.FC<InspectorProps> = ({
  state,
  onStateChange,
  project,
  editorState,
  onFrameUpdate,
  onFrameSelect,
  onFrameReorder,
  focusedFrame
}) => {
  const tabs: Array<{ id: InspectorTab; label: string }> = [
    { id: 'frame', label: 'Frame' },
    { id: 'layers', label: 'Layers' }
  ];

  const selectedFrame = state.selectedItem?.type === 'frame' 
    ? project.frames.find(f => f.id === state.selectedItem?.id)
    : focusedFrame;

  // Drag and drop state
  const [draggedFrameId, setDraggedFrameId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Get frames in sequence order
  const orderedFrames = project.sequence.order
    .map(frameId => project.frames.find(f => f.id === frameId))
    .filter(Boolean) as Frame[];

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, frameId: string) => {
    setDraggedFrameId(frameId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedFrameId) {
      const draggedIndex = orderedFrames.findIndex(f => f.id === draggedFrameId);
      if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
        onFrameReorder(draggedIndex, dropIndex);
      }
    }
    
    setDraggedFrameId(null);
    setDragOverIndex(null);
  }, [draggedFrameId, orderedFrames, onFrameReorder]);

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
            {editorState.mode === 'board' ? (
              // Board mode: Show all frames with drag-and-drop
              <>
                <h3 style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Frames ({orderedFrames.length})
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {orderedFrames.map((frame, index) => (
                    <div
                      key={frame.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, frame.id)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onClick={() => onFrameSelect(frame.id)}
                      style={{
                        padding: 'var(--space-8)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        background: editorState.selectedFrameIds.includes(frame.id) 
                          ? 'var(--bg-elev-2)' 
                          : dragOverIndex === index 
                            ? 'var(--bg-elev-1)' 
                            : 'transparent',
                        border: editorState.selectedFrameIds.includes(frame.id) 
                          ? '1px solid var(--accent)' 
                          : dragOverIndex === index 
                            ? '1px solid var(--accent)' 
                            : '1px solid transparent',
                        transition: 'all var(--dur-1) var(--ease-standard)',
                        opacity: draggedFrameId === frame.id ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!editorState.selectedFrameIds.includes(frame.id) && dragOverIndex !== index) {
                          e.currentTarget.style.background = 'var(--bg-elev-1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!editorState.selectedFrameIds.includes(frame.id) && dragOverIndex !== index) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
                        <div 
                          style={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            background: frame.labelColor === 'purple' ? '#9747FF' :
                                        frame.labelColor === 'blue' ? '#18a0fb' :
                                        frame.labelColor === 'green' ? '#2ecc71' :
                                        frame.labelColor === 'red' ? '#ff5a52' :
                                        frame.labelColor === 'yellow' ? '#ffcc00' : '#18a0fb',
                            flexShrink: 0
                          }} 
                        />
                        <div style={{ fontSize: 'var(--fs-12)', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {frame.name}
                        </div>
                      </div>
                      <div style={{ fontSize: 'var(--fs-11)', color: 'var(--text-tertiary)' }}>
                        {frame.size.w}×{frame.size.h} • {frame.duration}s • {frame.layers.length} layers
                      </div>
                    </div>
                  ))}
                </div>

                {/* Frame Properties (when frame is selected) */}
                {selectedFrame && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', marginTop: 'var(--space-16)', paddingTop: 'var(--space-16)', borderTop: '1px solid var(--stroke)' }}>
                    <h4 style={{ fontSize: 'var(--fs-12)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Frame Properties
                    </h4>
                    
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
                  </div>
                )}
              </>
            ) : (
              // Frame mode: Show focused frame properties
              <>
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
                  </div>
                ) : (
                  <div style={{ fontSize: 'var(--fs-12)', color: 'var(--text-tertiary)' }}>
                    No frame selected
                  </div>
                )}
              </>
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

      </div>
    </div>
  );
};
