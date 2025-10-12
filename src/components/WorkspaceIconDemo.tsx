import React from 'react';
import { WorkspaceIcon } from './WorkspaceIcon';

/**
 * Demo component to showcase all workspace icon categories
 */
export const WorkspaceIconDemo: React.FC = () => {
  const examples = [
    { word: 'vision', category: 'thought' },
    { word: 'create', category: 'creation' },
    { word: 'edit', category: 'editing' },
    { word: 'art', category: 'artistic' },
    { word: 'spark', category: 'dynamic' },
    { word: 'dream', category: 'thought' },
    { word: 'build', category: 'creation' },
    { word: 'refine', category: 'editing' },
    { word: 'canvas', category: 'artistic' },
    { word: 'energy', category: 'dynamic' },
  ];

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Workspace Icon Categories</h3>
      <div className="grid grid-cols-2 gap-4">
        {examples.map((example, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
            <WorkspaceIcon word={example.word} />
            <div>
              <div className="font-medium text-sm">{example.word}</div>
              <div className="text-xs text-gray-500">{example.category}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Each workspace gets a random creative word from a pool of 100+ words representing:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Thought:</strong> vision, dream, idea, concept, imagination, inspiration...</li>
          <li><strong>Creation:</strong> create, build, craft, design, construct, develop...</li>
          <li><strong>Editing:</strong> edit, refine, polish, perfect, enhance, improve...</li>
          <li><strong>Artistic:</strong> art, canvas, palette, brush, masterpiece, story...</li>
          <li><strong>Dynamic:</strong> spark, ignite, energy, flow, rhythm, universe...</li>
        </ul>
      </div>
    </div>
  );
};
