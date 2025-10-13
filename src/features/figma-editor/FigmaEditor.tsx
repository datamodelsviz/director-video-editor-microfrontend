import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Project, EditorState, EditorMode, InspectorTab } from './types';
import { BoardCanvas } from './components/BoardCanvas';
import { FrameEditor } from './components/FrameEditor';
import { Inspector } from './components/Inspector';
import { SequenceDock } from './components/SequenceDock';
import { Toolbar } from './components/Toolbar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useProjectState } from './hooks/useProjectState';
import { useFocusController } from './hooks/useFocusController';

// Sample project data
const sampleProject: Project = {
  projectId: 'figma-project-1',
  board: {
    zoom: 1,
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
      position: { x: -2400, y: 0 },
      size: { w: 1920, h: 1080 },
      background: '#0b0b0b',
      fps: 30,
      duration: 6.0,
      posterTime: 0.3,
      labelColor: 'purple',
      layers: [],
      timeline: {
        duration: 6.0,
        fps: 30,
        tracks: []
      }
    },
    {
      id: 'frame-2',
      name: 'Main Content',
      position: { x: -400, y: 0 },
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
        tracks: []
      }
    },
    {
      id: 'frame-3',
      name: 'Outro',
      position: { x: 1600, y: 0 },
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
        tracks: []
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
    loop: true,
    playRange: { startIndex: 0, endIndex: 2 }
  }
};

export const FigmaEditor: React.FC = () => {
  // Project state
  const { project, updateProject } = useProjectState(sampleProject);
  
  // Editor state
  const [editorState, setEditorState] = useState<EditorState>({
    mode: 'board',
    focusedFrameId: null,
    selectedFrameIds: [],
    selectedLayerIds: [],
    currentTool: 'move',
    boardState: project.board,
    proxyQuality: 'half'
  });

  // Inspector state
  const [inspectorState, setInspectorState] = useState({
    activeTab: 'frame' as InspectorTab,
    selectedItem: null
  });

  // Focus controller
  const { enterFrameFocus, exitFrameFocus } = useFocusController(
    editorState,
    setEditorState
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    editorState,
    setEditorState,
    project,
    updateProject,
    enterFrameFocus,
    exitFrameFocus
  });

  // Handle frame selection
  const handleFrameSelect = useCallback((frameId: string, multiSelect: boolean = false) => {
    setEditorState(prev => ({
      ...prev,
      selectedFrameIds: multiSelect 
        ? [...prev.selectedFrameIds, frameId]
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
    setInspectorState(prev => ({
      ...prev,
      activeTab: 'layers'
    }));
  }, [enterFrameFocus]);

  // Handle frame creation
  const handleCreateFrame = useCallback((position: { x: number; y: number }, size: { w: number; h: number }) => {
    const newFrame = {
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
        tracks: []
      }
    };

    updateProject(prev => ({
      ...prev,
      frames: [...prev.frames, newFrame]
    }));

    handleFrameSelect(newFrame.id);
  }, [project.frames.length, updateProject, handleFrameSelect]);

  // Handle frame update
  const handleFrameUpdate = useCallback((frameId: string, updates: Partial<typeof project.frames[0]>) => {
    updateProject(prev => ({
      ...prev,
      frames: prev.frames.map(frame => 
        frame.id === frameId ? { ...frame, ...updates } : frame
      )
    }));
  }, [updateProject]);

  // Handle sequence reorder
  const handleSequenceReorder = useCallback((frameIds: string[]) => {
    updateProject(prev => ({
      ...prev,
      sequence: {
        ...prev.sequence,
        order: frameIds
      }
    }));
  }, [updateProject]);

  // Handle transition add/update
  const handleTransitionUpdate = useCallback((transition: any) => {
    updateProject(prev => ({
      ...prev,
      sequence: {
        ...prev.sequence,
        transitions: prev.sequence.transitions.map(t => 
          t.id === transition.id ? transition : t
        )
      }
    }));
  }, [updateProject]);

  return (
    <div className="figma-editor h-screen w-full bg-gray-50 flex flex-col">
      {/* Top Toolbar */}
      <Toolbar
        currentTool={editorState.currentTool}
        onToolChange={(tool) => setEditorState(prev => ({ ...prev, currentTool: tool }))}
        boardState={editorState.boardState}
        onBoardStateChange={(boardState) => setEditorState(prev => ({ ...prev, boardState }))}
        project={project}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Frames List */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Frames</h3>
            <div className="space-y-2">
              {project.frames.map(frame => (
                <div
                  key={frame.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    editorState.selectedFrameIds.includes(frame.id)
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleFrameSelect(frame.id)}
                >
                  <div className="text-sm font-medium text-gray-900">{frame.name}</div>
                  <div className="text-xs text-gray-500">
                    {frame.size.w}×{frame.size.h} • {frame.duration}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Board or Frame Editor */}
        <div className="flex-1 relative">
          {editorState.mode === 'board' ? (
            <BoardCanvas
              project={project}
              editorState={editorState}
              onFrameSelect={handleFrameSelect}
              onFrameFocus={handleFrameFocus}
              onCreateFrame={handleCreateFrame}
              onFrameUpdate={handleFrameUpdate}
            />
          ) : (
            <FrameEditor
              frame={project.frames.find(f => f.id === editorState.focusedFrameId)!}
              onFrameUpdate={handleFrameUpdate}
              onExitFocus={exitFrameFocus}
            />
          )}
        </div>

        {/* Right Sidebar - Inspector */}
        <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0">
          <Inspector
            state={inspectorState}
            onStateChange={setInspectorState}
            project={project}
            editorState={editorState}
            onFrameUpdate={handleFrameUpdate}
          />
        </div>
      </div>

      {/* Bottom - Sequence Dock */}
      <div className="h-32 bg-white border-t border-gray-200">
        <SequenceDock
          project={project}
          onSequenceReorder={handleSequenceReorder}
          onTransitionUpdate={handleTransitionUpdate}
        />
      </div>
    </div>
  );
};
