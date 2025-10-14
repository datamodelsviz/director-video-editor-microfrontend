import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Project, EditorState, EditorMode, InspectorTab, Frame } from './types';
import { BoardView } from './components/BoardView';
import { FrameEditorWrapper } from './components/FrameEditorWrapper';
import { Inspector } from './components/Inspector';
import { Toolbar } from './components/Toolbar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useProjectState } from './hooks/useProjectState';
import { useFocusController } from './hooks/useFocusController';
import { getCompactFontData, loadFonts } from '../editor/utils/fonts';
import { FONTS } from '../editor/data/fonts';
import { SECONDARY_FONT, SECONDARY_FONT_URL } from '../editor/constants/constants';
import useDataState from '../editor/store/use-data-state';
import './styles/tokens.css';

// Sample project data
const createSampleProject = (): Project => ({
  projectId: 'figma-project-1',
  board: {
    zoom: 0.85,
    scroll: { x: 0, y: 0 },
    snap: true,
    rulers: true,
    guides: [
      { id: 'guide-1', orientation: 'vertical', pos: 1280 },
      { id: 'guide-2', orientation: 'horizontal', pos: 200 }
    ]
  },
  frames: [
    {
      id: 'frame-1',
      name: 'Intro',
      position: { x: -1800, y: 0 },
      size: { w: 1920, h: 1080 },
      background: '#0b0b0b',
      fps: 30,
      duration: 6.0,
      posterTime: 0.25,
      labelColor: 'purple',
      layers: [],
      timeline: {
        duration: 6.0,
        fps: 30,
        tracks: [],
        playheadTime: 0
      }
    },
    {
      id: 'frame-2',
      name: 'Main Content',
      position: { x: 200, y: 0 },
      size: { w: 1920, h: 1080 },
      background: '#0b0b0b',
      fps: 30,
      duration: 10.0,
      posterTime: 2.0,
      labelColor: 'blue',
      layers: [],
      timeline: {
        duration: 10.0,
        fps: 30,
        tracks: [],
        playheadTime: 0
      }
    },
    {
      id: 'frame-3',
      name: 'Outro',
      position: { x: 2200, y: 0 },
      size: { w: 1920, h: 1080 },
      background: '#0b0b0b',
      fps: 30,
      duration: 4.0,
      posterTime: 1.0,
      labelColor: 'green',
      layers: [],
      timeline: {
        duration: 4.0,
        fps: 30,
        tracks: [],
        playheadTime: 0
      }
    }
  ],
  sequence: {
    order: ['frame-1', 'frame-2', 'frame-3'],
    transitions: [
      {
        id: 'transition-1',
        from: 'frame-1',
        to: 'frame-2',
        type: 'crossfade',
        duration: 0.5,
        curve: 'easeInOut'
      }
    ],
    loop: false,
    playRange: { startIndex: 0, endIndex: 2 }
  }
});

export const FigmaEditor: React.FC = () => {
  // Project state
  const { project, updateProject, updateFrame, addFrame, removeFrame } = useProjectState(createSampleProject());
  
  // Editor state
  const [editorState, setEditorState] = useState<EditorState>({
    mode: 'board',
    focusedFrameId: null,
    selectedFrameIds: [],
    selectedLayerIds: [],
    currentTool: 'move',
    boardState: project.board,
    proxyQuality: 'half',
    isPlaying: false
  });

  // Inspector state
  const [inspectorState, setInspectorState] = useState({
    activeTab: 'frame' as InspectorTab,
    selectedItem: null as { type: 'frame' | 'layer'; id: string } | null
  });

  // Focus controller
  const { enterFrameFocus, exitFrameFocus } = useFocusController({
    editorState,
    setEditorState,
    setInspectorState
  });

  // Initialize fonts for editor
  const { setCompactFonts, setFonts } = useDataState();

  useEffect(() => {
    // Load font data
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
    
    // Load secondary font
    loadFonts([
      {
        name: SECONDARY_FONT,
        url: SECONDARY_FONT_URL,
      },
    ]);
  }, [setCompactFonts, setFonts]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    editorState,
    setEditorState,
    project,
    updateProject,
    enterFrameFocus,
    exitFrameFocus,
    updateFrame,
    removeFrame
  });

  // Handle frame selection
  const handleFrameSelect = useCallback((frameId: string, multiSelect: boolean = false) => {
    setEditorState(prev => ({
      ...prev,
      selectedFrameIds: multiSelect 
        ? prev.selectedFrameIds.includes(frameId)
          ? prev.selectedFrameIds.filter(id => id !== frameId)
          : [...prev.selectedFrameIds, frameId]
        : [frameId],
      selectedLayerIds: [] // Clear layer selection when selecting frames
    }));
    
    setInspectorState(prev => ({
      ...prev,
      selectedItem: { type: 'frame', id: frameId }
    }));
  }, []);

  // Handle frame focus (enter frame editing mode)
  const handleFrameFocus = useCallback((frameId: string) => {
    enterFrameFocus(frameId);
  }, [enterFrameFocus]);

  // Handle frame creation
  const handleCreateFrame = useCallback((position: { x: number; y: number }, size: { w: number; h: number }) => {
    const newFrame: Frame = {
      id: `frame-${Date.now()}`,
      name: `Frame ${project.frames.length + 1}`,
      position,
      size,
      background: '#0b0b0b',
      fps: 30,
      duration: 5.0,
      posterTime: 0.5,
      labelColor: 'blue',
      layers: [],
      timeline: {
        duration: 5.0,
        fps: 30,
        tracks: [],
        playheadTime: 0
      }
    };

    addFrame(newFrame);
    handleFrameSelect(newFrame.id);
  }, [project.frames.length, addFrame, handleFrameSelect]);

  // Handle frame update
  const handleFrameUpdate = useCallback((frameId: string, updates: Partial<Frame>) => {
    updateFrame(frameId, updates);
  }, [updateFrame]);

  // Handle frame reordering
  const handleFrameReorder = useCallback((fromIndex: number, toIndex: number) => {
    const newOrder = [...project.sequence.order];
    const [movedFrame] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedFrame);
    
    updateProject(prev => ({
      ...prev,
      sequence: {
        ...prev.sequence,
        order: newOrder
      }
    }));
  }, [project.sequence.order, updateProject]);

  // Handle layer selection
  const handleLayerSelect = useCallback((layerId: string) => {
    setEditorState(prev => ({
      ...prev,
      selectedLayerIds: [layerId]
    }));
    
    setInspectorState(prev => ({
      ...prev,
      activeTab: 'layers',
      selectedItem: { type: 'layer', id: layerId }
    }));
  }, []);

  // Handle board state changes
  const handleBoardStateChange = useCallback((updates: Partial<typeof editorState.boardState>) => {
    setEditorState(prev => ({
      ...prev,
      boardState: { ...prev.boardState, ...updates }
    }));
    
    updateProject(prev => ({
      ...prev,
      board: { ...prev.board, ...updates }
    }));
  }, [updateProject]);

  // Get focused frame
  const focusedFrame = editorState.focusedFrameId 
    ? project.frames.find(f => f.id === editorState.focusedFrameId)
    : null;

  return (
    <div className="figma-editor h-screen w-full flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar
        currentTool={editorState.currentTool}
        onToolChange={(tool) => setEditorState(prev => ({ ...prev, currentTool: tool }))}
        boardState={editorState.boardState}
        onBoardStateChange={handleBoardStateChange}
        project={project}
        editorState={editorState}
        onPlay={() => setEditorState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Inspector (moved from right) */}
        <Inspector
          state={inspectorState}
          onStateChange={setInspectorState}
          project={project}
          editorState={editorState}
          onFrameUpdate={handleFrameUpdate}
          onFrameSelect={handleFrameSelect}
          onFrameReorder={handleFrameReorder}
          focusedFrame={focusedFrame}
        />

        {/* Center - Board or Frame Editor */}
        <div className="flex-1 relative overflow-hidden">
          {editorState.mode === 'board' ? (
            <BoardView
              project={project}
              editorState={editorState}
              onFrameSelect={handleFrameSelect}
              onFrameFocus={handleFrameFocus}
              onCreateFrame={handleCreateFrame}
              onFrameUpdate={handleFrameUpdate}
              onBoardStateChange={handleBoardStateChange}
            />
          ) : focusedFrame ? (
            <FrameEditorWrapper
              frame={focusedFrame}
              onFrameUpdate={handleFrameUpdate}
              onExitFocus={exitFrameFocus}
              onLayerSelect={handleLayerSelect}
              selectedLayerIds={editorState.selectedLayerIds}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
