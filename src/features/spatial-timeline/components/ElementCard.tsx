import React from 'react';
import { TimelineElement } from '../SpatialTimeline';

interface ElementCardProps {
  element: TimelineElement;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  sceneStartTime: number;
}

export const ElementCard: React.FC<ElementCardProps> = ({
  element,
  isSelected,
  onSelect,
  onEdit,
  sceneStartTime
}) => {
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

  const getElementColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-500/20 border-red-500/50';
      case 'audio': return 'bg-green-500/20 border-green-500/50';
      case 'text': return 'bg-blue-500/20 border-blue-500/50';
      case 'image': return 'bg-purple-500/20 border-purple-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  const relativeStartTime = element.startTime - sceneStartTime;
  const relativeEndTime = element.endTime - sceneStartTime;

  return (
    <div
      className={`p-2 rounded border cursor-pointer transition-all duration-200 ${getElementColor(element.type)} ${
        isSelected 
          ? 'ring-2 ring-blue-400 ring-opacity-50' 
          : 'hover:opacity-80'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{getElementIcon(element.type)}</span>
          <div>
            <div className="text-sm font-medium text-white truncate max-w-[120px]">
              {element.name}
            </div>
            <div className="text-xs text-gray-400">
              {formatTime(relativeStartTime)} - {formatTime(relativeEndTime)}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Edit element"
          >
            ✏️
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Copy element"
          >
            📋
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Delete element"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {/* Timeline Bar */}
      <div className="mt-2">
        <div className="w-full h-1 bg-gray-700 rounded relative">
          <div
            className="h-full bg-current rounded"
            style={{
              width: `${(element.duration / 10) * 100}%`, // Assuming 10s max duration for visualization
              backgroundColor: element.type === 'video' ? '#ef4444' : 
                              element.type === 'audio' ? '#22c55e' :
                              element.type === 'text' ? '#3b82f6' : '#a855f7'
            }}
          />
        </div>
      </div>
    </div>
  );
};
