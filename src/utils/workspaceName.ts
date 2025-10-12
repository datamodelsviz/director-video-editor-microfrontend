// Pool of creative words representing thought, imagination, inspiration, creation, building, editing, production
const CREATIVE_WORDS = [
  // Thought & Imagination
  'vision', 'dream', 'idea', 'concept', 'notion', 'thought', 'imagination', 'fantasy', 'inspiration', 'muse',
  'creativity', 'innovation', 'invention', 'discovery', 'insight', 'wisdom', 'intuition', 'reflection', 'contemplation', 'meditation',
  'envision', 'visualize', 'imagine', 'conceive', 'devise', 'brainstorm', 'ideate', 'ponder', 'consider', 'reflect',
  
  // Creation & Building
  'create', 'build', 'craft', 'design', 'construct', 'develop', 'produce', 'generate', 'form', 'shape',
  'forge', 'sculpt', 'carve', 'mold', 'fashion', 'assemble', 'compose', 'arrange', 'organize', 'structure',
  'architect', 'engineer', 'fabricate', 'manufacture', 'synthesize', 'combine', 'blend', 'merge', 'unite', 'connect',
  
  // Editing & Production
  'edit', 'refine', 'polish', 'perfect', 'enhance', 'improve', 'optimize', 'upgrade', 'transform', 'evolve',
  'adapt', 'modify', 'adjust', 'tune', 'calibrate', 'fine-tune', 'customize', 'personalize', 'tailor', 'configure',
  'process', 'render', 'compile', 'execute', 'implement', 'deploy', 'launch', 'release', 'publish', 'deliver',
  
  // Artistic & Creative
  'art', 'canvas', 'palette', 'brush', 'stroke', 'sketch', 'draft', 'blueprint', 'template', 'framework',
  'masterpiece', 'creation', 'work', 'project', 'venture', 'endeavor', 'mission', 'quest', 'journey', 'adventure',
  'story', 'narrative', 'tale', 'chronicle', 'account', 'record', 'document', 'archive', 'collection', 'portfolio',
  
  // Dynamic & Action
  'spark', 'ignite', 'kindle', 'fuel', 'power', 'energy', 'force', 'momentum', 'drive', 'passion',
  'flow', 'rhythm', 'beat', 'pulse', 'wave', 'current', 'stream', 'river', 'ocean', 'universe',
  'cosmos', 'galaxy', 'star', 'planet', 'earth', 'nature', 'element', 'essence', 'spirit', 'soul'
];

/**
 * Get a random creative word from the pool
 */
const getRandomCreativeWord = (): string => {
  const randomIndex = Math.floor(Math.random() * CREATIVE_WORDS.length);
  return CREATIVE_WORDS[randomIndex];
};

/**
 * Get the category of a creative word for icon selection
 */
export const getWordCategory = (word: string): string => {
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
  
  return 'creative'; // default category
};

/**
 * Generate a default workspace name in format: word-MMMddyyhhmmss
 * Example: vision-Oct1124250030 (vision + October 11, 2024, 25:00:30)
 */
export const generateDefaultWorkspaceName = (): string => {
  const now = new Date();
  
  // Get month abbreviation (MMM)
  const month = now.toLocaleDateString('en-US', { month: 'short' });
  
  // Get day (dd) - pad with zero if needed
  const day = now.getDate().toString().padStart(2, '0');
  
  // Get year (yy) - last two digits
  const year = now.getFullYear().toString().slice(-2);
  
  // Get hours (hh) - 24-hour format, pad with zero if needed
  const hours = now.getHours().toString().padStart(2, '0');
  
  // Get minutes (mm) - pad with zero if needed
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  // Get seconds (ss) - pad with zero if needed
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  // Get random creative word
  const creativeWord = getRandomCreativeWord();
  
  // Combine: word + - + MMM + dd + yy + hh + mm + ss
  const result = `${creativeWord}-${month}${day}${year}${hours}${minutes}${seconds}`;
  console.log('[WorkspaceName] Generated name:', result);
  return result;
};

/**
 * Extract the creative word from a workspace name
 */
export const extractCreativeWord = (name: string): string => {
  const match = name.match(/^([a-zA-Z]+)-/);
  return match ? match[1] : 'creative';
};

/**
 * Get a user-friendly display name for the workspace
 * Shows the generated name but with better formatting
 */
export const getWorkspaceDisplayName = (name: string): string => {
  // If it's our new generated format, show it as-is
  if (name.match(/^[a-zA-Z]+-[A-Za-z]{3}\d{2}\d{2}\d{2}\d{2}\d{2}$/)) {
    return name;
  }
  
  // For other names, return as-is
  return name;
};