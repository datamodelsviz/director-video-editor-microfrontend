import React from 'react';

interface RulersProps {
  zoom: number;
  scroll: { x: number; y: number };
}

export const Rulers: React.FC<RulersProps> = ({ zoom, scroll }) => {
  return (
    <div className="rulers absolute inset-0 pointer-events-none">
      {/* Horizontal Ruler */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gray-100 border-b border-gray-300">
        {/* Ruler markings would go here */}
      </div>
      
      {/* Vertical Ruler */}
      <div className="absolute top-0 left-0 bottom-0 w-6 bg-gray-100 border-r border-gray-300">
        {/* Ruler markings would go here */}
      </div>
    </div>
  );
};
