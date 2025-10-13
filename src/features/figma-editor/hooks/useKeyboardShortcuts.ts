import { useEffect } from 'react';
import { EditorState, Project } from '../types';

interface UseKeyboardShortcutsProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  project: Project;
  updateProject: (updater: (prev: Project) => Project) => void;
  enterFrameFocus: (frameId: string) => void;
  exitFrameFocus: () => void;
}

export const useKeyboardShortcuts = ({
  editorState,
  setEditorState,
  project,
  updateProject,
  enterFrameFocus,
  exitFrameFocus
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                            document.activeElement?.tagName === 'TEXTAREA';
      
      if (isInputFocused) return;

      // Tool shortcuts
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
        setEditorState(prev => ({ ...prev, currentTool: 'move' }));
        e.preventDefault();
      } else if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        setEditorState(prev => ({ ...prev, currentTool: 'hand' }));
        e.preventDefault();
      } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        setEditorState(prev => ({ ...prev, currentTool: 'frame' }));
        e.preventDefault();
      } else if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        setEditorState(prev => ({ ...prev, currentTool: 'text' }));
        e.preventDefault();
      } else if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        setEditorState(prev => ({ ...prev, currentTool: 'shape' }));
        e.preventDefault();
      } else if (e.key === 'p' && !e.ctrlKey && !e.metaKey) {
        setEditorState(prev => ({ ...prev, currentTool: 'pen' }));
        e.preventDefault();
      } else if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
        setEditorState(prev => ({ ...prev, currentTool: 'comment' }));
        e.preventDefault();
      }

      // Navigation shortcuts
      if (e.key === 'Escape') {
        if (editorState.mode === 'frame') {
          exitFrameFocus();
        }
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (editorState.mode === 'board' && editorState.selectedFrameIds.length === 1) {
          enterFrameFocus(editorState.selectedFrameIds[0]);
        }
        e.preventDefault();
      }

      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        const newZoom = Math.min(5, editorState.boardState.zoom * 1.2);
        setEditorState(prev => ({
          ...prev,
          boardState: { ...prev.boardState, zoom: newZoom }
        }));
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        const newZoom = Math.max(0.1, editorState.boardState.zoom * 0.8);
        setEditorState(prev => ({
          ...prev,
          boardState: { ...prev.boardState, zoom: newZoom }
        }));
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        setEditorState(prev => ({
          ...prev,
          boardState: { ...prev.boardState, zoom: 1 }
        }));
        e.preventDefault();
      }

      // Frame shortcuts
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (editorState.mode === 'board' && editorState.selectedFrameIds.length > 0) {
          // Delete selected frames
          updateProject(prev => ({
            ...prev,
            frames: prev.frames.filter(frame => 
              !editorState.selectedFrameIds.includes(frame.id)
            ),
            sequence: {
              ...prev.sequence,
              order: prev.sequence.order.filter(id => 
                !editorState.selectedFrameIds.includes(id)
              )
            }
          }));
          setEditorState(prev => ({ ...prev, selectedFrameIds: [] }));
        }
        e.preventDefault();
      }

      // Duplicate shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (editorState.mode === 'board' && editorState.selectedFrameIds.length > 0) {
          // Duplicate selected frames
          const framesToDuplicate = project.frames.filter(frame => 
            editorState.selectedFrameIds.includes(frame.id)
          );
          
          const newFrames = framesToDuplicate.map(frame => ({
            ...frame,
            id: `frame-${Date.now()}-${Math.random()}`,
            name: `${frame.name} Copy`,
            position: {
              x: frame.position.x + 50,
              y: frame.position.y + 50
            }
          }));

          updateProject(prev => ({
            ...prev,
            frames: [...prev.frames, ...newFrames]
          }));

          setEditorState(prev => ({
            ...prev,
            selectedFrameIds: newFrames.map(f => f.id)
          }));
        }
        e.preventDefault();
      }

      // Rulers toggle
      if (e.key === 'r' && e.shiftKey) {
        setEditorState(prev => ({
          ...prev,
          boardState: {
            ...prev.boardState,
            rulers: !prev.boardState.rulers
          }
        }));
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editorState, setEditorState, project, updateProject, enterFrameFocus, exitFrameFocus]);
};
