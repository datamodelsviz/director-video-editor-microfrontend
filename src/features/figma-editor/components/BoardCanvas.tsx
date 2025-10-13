import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Project, EditorState, Frame } from '../types';
import { FramePreview } from './FramePreview';
import { Rulers } from './Rulers';
import { Guides } from './Guides';
import { SelectionBox } from './SelectionBox';

interface BoardCanvasProps {
  project: Project;
  editorState: EditorState;
  onFrameSelect: (frameId: string, multiSelect?: boolean) => void;
  onFrameFocus: (frameId: string) => void;
  onCreateFrame: (position: { x: number; y: number }, size: { w: number; h: number }) => void;
  onFrameUpdate: (frameId: string, updates: Partial<Frame>) => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({
  project,
  editorState,
  onFrameSelect,
  onFrameFocus,
  onCreateFrame,
  onFrameUpdate
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isCreatingFrame, setIsCreatingFrame] = useState(false);
  const [frameCreationStart, setFrameCreationStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, editorState.boardState.zoom * delta));
    
    // Update board state
    const newBoardState = {
      ...editorState.boardState,
      zoom: newZoom
    };
    
    // Update editor state
    // This would be handled by the parent component
  }, [editorState.boardState.zoom]);

  // Handle mouse down for panning, frame creation, and selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / editorState.boardState.zoom - editorState.boardState.scroll.x;
    const y = (e.clientY - rect.top) / editorState.boardState.zoom - editorState.boardState.scroll.y;

    // Handle different tools
    if (editorState.currentTool === 'hand' || (e.button === 1) || (e.button === 0 && e.metaKey)) {
      // Pan mode
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (editorState.currentTool === 'frame') {
      // Frame creation mode
      setIsCreatingFrame(true);
      setFrameCreationStart({ x, y });
    } else if (editorState.currentTool === 'move') {
      // Selection mode
      const clickedFrame = getFrameAtPosition(x, y);
      if (clickedFrame) {
        onFrameSelect(clickedFrame.id, e.shiftKey);
      } else {
        // Start selection box
        setSelectionBox({ x, y, width: 0, height: 0 });
      }
    }
  }, [editorState, onFrameSelect]);

  // Handle mouse move for panning, frame creation, and selection box
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      const newBoardState = {
        ...editorState.boardState,
        scroll: {
          x: editorState.boardState.scroll.x - dx / editorState.boardState.zoom,
          y: editorState.boardState.scroll.y - dy / editorState.boardState.zoom
        }
      };
      
      // Update board state
    } else if (isCreatingFrame && frameCreationStart) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / editorState.boardState.zoom - editorState.boardState.scroll.x;
      const y = (e.clientY - rect.top) / editorState.boardState.zoom - editorState.boardState.scroll.y;

      const width = Math.abs(x - frameCreationStart.x);
      const height = Math.abs(y - frameCreationStart.y);

      // Update selection box to show frame creation preview
      setSelectionBox({
        x: Math.min(x, frameCreationStart.x),
        y: Math.min(y, frameCreationStart.y),
        width,
        height
      });
    } else if (selectionBox && editorState.currentTool === 'move') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / editorState.boardState.zoom - editorState.boardState.scroll.x;
      const y = (e.clientY - rect.top) / editorState.boardState.zoom - editorState.boardState.scroll.y;

      setSelectionBox(prev => prev ? {
        ...prev,
        width: x - prev.x,
        height: y - prev.y
      } : null);
    }
  }, [isPanning, panStart, isCreatingFrame, frameCreationStart, selectionBox, editorState]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isCreatingFrame && frameCreationStart && selectionBox) {
      // Create frame
      const size = {
        w: Math.max(100, selectionBox.width),
        h: Math.max(100, selectionBox.height)
      };
      
      onCreateFrame(
        { x: selectionBox.x, y: selectionBox.y },
        size
      );
    }

    setIsPanning(false);
    setIsCreatingFrame(false);
    setFrameCreationStart(null);
    setSelectionBox(null);
  }, [isCreatingFrame, frameCreationStart, selectionBox, onCreateFrame]);

  // Get frame at position
  const getFrameAtPosition = useCallback((x: number, y: number): Frame | null => {
    return project.frames.find(frame => {
      return x >= frame.position.x &&
             x <= frame.position.x + frame.size.w &&
             y >= frame.position.y &&
             y <= frame.position.y + frame.size.h;
    }) || null;
  }, [project.frames]);

  // Handle double click to focus frame
  const handleFrameDoubleClick = useCallback((frameId: string) => {
    onFrameFocus(frameId);
  }, [onFrameFocus]);

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={canvasRef}
      className="board-canvas w-full h-full relative overflow-hidden bg-gray-50"
      onMouseDown={handleMouseDown}
      style={{
        cursor: editorState.currentTool === 'hand' ? 'grab' : 
                editorState.currentTool === 'frame' ? 'crosshair' :
                'default'
      }}
    >
      {/* Rulers */}
      {editorState.boardState.rulers && (
        <Rulers
          zoom={editorState.boardState.zoom}
          scroll={editorState.boardState.scroll}
        />
      )}

      {/* Canvas Content */}
      <div
        className="absolute"
        style={{
          transform: `translate(${editorState.boardState.scroll.x}px, ${editorState.boardState.scroll.y}px) scale(${editorState.boardState.zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Guides */}
        <Guides
          guides={project.board.guides}
          zoom={editorState.boardState.zoom}
        />

        {/* Frame Previews */}
        {project.frames.map(frame => (
          <FramePreview
            key={frame.id}
            frame={frame}
            isSelected={editorState.selectedFrameIds.includes(frame.id)}
            onSelect={() => onFrameSelect(frame.id)}
            onDoubleClick={() => handleFrameDoubleClick(frame.id)}
            onUpdate={(updates) => onFrameUpdate(frame.id, updates)}
            zoom={editorState.boardState.zoom}
          />
        ))}

        {/* Selection Box */}
        {selectionBox && (
          <SelectionBox
            x={selectionBox.x}
            y={selectionBox.y}
            width={selectionBox.width}
            height={selectionBox.height}
            isCreating={isCreatingFrame}
          />
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => {
            const newZoom = Math.min(5, editorState.boardState.zoom * 1.2);
            // Update zoom
          }}
          className="w-8 h-8 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          +
        </button>
        <button
          onClick={() => {
            const newZoom = Math.max(0.1, editorState.boardState.zoom * 0.8);
            // Update zoom
          }}
          className="w-8 h-8 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          -
        </button>
        <button
          onClick={() => {
            // Reset zoom to 100%
          }}
          className="w-8 h-8 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-xs"
        >
          1:1
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-700">
        {Math.round(editorState.boardState.zoom * 100)}%
      </div>
    </div>
  );
};
