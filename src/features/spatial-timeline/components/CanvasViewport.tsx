import React, { useRef, useCallback, useEffect, useState } from 'react';

interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  size: { width: number; height: number };
}

interface CanvasViewportProps {
  canvasState: CanvasState;
  onZoom: (zoom: number) => void;
  onPan: (pan: { x: number; y: number }) => void;
  children: React.ReactNode;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  canvasState,
  onZoom,
  onPan,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, canvasState.zoom * delta));
    onZoom(newZoom);
  }, [canvasState.zoom, onZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.metaKey)) { // Middle mouse or Cmd+click
      setIsPanning(true);
      setPanStart({
        x: e.clientX - canvasState.pan.x,
        y: e.clientY - canvasState.pan.y
      });
    }
  }, [canvasState.pan]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      onPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [isPanning, panStart, onPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-gray-900"
      onMouseDown={handleMouseDown}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * canvasState.zoom}px ${20 * canvasState.zoom}px`,
          transform: `translate(${canvasState.pan.x}px, ${canvasState.pan.y}px)`
        }}
      />
      
      {/* Canvas Content */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${canvasState.pan.x}px, ${canvasState.pan.y}px) scale(${canvasState.zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {children}
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => onZoom(Math.min(3, canvasState.zoom * 1.2))}
          className="w-8 h-8 bg-gray-800 border border-gray-600 rounded text-white hover:bg-gray-700 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => onZoom(Math.max(0.1, canvasState.zoom * 0.8))}
          className="w-8 h-8 bg-gray-800 border border-gray-600 rounded text-white hover:bg-gray-700 transition-colors"
        >
          -
        </button>
        <button
          onClick={() => onZoom(1)}
          className="w-8 h-8 bg-gray-800 border border-gray-600 rounded text-white hover:bg-gray-700 transition-colors text-xs"
        >
          1:1
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm">
        {Math.round(canvasState.zoom * 100)}%
      </div>

      {/* Pan Instructions */}
      <div className="absolute bottom-4 right-4 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-xs">
        <div>🖱️ Wheel: Zoom</div>
        <div>🖱️ Cmd+Drag: Pan</div>
      </div>
    </div>
  );
};
