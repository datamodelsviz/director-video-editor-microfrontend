import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Project, EditorState, Frame, SNAP_THRESHOLD } from '../types';
import { FramePreview } from './FramePreview';
import { Rulers } from './Rulers';
import { Guides } from './Guides';
import { SelectionBox } from './SelectionBox';

interface BoardViewProps {
  project: Project;
  editorState: EditorState;
  onFrameSelect: (frameId: string, multiSelect?: boolean) => void;
  onFrameFocus: (frameId: string) => void;
  onCreateFrame: (position: { x: number; y: number }, size: { w: number; h: number }) => void;
  onFrameUpdate: (frameId: string, updates: Partial<Frame>) => void;
  onBoardStateChange: (updates: Partial<typeof editorState.boardState>) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  project,
  editorState,
  onFrameSelect,
  onFrameFocus,
  onCreateFrame,
  onFrameUpdate,
  onBoardStateChange
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isCreatingFrame, setIsCreatingFrame] = useState(false);
  const [frameCreationStart, setFrameCreationStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [draggedFrameId, setDraggedFrameId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Convert screen coordinates to board coordinates
  const screenToBoard = useCallback((screenX: number, screenY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    return {
      x: (screenX - rect.left - editorState.boardState.scroll.x) / editorState.boardState.zoom,
      y: (screenY - rect.top - editorState.boardState.scroll.y) / editorState.boardState.zoom
    };
  }, [editorState.boardState.zoom, editorState.boardState.scroll]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, editorState.boardState.zoom * delta));
      
      onBoardStateChange({ zoom: newZoom });
    }
  }, [editorState.boardState.zoom, onBoardStateChange]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const boardPos = screenToBoard(e.clientX, e.clientY);

    // Check if clicking on a frame
    const clickedFrame = project.frames.find(frame => {
      return boardPos.x >= frame.position.x &&
             boardPos.x <= frame.position.x + frame.size.w &&
             boardPos.y >= frame.position.y &&
             boardPos.y <= frame.position.y + frame.size.h;
    });

    // Handle different tools
    if (editorState.currentTool === 'hand' || e.button === 1 || (e.button === 0 && e.spaceKey)) {
      // Pan mode
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    } else if (editorState.currentTool === 'frame') {
      // Frame creation mode
      if (!clickedFrame) {
        setIsCreatingFrame(true);
        setFrameCreationStart(boardPos);
        setSelectionBox({ x: boardPos.x, y: boardPos.y, width: 0, height: 0 });
      }
    } else if (editorState.currentTool === 'move') {
      // Selection mode
      if (clickedFrame) {
        onFrameSelect(clickedFrame.id, e.shiftKey);
        setDraggedFrameId(clickedFrame.id);
        setDragOffset({
          x: boardPos.x - clickedFrame.position.x,
          y: boardPos.y - clickedFrame.position.y
        });
      } else {
        // Start selection box
        if (!e.shiftKey) {
          onFrameSelect('', false); // Clear selection
        }
        setSelectionBox({ x: boardPos.x, y: boardPos.y, width: 0, height: 0 });
      }
    }
  }, [editorState.currentTool, project.frames, screenToBoard, onFrameSelect]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      onBoardStateChange({
        scroll: {
          x: editorState.boardState.scroll.x + dx,
          y: editorState.boardState.scroll.y + dy
        }
      });
      
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (isCreatingFrame && frameCreationStart) {
      const boardPos = screenToBoard(e.clientX, e.clientY);
      
      setSelectionBox({
        x: Math.min(boardPos.x, frameCreationStart.x),
        y: Math.min(boardPos.y, frameCreationStart.y),
        width: Math.abs(boardPos.x - frameCreationStart.x),
        height: Math.abs(boardPos.y - frameCreationStart.y)
      });
    } else if (draggedFrameId) {
      const boardPos = screenToBoard(e.clientX, e.clientY);
      let newX = boardPos.x - dragOffset.x;
      let newY = boardPos.y - dragOffset.y;

      // Apply snapping if enabled
      if (editorState.boardState.snap) {
        const frame = project.frames.find(f => f.id === draggedFrameId);
        if (frame) {
          // Snap to guides
          for (const guide of project.board.guides) {
            if (guide.orientation === 'vertical') {
              if (Math.abs(newX - guide.pos) < SNAP_THRESHOLD) newX = guide.pos;
              if (Math.abs(newX + frame.size.w - guide.pos) < SNAP_THRESHOLD) newX = guide.pos - frame.size.w;
            } else {
              if (Math.abs(newY - guide.pos) < SNAP_THRESHOLD) newY = guide.pos;
              if (Math.abs(newY + frame.size.h - guide.pos) < SNAP_THRESHOLD) newY = guide.pos - frame.size.h;
            }
          }

          // Snap to other frames
          for (const otherFrame of project.frames) {
            if (otherFrame.id === draggedFrameId) continue;
            
            // Vertical snapping
            if (Math.abs(newX - otherFrame.position.x) < SNAP_THRESHOLD) newX = otherFrame.position.x;
            if (Math.abs(newX + frame.size.w - (otherFrame.position.x + otherFrame.size.w)) < SNAP_THRESHOLD) {
              newX = otherFrame.position.x + otherFrame.size.w - frame.size.w;
            }
            
            // Horizontal snapping
            if (Math.abs(newY - otherFrame.position.y) < SNAP_THRESHOLD) newY = otherFrame.position.y;
            if (Math.abs(newY + frame.size.h - (otherFrame.position.y + otherFrame.size.h)) < SNAP_THRESHOLD) {
              newY = otherFrame.position.y + otherFrame.size.h - frame.size.h;
            }
          }
        }
      }

      onFrameUpdate(draggedFrameId, {
        position: { x: newX, y: newY }
      });
    } else if (selectionBox && !isCreatingFrame) {
      const boardPos = screenToBoard(e.clientX, e.clientY);
      
      setSelectionBox(prev => prev ? {
        x: prev.x,
        y: prev.y,
        width: boardPos.x - prev.x,
        height: boardPos.y - prev.y
      } : null);
    }
  }, [isPanning, panStart, isCreatingFrame, frameCreationStart, draggedFrameId, dragOffset, selectionBox, 
      screenToBoard, onBoardStateChange, onFrameUpdate, editorState.boardState, project]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isCreatingFrame && frameCreationStart && selectionBox) {
      // Create frame
      const size = {
        w: Math.max(100, Math.abs(selectionBox.width)),
        h: Math.max(100, Math.abs(selectionBox.height))
      };
      
      const position = {
        x: selectionBox.width >= 0 ? selectionBox.x : selectionBox.x + selectionBox.width,
        y: selectionBox.height >= 0 ? selectionBox.y : selectionBox.y + selectionBox.height
      };
      
      onCreateFrame(position, size);
    } else if (selectionBox && !isCreatingFrame && !draggedFrameId) {
      // Multi-select frames within selection box
      const box = {
        x: Math.min(selectionBox.x, selectionBox.x + selectionBox.width),
        y: Math.min(selectionBox.y, selectionBox.y + selectionBox.height),
        w: Math.abs(selectionBox.width),
        h: Math.abs(selectionBox.height)
      };

      project.frames.forEach(frame => {
        const frameInBox = 
          frame.position.x + frame.size.w > box.x &&
          frame.position.x < box.x + box.w &&
          frame.position.y + frame.size.h > box.y &&
          frame.position.y < box.y + box.h;

        if (frameInBox) {
          onFrameSelect(frame.id, true);
        }
      });
    }

    setIsPanning(false);
    setIsCreatingFrame(false);
    setFrameCreationStart(null);
    setSelectionBox(null);
    setDraggedFrameId(null);
  }, [isCreatingFrame, frameCreationStart, selectionBox, draggedFrameId, onCreateFrame, onFrameSelect, project.frames]);

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

  // Get cursor style
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    if (editorState.currentTool === 'hand') return 'grab';
    if (editorState.currentTool === 'frame') return 'crosshair';
    if (editorState.currentTool === 'text') return 'text';
    if (editorState.currentTool === 'pen') return 'crosshair';
    return 'default';
  };

  return (
    <div
      ref={canvasRef}
      className="board w-full h-full relative overflow-hidden"
      onMouseDown={handleMouseDown}
      style={{ cursor: getCursorStyle() }}
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
        className="absolute inset-0"
        style={{
          transform: `translate(${editorState.boardState.scroll.x}px, ${editorState.boardState.scroll.y}px)`,
          transformOrigin: '0 0'
        }}
      >
        <div
          style={{
            transform: `scale(${editorState.boardState.zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%'
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
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => {
            const newZoom = Math.min(5, editorState.boardState.zoom * 1.2);
            onBoardStateChange({ zoom: newZoom });
          }}
          className="btn btn--icon"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)' }}
        >
          +
        </button>
        <button
          onClick={() => {
            const newZoom = Math.max(0.1, editorState.boardState.zoom * 0.8);
            onBoardStateChange({ zoom: newZoom });
          }}
          className="btn btn--icon"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)' }}
        >
          −
        </button>
        <button
          onClick={() => onBoardStateChange({ zoom: 1 })}
          className="btn btn--icon"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--stroke)', fontSize: 'var(--fs-11)' }}
        >
          1:1
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div 
        className="absolute bottom-4 left-4 px-3 py-1 text-xs"
        style={{ 
          background: 'var(--bg-panel)', 
          border: '1px solid var(--stroke)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-secondary)'
        }}
      >
        {Math.round(editorState.boardState.zoom * 100)}%
      </div>
    </div>
  );
};
