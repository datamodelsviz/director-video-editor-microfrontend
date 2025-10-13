// Core data model for Figma-like multi-frame editor

export interface BoardState {
  zoom: number;
  scroll: { x: number; y: number };
  snap: boolean;
  rulers: boolean;
  guides: Guide[];
}

export interface Guide {
  id: string;
  orientation: 'vertical' | 'horizontal';
  pos: number;
  locked?: boolean;
}

export interface Frame {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  background: string;
  fps: number;
  duration: number;
  posterTime: number;
  labelColor: string;
  layers: Layer[];
  timeline: TimelineState;
  // Figma-like properties
  locked?: boolean;
  visible?: boolean;
  opacity?: number;
  blendMode?: string;
}

export interface Layer {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'image' | 'shape';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  // Timeline properties
  startTime: number;
  duration: number;
  // Layer-specific properties
  [key: string]: any;
}

export interface TimelineState {
  duration: number;
  fps: number;
  tracks: Track[];
}

export interface Track {
  id: string;
  type: string;
  items: TrackItem[];
}

export interface TrackItem {
  id: string;
  name: string;
  start: number;
  duration: number;
  [key: string]: any;
}

export interface Sequence {
  order: string[]; // frame IDs in playback order
  transitions: Transition[];
  loop: boolean;
  playRange: { startIndex: number; endIndex: number };
}

export interface Transition {
  id: string;
  from: string; // frame ID
  to: string; // frame ID
  type: 'cut' | 'crossfade' | 'dipToBlack' | 'dipToWhite' | 'push';
  duration: number; // in seconds
  curve: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface Project {
  projectId: string;
  board: BoardState;
  frames: Frame[];
  sequence: Sequence;
}

// Editor modes
export type EditorMode = 'board' | 'frame';

export interface EditorState {
  mode: EditorMode;
  focusedFrameId: string | null;
  selectedFrameIds: string[];
  selectedLayerIds: string[];
  // Tool states
  currentTool: 'move' | 'hand' | 'frame' | 'text' | 'shape' | 'pen' | 'comment';
  // Board state
  boardState: BoardState;
  // Performance
  proxyQuality: 'full' | 'half' | 'quarter';
}

// Inspector tabs
export type InspectorTab = 'frame' | 'layers' | 'properties' | 'timeline';

export interface InspectorState {
  activeTab: InspectorTab;
  selectedItem: {
    type: 'frame' | 'layer';
    id: string;
  } | null;
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  cmd?: boolean;
  action: string;
  scope: 'board' | 'frame' | 'global';
}

// Performance and rendering
export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameThumbnail {
  frameId: string;
  dataUrl: string;
  lastUpdated: number;
  quality: 'full' | 'half' | 'quarter';
}

// Events
export interface BoardEvent {
  type: 'frameCreated' | 'frameMoved' | 'frameResized' | 'frameSelected' | 'frameDeleted';
  frameId: string;
  data?: any;
}

export interface SequenceEvent {
  type: 'frameAdded' | 'frameRemoved' | 'frameReordered' | 'transitionAdded' | 'transitionRemoved';
  data: any;
}
