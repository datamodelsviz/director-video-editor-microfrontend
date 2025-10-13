import React, { useState, useRef, useCallback } from 'react';
import { Frame } from '../types';

interface FramePreviewProps {
  frame: Frame;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onUpdate: (updates: Partial<Frame>) => void;
  zoom: number;
}

export const FramePreview: React.FC<FramePreviewProps> = ({
  frame,
  isSelected,
  onSelect,
  onDoubleClick,
  onUpdate,
  zoom
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Handle mouse down for dragging and resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    const handle = target.dataset.handle;
    
    if (handle) {
      // Resize mode
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Drag mode
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    
    onSelect();
  }, [onSelect]);

  // Handle mouse move for dragging and resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      
      onUpdate({
        position: {
          x: frame.position.x + dx,
          y: frame.position.y + dy
        }
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing && resizeHandle) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      
      let newSize = { ...frame.size };
      let newPosition = { ...frame.position };
      
      switch (resizeHandle) {
        case 'nw':
          newSize.w = Math.max(100, frame.size.w - dx);
          newSize.h = Math.max(100, frame.size.h - dy);
          newPosition.x = frame.position.x + dx;
          newPosition.y = frame.position.y + dy;
          break;
        case 'ne':
          newSize.w = Math.max(100, frame.size.w + dx);
          newSize.h = Math.max(100, frame.size.h - dy);
          newPosition.y = frame.position.y + dy;
          break;
        case 'sw':
          newSize.w = Math.max(100, frame.size.w - dx);
          newSize.h = Math.max(100, frame.size.h + dy);
          newPosition.x = frame.position.x + dx;
          break;
        case 'se':
          newSize.w = Math.max(100, frame.size.w + dx);
          newSize.h = Math.max(100, frame.size.h + dy);
          break;
        case 'n':
          newSize.h = Math.max(100, frame.size.h - dy);
          newPosition.y = frame.position.y + dy;
          break;
        case 's':
          newSize.h = Math.max(100, frame.size.h + dy);
          break;
        case 'w':
          newSize.w = Math.max(100, frame.size.w - dx);
          newPosition.x = frame.position.x + dx;
          break;
        case 'e':
          newSize.w = Math.max(100, frame.size.w + dx);
          break;
      }
      
      onUpdate({
        size: newSize,
        position: newPosition
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, isResizing, dragStart, resizeHandle, zoom, frame, onUpdate]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Set up event listeners
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Get label color class
  const getLabelColorClass = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-purple-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      ref={frameRef}
      className={`frame-preview absolute border-2 rounded-lg shadow-lg transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 shadow-blue-500/20' 
          : 'border-gray-300 hover:border-gray-400'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: frame.position.x,
        top: frame.position.y,
        width: frame.size.w,
        height: frame.size.h,
        backgroundColor: frame.background,
        minWidth: 100,
        minHeight: 100
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {/* Frame Name */}
      <div className="absolute top-2 left-2 flex items-center space-x-2 z-10">
        <div className={`w-2 h-2 rounded-full ${getLabelColorClass(frame.labelColor)}`} />
        <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
          {frame.name}
        </span>
      </div>

      {/* Frame Info */}
      <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
        {frame.size.w}×{frame.size.h} • {frame.duration}s • {frame.fps}fps
      </div>

      {/* Resize Handles */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-nw-resize"
            style={{ top: -4, left: -4 }}
            data-handle="nw"
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-ne-resize"
            style={{ top: -4, right: -4 }}
            data-handle="ne"
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-sw-resize"
            style={{ bottom: -4, left: -4 }}
            data-handle="sw"
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-se-resize"
            style={{ bottom: -4, right: -4 }}
            data-handle="se"
          />
          
          {/* Edge handles */}
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-n-resize"
            style={{ top: -4, left: '50%', transform: 'translateX(-50%)' }}
            data-handle="n"
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-s-resize"
            style={{ bottom: -4, left: '50%', transform: 'translateX(-50%)' }}
            data-handle="s"
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-w-resize"
            style={{ left: -4, top: '50%', transform: 'translateY(-50%)' }}
            data-handle="w"
          />
          <div
            className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-e-resize"
            style={{ right: -4, top: '50%', transform: 'translateY(-50%)' }}
            data-handle="e"
          />
        </>
      )}

      {/* Frame Content Preview */}
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-2xl mb-2">🎬</div>
          <div className="text-sm">Frame Preview</div>
          <div className="text-xs mt-1">{frame.layers.length} layers</div>
        </div>
      </div>
    </div>
  );
};
