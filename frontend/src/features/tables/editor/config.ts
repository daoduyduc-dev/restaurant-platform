import type { StructureElement } from './types';

export const GRID_SIZE = 64;
export const MAJOR_GRID_INTERVAL = 5;
export const MIN_SCALE = 0.4;
export const MAX_SCALE = 3.5;
export const ZOOM_FACTOR = 1.08;
export const DEFAULT_VIEWPORT_PADDING = 40;

export const EDITOR_WORLD_SIZE = {
  width: 6000,
  height: 3600,
} as const;

export const EDITOR_LAYOUT_SIZE = {
  width: 1800,
  height: 1080,
} as const;

export const EDITOR_WORLD_BOUNDS = {
  x: 0,
  y: 0,
  width: EDITOR_LAYOUT_SIZE.width,
  height: EDITOR_LAYOUT_SIZE.height,
} as const;

export const DEFAULT_STRUCTURE_SHELL: readonly StructureElement[] = [
  { id: 'wall-top', kind: 'wall', x: 0, y: 0, width: EDITOR_LAYOUT_SIZE.width, height: 18 },
  { id: 'wall-left', kind: 'wall', x: 0, y: 0, width: 18, height: EDITOR_LAYOUT_SIZE.height },
  { id: 'wall-right', kind: 'wall', x: EDITOR_LAYOUT_SIZE.width - 18, y: 0, width: 18, height: EDITOR_LAYOUT_SIZE.height },
  { id: 'wall-bottom', kind: 'wall', x: 0, y: EDITOR_LAYOUT_SIZE.height - 18, width: EDITOR_LAYOUT_SIZE.width, height: 18 },
  { id: 'window-a', kind: 'window', x: 220, y: 18, width: 180, height: 20 },
  { id: 'window-b', kind: 'window', x: 620, y: 18, width: 180, height: 20 },
  { id: 'window-c', kind: 'window', x: 1020, y: 18, width: 180, height: 20 },
  { id: 'door-main', kind: 'door', x: EDITOR_LAYOUT_SIZE.width - 220, y: EDITOR_LAYOUT_SIZE.height - 30, width: 140, height: 12, label: 'Entry' },
  { id: 'stairs-service', kind: 'stair', x: 80, y: EDITOR_LAYOUT_SIZE.height - 210, width: 160, height: 120, steps: 6, label: 'Stairs' },
] as const;
