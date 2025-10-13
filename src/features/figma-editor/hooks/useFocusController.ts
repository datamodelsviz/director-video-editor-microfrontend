import { useCallback } from 'react';
import { EditorState } from '../types';

interface UseFocusControllerProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
}

export const useFocusController = ({ editorState, setEditorState }: UseFocusControllerProps) => {
  const enterFrameFocus = useCallback((frameId: string) => {
    setEditorState(prev => ({
      ...prev,
      mode: 'frame',
      focusedFrameId: frameId,
      selectedFrameIds: [frameId],
      selectedLayerIds: []
    }));
  }, [setEditorState]);

  const exitFrameFocus = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      mode: 'board',
      focusedFrameId: null,
      selectedLayerIds: []
    }));
  }, [setEditorState]);

  return {
    enterFrameFocus,
    exitFrameFocus
  };
};
