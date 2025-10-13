import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SceneCard } from './components/SceneCard';
import { ContextualToolbar } from './components/ContextualToolbar';
import { CanvasViewport } from './components/CanvasViewport';
import { ViewControls } from './components/ViewControls';
import { TimelineOverlay } from './components/TimelineOverlay';

export interface TimelineElement {
  id: string;
  type: 'video' | 'audio' | 'text' | 'image';
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  layer: number;
  metadata?: any;
}

export interface Scene {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  elements: TimelineElement[];
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface SpatialTimelineProps {
  scenes?: Scene[];
  onSceneSelect?: (sceneId: string) => void;
  onElementSelect?: (elementId: string) => void;
  onSceneMove?: (sceneId: string, position: { x: number; y: number }) => void;
  onElementEdit?: (elementId: string) => void;
}

export const SpatialTimeline: React.FC<SpatialTimelineProps> = ({
  scenes = [],
  onSceneSelect,
  onElementSelect,
  onSceneMove,
  onElementEdit
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [canvasState, setCanvasState] = useState({
    zoom: 1,
    pan: { x: 0, y: 0 },
    size: { width: 1200, height: 800 }
  });
  const [viewMode, setViewMode] = useState<'spatial' | 'traditional' | 'layers'>('spatial');

  const handleSceneSelect = useCallback((sceneId: string) => {
    setSelectedSceneId(sceneId);
    setSelectedElementId(null);
    onSceneSelect?.(sceneId);
  }, [onSceneSelect]);

  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElementId(elementId);
    onElementSelect?.(elementId);
  }, [onElementSelect]);

  const handleSceneMove = useCallback((sceneId: string, position: { x: number; y: number }) => {
    onSceneMove?.(sceneId, position);
  }, [onSceneMove]);

  const handleElementEdit = useCallback((elementId: string) => {
    onElementEdit?.(elementId);
  }, [onElementEdit]);

  const handleCanvasZoom = useCallback((zoom: number) => {
    setCanvasState(prev => ({ ...prev, zoom }));
  }, []);

  const handleCanvasPan = useCallback((pan: { x: number; y: number }) => {
    setCanvasState(prev => ({ ...prev, pan }));
  }, []);

  const handleViewModeChange = useCallback((mode: 'spatial' | 'traditional' | 'layers') => {
    setViewMode(mode);
  }, []);

  return (
    <div className="spatial-timeline h-full w-full bg-gray-900 flex flex-col">
      {/* View Controls - Compact Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-4">
          <ViewControls 
            currentView={viewMode}
            onViewChange={handleViewModeChange}
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {scenes.length} scenes • {scenes.reduce((acc, scene) => acc + scene.elements.length, 0)} elements
          </span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <CanvasViewport
          canvasState={canvasState}
          onZoom={handleCanvasZoom}
          onPan={handleCanvasPan}
        >
          {viewMode === 'spatial' && (
            <div className="absolute inset-0">
              {/* Scene Cards */}
              {scenes.map((scene) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  isSelected={selectedSceneId === scene.id}
                  onSelect={() => handleSceneSelect(scene.id)}
                  onElementSelect={handleElementSelect}
                  onMove={(position) => handleSceneMove(scene.id, position)}
                  onElementEdit={handleElementEdit}
                  selectedElementId={selectedElementId}
                />
              ))}
              
              {/* Connection Lines */}
              <svg className="absolute inset-0 pointer-events-none">
                {scenes.slice(0, -1).map((scene, index) => {
                  const nextScene = scenes[index + 1];
                  if (!nextScene) return null;
                  
                  const startX = scene.position.x + scene.size.width;
                  const startY = scene.position.y + scene.size.height / 2;
                  const endX = nextScene.position.x;
                  const endY = nextScene.position.y + nextScene.size.height / 2;
                  
                  return (
                    <line
                      key={`${scene.id}-${nextScene.id}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="#4F46E5"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#4F46E5"
                    />
                  </marker>
                </defs>
              </svg>
            </div>
          )}
          
          {viewMode === 'traditional' && (
            <div className="p-8">
              <div className="text-center text-gray-400">
                <p>Traditional Timeline View</p>
                <p className="text-sm mt-2">This would show the classic horizontal timeline</p>
              </div>
            </div>
          )}
          
          {viewMode === 'layers' && (
            <div className="p-8">
              <div className="text-center text-gray-400">
                <p>Layers View</p>
                <p className="text-sm mt-2">This would show vertical layer-based organization</p>
              </div>
            </div>
          )}
        </CanvasViewport>

        {/* Timeline Overlay */}
        <TimelineOverlay
          scenes={scenes}
          currentTime={0}
          duration={scenes.reduce((acc, scene) => acc + scene.duration, 0)}
        />
      </div>

      {/* Contextual Toolbar */}
      <ContextualToolbar
        selectedSceneId={selectedSceneId}
        selectedElementId={selectedElementId}
        scenes={scenes}
        onAddElement={() => {}}
        onDeleteElement={() => {}}
        onDuplicateElement={() => {}}
      />
    </div>
  );
};
