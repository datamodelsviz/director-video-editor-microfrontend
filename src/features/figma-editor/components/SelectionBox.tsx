import React from 'react';

interface SelectionBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  isCreating?: boolean;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  x,
  y,
  width,
  height,
  isCreating = false
}) => {
  return (
    <div
      className={`absolute border-2 border-dashed pointer-events-none ${
        isCreating ? 'border-blue-500 bg-blue-500/10' : 'border-gray-400 bg-gray-400/10'
      }`}
      style={{
        left: x,
        top: y,
        width: Math.abs(width),
        height: Math.abs(height)
      }}
    />
  );
};
