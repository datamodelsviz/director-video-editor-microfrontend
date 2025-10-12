import React from 'react';
import { 
  Lightbulb, 
  Hammer, 
  Edit3, 
  Palette, 
  Zap, 
  Sparkles,
  Brain,
  Wrench,
  Brush,
  Flame,
  Star
} from 'lucide-react';

interface WorkspaceIconProps {
  word: string;
  className?: string;
}

export const WorkspaceIcon: React.FC<WorkspaceIconProps> = ({ word, className = "" }) => {
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'thought':
        return <Brain className="w-4 h-4" />;
      case 'creation':
        return <Hammer className="w-4 h-4" />;
      case 'editing':
        return <Edit3 className="w-4 h-4" />;
      case 'artistic':
        return <Palette className="w-4 h-4" />;
      case 'dynamic':
        return <Zap className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getCategoryFromWord = (word: string): string => {
    const thoughtWords = ['vision', 'dream', 'idea', 'concept', 'notion', 'thought', 'imagination', 'fantasy', 'inspiration', 'muse', 'creativity', 'innovation', 'invention', 'discovery', 'insight', 'wisdom', 'intuition', 'reflection', 'contemplation', 'meditation', 'envision', 'visualize', 'imagine', 'conceive', 'devise', 'brainstorm', 'ideate', 'ponder', 'consider', 'reflect'];
    const creationWords = ['create', 'build', 'craft', 'design', 'construct', 'develop', 'produce', 'generate', 'form', 'shape', 'forge', 'sculpt', 'carve', 'mold', 'fashion', 'assemble', 'compose', 'arrange', 'organize', 'structure', 'architect', 'engineer', 'fabricate', 'manufacture', 'synthesize', 'combine', 'blend', 'merge', 'unite', 'connect'];
    const editingWords = ['edit', 'refine', 'polish', 'perfect', 'enhance', 'improve', 'optimize', 'upgrade', 'transform', 'evolve', 'adapt', 'modify', 'adjust', 'tune', 'calibrate', 'fine-tune', 'customize', 'personalize', 'tailor', 'configure', 'process', 'render', 'compile', 'execute', 'implement', 'deploy', 'launch', 'release', 'publish', 'deliver'];
    const artisticWords = ['art', 'canvas', 'palette', 'brush', 'stroke', 'sketch', 'draft', 'blueprint', 'template', 'framework', 'masterpiece', 'creation', 'work', 'project', 'venture', 'endeavor', 'mission', 'quest', 'journey', 'adventure', 'story', 'narrative', 'tale', 'chronicle', 'account', 'record', 'document', 'archive', 'collection', 'portfolio'];
    const dynamicWords = ['spark', 'ignite', 'kindle', 'fuel', 'power', 'energy', 'force', 'momentum', 'drive', 'passion', 'flow', 'rhythm', 'beat', 'pulse', 'wave', 'current', 'stream', 'river', 'ocean', 'universe', 'cosmos', 'galaxy', 'star', 'planet', 'earth', 'nature', 'element', 'essence', 'spirit', 'soul'];
    
    if (thoughtWords.includes(word)) return 'thought';
    if (creationWords.includes(word)) return 'creation';
    if (editingWords.includes(word)) return 'editing';
    if (artisticWords.includes(word)) return 'artistic';
    if (dynamicWords.includes(word)) return 'dynamic';
    
    return 'creative';
  };

  const category = getCategoryFromWord(word);
  const icon = getIconForCategory(category);

  return (
    <div 
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-yellow-900 ${className}`}
      title={`${word} (${category})`}
    >
      {icon}
    </div>
  );
};
