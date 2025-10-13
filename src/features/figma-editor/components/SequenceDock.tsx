import React, { useState } from 'react';
import { Project } from '../types';

interface SequenceDockProps {
  project: Project;
  onSequenceReorder: (frameIds: string[]) => void;
  onTransitionUpdate: (transition: any) => void;
}

export const SequenceDock: React.FC<SequenceDockProps> = ({
  project,
  onSequenceReorder,
  onTransitionUpdate
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newOrder = [...project.sequence.order];
    const draggedFrameId = newOrder[draggedIndex];
    
    // Remove from old position
    newOrder.splice(draggedIndex, 1);
    
    // Insert at new position
    newOrder.splice(dropIndex, 0, draggedFrameId);
    
    onSequenceReorder(newOrder);
    setDraggedIndex(null);
  };

  const getFrameById = (frameId: string) => {
    return project.frames.find(f => f.id === frameId);
  };

  return (
    <div className="sequence-dock h-full flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Sequence</h3>
        <div className="text-xs text-gray-500 mt-1">
          Drag to reorder • {project.sequence.order.length} frames
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full items-center space-x-2 p-3">
          {project.sequence.order.map((frameId, index) => {
            const frame = getFrameById(frameId);
            if (!frame) return null;

            return (
              <React.Fragment key={frameId}>
                {/* Frame Thumbnail */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex-shrink-0 w-20 h-16 bg-gray-100 border-2 border-gray-300 rounded cursor-move transition-all ${
                    draggedIndex === index ? 'opacity-50' : 'hover:border-gray-400'
                  }`}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs">
                    <div className="font-medium text-gray-700 truncate w-full text-center px-1">
                      {frame.name}
                    </div>
                    <div className="text-gray-500">
                      {frame.duration}s
                    </div>
                  </div>
                </div>

                {/* Transition (if not last frame) */}
                {index < project.sequence.order.length - 1 && (
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-100 border border-blue-200 rounded flex items-center justify-center cursor-pointer hover:bg-blue-200">
                      <span className="text-xs text-blue-600">→</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700">
            ▶️
          </button>
          <button className="w-8 h-8 bg-gray-200 text-gray-600 rounded flex items-center justify-center hover:bg-gray-300">
            ⏸️
          </button>
          <button className="w-8 h-8 bg-gray-200 text-gray-600 rounded flex items-center justify-center hover:bg-gray-300">
            ⏹️
          </button>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={project.sequence.loop}
              onChange={(e) => {
                // Handle loop toggle
              }}
              className="rounded"
            />
            <span>Loop</span>
          </label>
        </div>
      </div>
    </div>
  );
};
