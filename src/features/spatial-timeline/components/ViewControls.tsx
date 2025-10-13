import React from 'react';

interface ViewControlsProps {
  currentView: 'spatial' | 'traditional' | 'layers';
  onViewChange: (view: 'spatial' | 'traditional' | 'layers') => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  currentView,
  onViewChange
}) => {
  const views = [
    { id: 'spatial', label: 'Spatial', icon: '🎯' },
    { id: 'traditional', label: 'Traditional', icon: '📊' },
    { id: 'layers', label: 'Layers', icon: '📚' }
  ] as const;

  return (
    <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            currentView === view.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          title={view.label}
        >
          <span className="mr-1">{view.icon}</span>
          {view.label}
        </button>
      ))}
    </div>
  );
};
