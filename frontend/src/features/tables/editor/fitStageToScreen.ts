import { EDITOR_WORLD_BOUNDS } from './config';
import type { EditorViewport, SceneBounds } from './types';

type FitStageToScreenArgs = {
  stageWidth: number;
  stageHeight: number;
  worldBounds?: SceneBounds;
  padding?: number;
};

const resolveWorldBounds = (worldBounds?: SceneBounds): SceneBounds => {
  return worldBounds ?? EDITOR_WORLD_BOUNDS;
};

export const getWorldBounds = (worldBounds?: SceneBounds): SceneBounds => {
  return resolveWorldBounds(worldBounds);
};

export const fitStageToScreen = ({
  stageWidth,
  stageHeight,
  worldBounds,
  padding = 0,
}: FitStageToScreenArgs): EditorViewport => {
  const resolvedWorldBounds = resolveWorldBounds(worldBounds);
  const innerWidth = Math.max(stageWidth - (padding * 2), 1);
  const innerHeight = Math.max(stageHeight - (padding * 2), 1);
  const safeWorldWidth = Math.max(resolvedWorldBounds.width, 1);
  const safeWorldHeight = Math.max(resolvedWorldBounds.height, 1);
  const scale = Math.min(innerWidth / safeWorldWidth, innerHeight / safeWorldHeight);

  return {
    scale,
    x: ((stageWidth - (safeWorldWidth * scale)) / 2) - (resolvedWorldBounds.x * scale),
    y: ((stageHeight - (safeWorldHeight * scale)) / 2) - (resolvedWorldBounds.y * scale),
  };
};
