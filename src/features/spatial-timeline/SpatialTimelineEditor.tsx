import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SpatialTimeline, Scene, TimelineElement } from './SpatialTimeline';
import Navbar from '../editor/navbar';
import MenuList from '../editor/menu-list';
import { RightDrawer } from '../editor/components';
import Timeline from '../editor/timeline';
import StateManager from "@designcombo/state";
import useStore from '../editor/store/use-store';
import useTimelineEvents from '../editor/hooks/use-timeline-events';
import { useCompositionStore } from '../editor/store/use-composition-store';
import { useAutosave } from '../../hooks/useAutosave';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { TimelineBridge } from './utils/timelineBridge';

// Sample data for demonstration
const sampleScenes: Scene[] = [
  {
    id: 'scene-1',
    name: 'Opening',
    startTime: 0,
    duration: 10,
    position: { x: 50, y: 50 },
    size: { width: 300, height: 200 },
    elements: [
      {
        id: 'video-1',
        type: 'video',
        name: 'mountain_intro.mp4',
        duration: 10,
        startTime: 0,
        endTime: 10,
        layer: 1
      },
      {
        id: 'audio-1',
        type: 'audio',
        name: 'background_music.mp3',
        duration: 10,
        startTime: 0,
        endTime: 10,
        layer: 2
      },
      {
        id: 'text-1',
        type: 'text',
        name: 'Welcome to the Mountains',
        duration: 8,
        startTime: 2,
        endTime: 10,
        layer: 4
      },
      {
        id: 'image-1',
        type: 'image',
        name: 'logo.png',
        duration: 10,
        startTime: 0,
        endTime: 10,
        layer: 3
      }
    ]
  },
  {
    id: 'scene-2',
    name: 'Action',
    startTime: 10,
    duration: 15,
    position: { x: 400, y: 50 },
    size: { width: 300, height: 200 },
    elements: [
      {
        id: 'video-2',
        type: 'video',
        name: 'hiking_scene.mp4',
        duration: 15,
        startTime: 10,
        endTime: 25,
        layer: 1
      },
      {
        id: 'audio-2',
        type: 'audio',
        name: 'nature_sounds.mp3',
        duration: 15,
        startTime: 10,
        endTime: 25,
        layer: 2
      },
      {
        id: 'text-2',
        type: 'text',
        name: 'Exploring the Trail',
        duration: 10,
        startTime: 12,
        endTime: 22,
        layer: 4
      }
    ]
  },
  {
    id: 'scene-3',
    name: 'Climax',
    startTime: 25,
    duration: 12,
    position: { x: 750, y: 50 },
    size: { width: 300, height: 200 },
    elements: [
      {
        id: 'video-3',
        type: 'video',
        name: 'summit_view.mp4',
        duration: 12,
        startTime: 25,
        endTime: 37,
        layer: 1
      },
      {
        id: 'audio-3',
        type: 'audio',
        name: 'epic_music.mp3',
        duration: 12,
        startTime: 25,
        endTime: 37,
        layer: 2
      },
      {
        id: 'text-3',
        type: 'text',
        name: 'The Summit Awaits',
        duration: 8,
        startTime: 27,
        endTime: 35,
        layer: 4
      }
    ]
  },
  {
    id: 'scene-4',
    name: 'Ending',
    startTime: 37,
    duration: 8,
    position: { x: 50, y: 300 },
    size: { width: 300, height: 200 },
    elements: [
      {
        id: 'video-4',
        type: 'video',
        name: 'sunset_final.mp4',
        duration: 8,
        startTime: 37,
        endTime: 45,
        layer: 1
      },
      {
        id: 'audio-4',
        type: 'audio',
        name: 'peaceful_ending.mp3',
        duration: 8,
        startTime: 37,
        endTime: 45,
        layer: 2
      },
      {
        id: 'text-4',
        type: 'text',
        name: 'Thank You for Watching',
        duration: 6,
        startTime: 39,
        endTime: 45,
        layer: 4
      }
    ]
  }
];

// Initialize StateManager for spatial editor
const stateManager = new StateManager({
  size: {
    width: 1080,
    height: 1920,
  },
});

export const SpatialTimelineEditor: React.FC = () => {
  // Existing editor state
  const [projectName, setProjectName] = useState("Spatial Project");
  const timelinePanelRef = useRef<ImperativePanelHandle>(null);
  const { timeline, playerRef, tracks } = useStore();
  
  // Spatial editor state
  const [scenes, setScenes] = useState<Scene[]>(sampleScenes);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  // Initialize timeline events and autosave
  useTimelineEvents();
  
  const autosave = useAutosave(stateManager, {
    debounceDelay: 2000,
    periodicInterval: 30000,
    enableLocalStorage: true,
    enableBackendAutosave: true,
  });

  // Sync spatial scenes with existing timeline data
  useEffect(() => {
    if (tracks && tracks.length > 0 && !isSynced) {
      const spatialScenes = TimelineBridge.tracksToScenes(tracks);
      if (spatialScenes.length > 0) {
        setScenes(spatialScenes);
        setIsSynced(true);
      }
    }
  }, [tracks, isSynced]);

  // Handle timeline resize
  const handleTimelineResize = useCallback(() => {
    // Timeline resize logic
  }, []);

  // Spatial editor handlers
  const handleSceneSelect = useCallback((sceneId: string) => {
    setSelectedSceneId(sceneId);
    console.log('Selected scene:', sceneId);
  }, []);

  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElementId(elementId);
    console.log('Selected element:', elementId);
  }, []);

  const handleSceneMove = useCallback((sceneId: string, position: { x: number; y: number }) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId 
        ? { ...scene, position }
        : scene
    ));
  }, []);

  const handleElementEdit = useCallback((elementId: string) => {
    console.log('Edit element:', elementId);
  }, []);

  const handleAddElement = useCallback(() => {
    console.log('Add element');
  }, []);

  const handleDeleteElement = useCallback(() => {
    console.log('Delete element');
  }, []);

  const handleDuplicateElement = useCallback(() => {
    console.log('Duplicate element');
  }, []);

  // Sync spatial changes back to timeline
  const handleSyncToTimeline = useCallback(() => {
    if (scenes.length > 0) {
      const newTracks = TimelineBridge.scenesToTracks(scenes);
      // Update the timeline with new tracks
      console.log('Syncing spatial scenes to timeline:', newTracks);
      // Here you would update the actual timeline state
    }
  }, [scenes]);

  // Sync timeline changes to spatial
  const handleSyncFromTimeline = useCallback(() => {
    if (tracks && tracks.length > 0) {
      const spatialScenes = TimelineBridge.tracksToScenes(tracks);
      setScenes(spatialScenes);
      setIsSynced(true);
    }
  }, [tracks]);

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col">
      {/* Existing Navbar */}
      <Navbar
        user={null}
        stateManager={stateManager}
        setProjectName={setProjectName}
        projectName={projectName}
        showMenuButton={true}
        showShareButton={true}
        showDiscordButton={true}
        autosave={autosave}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Existing MenuList */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0">
          <MenuList stateManager={stateManager} />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <ResizablePanelGroup style={{ flex: 1 }} direction="vertical">
            {/* Spatial Canvas Panel */}
            <ResizablePanel className="relative" defaultSize={70}>
              <div className="h-full w-full relative">
                {/* Control Buttons */}
                <div className="absolute top-4 left-4 z-50 flex space-x-2">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white hover:bg-gray-700 transition-colors"
                  >
                    <span>←</span>
                    <span>Back to Editor</span>
                  </button>
                  
                  <button
                    onClick={handleSyncFromTimeline}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 border border-blue-500 rounded text-white hover:bg-blue-700 transition-colors"
                    title="Sync from Timeline"
                  >
                    <span>🔄</span>
                    <span>Sync from Timeline</span>
                  </button>
                  
                  <button
                    onClick={handleSyncToTimeline}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 border border-green-500 rounded text-white hover:bg-green-700 transition-colors"
                    title="Sync to Timeline"
                  >
                    <span>⬆️</span>
                    <span>Sync to Timeline</span>
                  </button>
                </div>
                
                {/* Spatial Timeline Canvas */}
                <SpatialTimeline
                  scenes={scenes}
                  onSceneSelect={handleSceneSelect}
                  onElementSelect={handleElementSelect}
                  onSceneMove={handleSceneMove}
                  onElementEdit={handleElementEdit}
                />
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            {/* Traditional Timeline Panel */}
            <ResizablePanel
              className="min-h-[50px]"
              ref={timelinePanelRef}
              defaultSize={30}
              onResize={handleTimelineResize}
            >
              {playerRef && <Timeline stateManager={stateManager} />}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Right Drawer - Existing Properties Panel */}
        <RightDrawer />
      </div>
    </div>
  );
};
