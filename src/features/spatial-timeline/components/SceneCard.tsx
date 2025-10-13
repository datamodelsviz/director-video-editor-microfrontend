import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Scene, TimelineElement } from '../SpatialTimeline';
import { ElementCard } from './ElementCard';

interface SceneCardProps {
  scene: Scene;
  isSelected: boolean;
  onSelect: () => void;
  onElementSelect: (elementId: string) => void;
  onMove: (position: { x: number; y: number }) => void;
  onElementEdit: (elementId: string) => void;
  selectedElementId: string | null;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  isSelected,
  onSelect,
  onElementSelect,
  onMove,
  onElementEdit,
  selectedElementId
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === cardRef.current || (e.target as HTMLElement).closest('.scene-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - scene.position.x,
        y: e.clientY - scene.position.y
      });
      onSelect();
    }
  }, [scene.position, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      onMove(newPosition);
    }
  }, [isDragging, dragStart, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎬';
      case 'audio': return '🎵';
      case 'text': return '📝';
      case 'image': return '🖼️';
      default: return '📄';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={cardRef}
      className={`absolute bg-gray-800 border-2 rounded-lg shadow-lg transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 shadow-blue-500/20' 
          : 'border-gray-600 hover:border-gray-500'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: scene.position.x,
        top: scene.position.y,
        width: scene.size.width,
        minHeight: isExpanded ? 'auto' : '60px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Scene Header */}
      <div className="scene-header p-3 border-b border-gray-700 bg-gray-750 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <h3 className="font-semibold text-white">{scene.name}</h3>
            <span className="text-xs text-gray-400">
              {formatTime(scene.startTime)} - {formatTime(scene.startTime + scene.duration)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-400">
              {scene.elements.length} elements
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Scene Content */}
      {isExpanded && (
        <div className="p-3 space-y-2">
          {/* Elements by Layer */}
          {[4, 3, 2, 1].map(layer => {
            const layerElements = scene.elements.filter(el => el.layer === layer);
            if (layerElements.length === 0) return null;

            return (
              <div key={layer} className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">
                  Layer {layer}
                </div>
                {layerElements.map((element) => (
                  <ElementCard
                    key={element.id}
                    element={element}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => onElementSelect(element.id)}
                    onEdit={() => onElementEdit(element.id)}
                    sceneStartTime={scene.startTime}
                  />
                ))}
              </div>
            );
          })}

          {/* Add Element Button */}
          <button className="w-full p-2 border border-dashed border-gray-600 rounded text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
            + Add Element
          </button>
        </div>
      )}

      {/* Scene Footer */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-750 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Duration: {formatTime(scene.duration)}</span>
          <div className="flex items-center space-x-2">
            <button className="hover:text-white transition-colors">⚙️</button>
            <button className="hover:text-white transition-colors">📊</button>
            <button className="hover:text-white transition-colors">🔗</button>
          </div>
        </div>
      </div>
    </div>
  );
};
