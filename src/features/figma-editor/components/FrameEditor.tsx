import React from 'react';
import { Frame } from '../types';

interface FrameEditorProps {
  frame: Frame;
  onFrameUpdate: (frameId: string, updates: Partial<Frame>) => void;
  onExitFocus: () => void;
}

export const FrameEditor: React.FC<FrameEditorProps> = ({
  frame,
  onFrameUpdate,
  onExitFocus
}) => {
  return (
    <div className="frame-editor h-full w-full bg-gray-100 flex flex-col">
      {/* Frame Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onExitFocus}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <span>←</span>
            <span>Back to Board</span>
          </button>
          <div className="w-px h-4 bg-gray-300" />
          <h2 className="text-lg font-medium text-gray-900">{frame.name}</h2>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{frame.size.w}×{frame.size.h}</span>
          <span>•</span>
          <span>{frame.duration}s</span>
          <span>•</span>
          <span>{frame.fps}fps</span>
        </div>
      </div>

      {/* Frame Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎬</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Frame Editor</h3>
          <p className="text-gray-600 mb-4">
            This will integrate your existing timeline and layer editing functionality
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
            <h4 className="font-medium text-gray-900 mb-2">Coming Soon:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Existing timeline component integration</li>
              <li>• Layer stack with drag & drop reordering</li>
              <li>• Property panels for selected layers</li>
              <li>• Video/audio/image/text editing tools</li>
              <li>• Keyframe animation system</li>
              <li>• Effects and transitions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
