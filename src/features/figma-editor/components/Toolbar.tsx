import React from 'react';
import { Project, BoardState } from '../types';

interface ToolbarProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  boardState: BoardState;
  onBoardStateChange: (boardState: BoardState) => void;
  project: Project;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  boardState,
  onBoardStateChange,
  project
}) => {
  const tools = [
    { id: 'move', label: 'Move', icon: '↖️', shortcut: 'V' },
    { id: 'hand', label: 'Hand', icon: '✋', shortcut: 'H' },
    { id: 'frame', label: 'Frame', icon: '🖼️', shortcut: 'F' },
    { id: 'text', label: 'Text', icon: 'T', shortcut: 'T' },
    { id: 'shape', label: 'Shape', icon: '⬜', shortcut: 'R' },
    { id: 'pen', label: 'Pen', icon: '✏️', shortcut: 'P' },
    { id: 'comment', label: 'Comment', icon: '💬', shortcut: 'C' }
  ];

  return (
    <div className="toolbar h-12 bg-white border-b border-gray-200 flex items-center px-4 space-x-4">
      {/* Tools */}
      <div className="flex items-center space-x-1">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
              currentTool === tool.id
                ? 'bg-blue-100 text-blue-600 border border-blue-200'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Zoom Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onBoardStateChange({ ...boardState, zoom: Math.min(5, boardState.zoom * 1.2) })}
          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
        >
          +
        </button>
        <span className="text-sm text-gray-600 min-w-[60px] text-center">
          {Math.round(boardState.zoom * 100)}%
        </span>
        <button
          onClick={() => onBoardStateChange({ ...boardState, zoom: Math.max(0.1, boardState.zoom * 0.8) })}
          className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded"
        >
          -
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Toggles */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onBoardStateChange({ ...boardState, snap: !boardState.snap })}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            boardState.snap
              ? 'bg-blue-100 text-blue-600 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Snap
        </button>
        <button
          onClick={() => onBoardStateChange({ ...boardState, rulers: !boardState.rulers })}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            boardState.rulers
              ? 'bg-blue-100 text-blue-600 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Rulers
        </button>
      </div>

      {/* Project Info */}
      <div className="ml-auto flex items-center space-x-4 text-sm text-gray-600">
        <span>{project.frames.length} frames</span>
        <span>{project.sequence.order.length} in sequence</span>
      </div>
    </div>
  );
};
