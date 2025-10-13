import React from 'react';
import { Scene } from '../SpatialTimeline';

interface ContextualToolbarProps {
  selectedSceneId: string | null;
  selectedElementId: string | null;
  scenes: Scene[];
  onAddElement: () => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
}

export const ContextualToolbar: React.FC<ContextualToolbarProps> = ({
  selectedSceneId,
  selectedElementId,
  scenes,
  onAddElement,
  onDeleteElement,
  onDuplicateElement
}) => {
  const selectedScene = scenes.find(s => s.id === selectedSceneId);
  const selectedElement = selectedScene?.elements.find(e => e.id === selectedElementId);

  if (!selectedSceneId && !selectedElementId) {
    return (
      <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-center">
        <div className="text-gray-400 text-sm">
          Select a scene or element to see available actions
        </div>
      </div>
    );
  }

  if (selectedElementId && selectedElement) {
    return (
      <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Selected:</span>
            <span className="text-white font-medium">{selectedElement.name}</span>
            <span className="text-xs text-gray-500">({selectedElement.type})</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onAddElement}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            + Add Element
          </button>
          <button
            onClick={onDuplicateElement}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
          >
            📋 Duplicate
          </button>
          <button
            onClick={onDeleteElement}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    );
  }

  if (selectedSceneId && selectedScene) {
    return (
      <div className="h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Selected Scene:</span>
            <span className="text-white font-medium">{selectedScene.name}</span>
            <span className="text-xs text-gray-500">
              ({selectedScene.elements.length} elements)
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onAddElement}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            + Add Element
          </button>
          <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors">
            📋 Duplicate Scene
          </button>
          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
            🗑️ Delete Scene
          </button>
        </div>
      </div>
    );
  }

  return null;
};
