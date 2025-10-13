import React from 'react';

interface RulersProps {
  zoom: number;
  scroll: { x: number; y: number };
}

export const Rulers: React.FC<RulersProps> = ({ zoom, scroll }) => {
  const rulerSize = 24;
  const tickInterval = 100; // pixels

  return (
    <>
      {/* Horizontal Ruler */}
      <div 
        className="ruler ruler--horizontal"
        style={{
          position: 'absolute',
          top: 0,
          left: rulerSize,
          right: 0,
          height: rulerSize,
          zIndex: 100,
          pointerEvents: 'none'
        }}
      >
        {/* Ruler ticks and numbers would be rendered here */}
      </div>
      
      {/* Vertical Ruler */}
      <div 
        className="ruler ruler--vertical"
        style={{
          position: 'absolute',
          top: rulerSize,
          left: 0,
          bottom: 0,
          width: rulerSize,
          zIndex: 100,
          pointerEvents: 'none'
        }}
      >
        {/* Ruler ticks and numbers would be rendered here */}
      </div>

      {/* Corner */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: rulerSize,
          height: rulerSize,
          background: 'var(--time-ruler-bg)',
          borderRight: '1px solid var(--time-ruler-stroke)',
          borderBottom: '1px solid var(--time-ruler-stroke)',
          zIndex: 101
        }}
      />
    </>
  );
};
