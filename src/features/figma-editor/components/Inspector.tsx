import React from 'react';
import { Project, EditorState, InspectorTab } from '../types';

interface InspectorProps {
  state: {
    activeTab: InspectorTab;
    selectedItem: { type: 'frame' | 'layer'; id: string } | null;
  };
  onStateChange: (state: any) => void;
  project: Project;
  editorState: EditorState;
  onFrameUpdate: (frameId: string, updates: any) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  state,
  onStateChange,
  project,
  editorState,
  onFrameUpdate
}) => {
  const tabs = [
    { id: 'frame', label: 'Frame' },
    { id: 'layers', label: 'Layers' },
    { id: 'properties', label: 'Properties' },
    { id: 'timeline', label: 'Timeline' }
  ];

  const selectedFrame = state.selectedItem?.type === 'frame' 
    ? project.frames.find(f => f.id === state.selectedItem.id)
    : null;

  return (
    <div className="inspector h-full flex flex-col">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onStateChange({ ...state, activeTab: tab.id as InspectorTab })}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              state.activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {state.activeTab === 'frame' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Frame Properties</h3>
            
            {selectedFrame ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedFrame.name}
                    onChange={(e) => onFrameUpdate(selectedFrame.id, { name: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                    <input
                      type="number"
                      value={selectedFrame.size.w}
                      onChange={(e) => onFrameUpdate(selectedFrame.id, { 
                        size: { ...selectedFrame.size, w: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                    <input
                      type="number"
                      value={selectedFrame.size.h}
                      onChange={(e) => onFrameUpdate(selectedFrame.id, { 
                        size: { ...selectedFrame.size, h: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedFrame.duration}
                    onChange={(e) => onFrameUpdate(selectedFrame.id, { duration: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">FPS</label>
                  <input
                    type="number"
                    value={selectedFrame.fps}
                    onChange={(e) => onFrameUpdate(selectedFrame.id, { fps: parseInt(e.target.value) || 30 })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                  <input
                    type="color"
                    value={selectedFrame.background}
                    onChange={(e) => onFrameUpdate(selectedFrame.id, { background: e.target.value })}
                    className="w-full h-8 border border-gray-300 rounded"
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Select a frame to edit properties</div>
            )}
          </div>
        )}

        {state.activeTab === 'layers' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Layers</h3>
            <div className="text-sm text-gray-500">
              {editorState.mode === 'frame' 
                ? 'Layer editing will be available when focused on a frame'
                : 'Enter a frame to edit layers'
              }
            </div>
          </div>
        )}

        {state.activeTab === 'properties' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Properties</h3>
            <div className="text-sm text-gray-500">
              Properties for selected item will appear here
            </div>
          </div>
        )}

        {state.activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Timeline</h3>
            <div className="text-sm text-gray-500">
              {editorState.mode === 'frame' 
                ? 'Timeline editing will be available when focused on a frame'
                : 'Enter a frame to edit timeline'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
