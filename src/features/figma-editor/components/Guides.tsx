import React from 'react';
import { Guide } from '../types';

interface GuidesProps {
  guides: Guide[];
  zoom: number;
}

export const Guides: React.FC<GuidesProps> = ({ guides, zoom }) => {
  return (
    <>
      {guides.map(guide => (
        <div
          key={guide.id}
          className={`absolute bg-blue-500 pointer-events-none ${
            guide.orientation === 'vertical' 
              ? 'w-px h-full' 
              : 'h-px w-full'
          }`}
          style={{
            [guide.orientation === 'vertical' ? 'left' : 'top']: guide.pos * zoom,
            opacity: 0.6
          }}
        />
      ))}
    </>
  );
};
