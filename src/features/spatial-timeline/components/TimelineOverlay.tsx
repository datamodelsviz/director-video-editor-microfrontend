import React from 'react';
import { Scene } from '../SpatialTimeline';

interface TimelineOverlayProps {
  scenes: Scene[];
  currentTime: number;
  duration: number;
}

export const TimelineOverlay: React.FC<TimelineOverlayProps> = ({
  scenes,
  currentTime,
  duration
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimePosition = (time: number) => {
    return (time / duration) * 100;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-900/90 border-t border-gray-700">
      <div className="h-full flex items-center px-4">
        {/* Timeline Ruler */}
        <div className="flex-1 relative h-8">
          {/* Time Markers */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: Math.ceil(duration / 5) + 1 }, (_, i) => {
              const time = i * 5;
              const position = getTimePosition(time);
              return (
                <div
                  key={time}
                  className="absolute top-0 h-full flex flex-col items-center"
                  style={{ left: `${position}%` }}
                >
                  <div className="w-px h-4 bg-gray-600"></div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatTime(time)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scene Blocks */}
          <div className="absolute inset-0 top-2">
            {scenes.map((scene, index) => {
              const startPos = getTimePosition(scene.startTime);
              const width = getTimePosition(scene.duration);
              return (
                <div
                  key={scene.id}
                  className="absolute h-4 bg-blue-500/30 border border-blue-500/50 rounded"
                  style={{
                    left: `${startPos}%`,
                    width: `${width}%`
                  }}
                  title={`${scene.name} (${formatTime(scene.startTime)} - ${formatTime(scene.startTime + scene.duration)})`}
                >
                  <div className="text-xs text-white px-1 truncate h-full flex items-center">
                    {scene.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 w-px h-full bg-red-500 z-10"
            style={{ left: `${getTimePosition(currentTime)}%` }}
          >
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 transform rotate-45"></div>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="ml-4 flex items-center space-x-2">
          <button className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
            ⏮️
          </button>
          <button className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
            ▶️
          </button>
          <button className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
            ⏭️
          </button>
          <div className="text-sm text-gray-400 ml-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};
