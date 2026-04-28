import type { TableDTO, TableType } from '../../services/types';

const LEGACY_LAYOUT_WIDTH = 800;
const LEGACY_LAYOUT_HEIGHT = 450;
const MIN_PERCENT = 4;
const MAX_PERCENT = 92;
const SAFE_X_MIN = 8;
const SAFE_X_MAX = 92;
const SAFE_Y_MIN = 10;
const SAFE_Y_MAX = 90;
const COLLISION_PADDING = 8;
const MAX_RELAXATION_STEPS = 120;
const MAX_STEP_DISTANCE = 18;
const STEP_DAMPING = 0.4;
const POSITION_EPSILON = 0.01;
const VIP_MOBILITY = 0.3;
const NORMAL_MOBILITY = 1;
const VIP_ANCHOR_STRENGTH = 0.08;
const NORMAL_ANCHOR_STRENGTH = 0.045;

type Axis = 'x' | 'y';
type CollisionShape = 'circle' | 'rectangle';

type CollisionTable = Pick<TableDTO, 'id' | 'capacity' | 'positionX' | 'positionY' | 'type'>;

type Point = {
  x: number;
  y: number;
};

type SeparationVector = Point & {
  overlap: number;
};

type LayoutNode<T extends CollisionTable> = {
  table: T;
  index: number;
  shape: CollisionShape;
  size: number;
  radius: number;
  mobility: number;
  anchorStrength: number;
  x: number;
  y: number;
  originalX: number;
  originalY: number;
};

export const DEFAULT_TABLE_FALLBACK_POSITIONS: ReadonlyArray<Point> = [
  { x: 5, y: 12 }, { x: 18, y: 12 }, { x: 31, y: 12 }, { x: 44, y: 12 }, { x: 57, y: 12 }, { x: 70, y: 12 },
  { x: 5, y: 28 }, { x: 18, y: 28 }, { x: 31, y: 28 }, { x: 44, y: 28 }, { x: 57, y: 28 }, { x: 70, y: 28 },
  { x: 5, y: 44 }, { x: 18, y: 44 }, { x: 31, y: 44 }, { x: 44, y: 44 }, { x: 57, y: 44 }, { x: 70, y: 44 },
  { x: 5, y: 60 }, { x: 18, y: 60 }, { x: 31, y: 60 }, { x: 44, y: 60 }, { x: 57, y: 60 }, { x: 70, y: 60 },
  { x: 5, y: 76 }, { x: 18, y: 76 }, { x: 31, y: 76 }, { x: 44, y: 76 }, { x: 57, y: 76 }, { x: 70, y: 76 },
];

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const roundPosition = (value: number) => {
  return Number(value.toFixed(3));
};

const percentToPixels = (value: number, axis: Axis) => {
  const layoutSize = axis === 'x' ? LEGACY_LAYOUT_WIDTH : LEGACY_LAYOUT_HEIGHT;
  return (value / 100) * layoutSize;
};

const pixelsToPercent = (value: number, axis: Axis) => {
  const layoutSize = axis === 'x' ? LEGACY_LAYOUT_WIDTH : LEGACY_LAYOUT_HEIGHT;
  return (value / layoutSize) * 100;
};

const getTieBreakerDirection = (aIndex: number, bIndex: number): Point => {
  const angle = ((((aIndex + 1) * 97) + ((bIndex + 1) * 57)) % 360) * (Math.PI / 180);
  return { x: Math.cos(angle), y: Math.sin(angle) };
};

const getNormalizedDirection = (
  dx: number,
  dy: number,
  aIndex: number,
  bIndex: number
): Point => {
  const distance = Math.hypot(dx, dy);
  if (distance > POSITION_EPSILON) {
    return { x: dx / distance, y: dy / distance };
  }

  return getTieBreakerDirection(aIndex, bIndex);
};

const toPercent = (value: number, maxValue: number) => {
  return clamp((value / maxValue) * 100, MIN_PERCENT, MAX_PERCENT);
};

export const getDefaultTableFallbackPosition = (index: number) => {
  return DEFAULT_TABLE_FALLBACK_POSITIONS[index % DEFAULT_TABLE_FALLBACK_POSITIONS.length];
};

export const getTableRenderSize = (capacity: number) => {
  if (capacity > 6) {
    return 100;
  }

  if (capacity > 4) {
    return 88;
  }

  return 76;
};

export const getTableCollisionShape = (type: TableType): CollisionShape => {
  return type === 'VIP' ? 'rectangle' : 'circle';
};

const getAxisSafeBounds = (axis: Axis, size: number) => {
  const layoutSize = axis === 'x' ? LEGACY_LAYOUT_WIDTH : LEGACY_LAYOUT_HEIGHT;
  const halfSizePercent = (size / layoutSize) * 50;
  const safeMin = (axis === 'x' ? SAFE_X_MIN : SAFE_Y_MIN) + halfSizePercent;
  const safeMax = (axis === 'x' ? SAFE_X_MAX : SAFE_Y_MAX) - halfSizePercent;

  return { safeMin, safeMax };
};

export const normalizeTablePosition = (
  value: number | null | undefined,
  fallback: number,
  axis: Axis
) => {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  if (value >= 0 && value <= 100) {
    return value;
  }

  return axis === 'x'
    ? toPercent(value, LEGACY_LAYOUT_WIDTH)
    : toPercent(value, LEGACY_LAYOUT_HEIGHT);
};

export const getBoundedTablePosition = (
  value: number | null | undefined,
  fallback: number,
  axis: Axis,
  size: number
) => {
  const normalized = normalizeTablePosition(value, fallback, axis);
  const { safeMin, safeMax } = getAxisSafeBounds(axis, size);

  return clamp(normalized, safeMin, safeMax);
};

const clampNodeToBounds = <T extends CollisionTable>(node: LayoutNode<T>) => {
  const xBounds = getAxisSafeBounds('x', node.size);
  const yBounds = getAxisSafeBounds('y', node.size);

  node.x = clamp(node.x, percentToPixels(xBounds.safeMin, 'x'), percentToPixels(xBounds.safeMax, 'x'));
  node.y = clamp(node.y, percentToPixels(yBounds.safeMin, 'y'), percentToPixels(yBounds.safeMax, 'y'));
};

const getCircleCircleSeparation = <T extends CollisionTable>(
  a: LayoutNode<T>,
  b: LayoutNode<T>
): SeparationVector | null => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const minDistance = a.radius + b.radius + COLLISION_PADDING;
  const distance = Math.hypot(dx, dy);

  if (distance >= minDistance) {
    return null;
  }

  const direction = getNormalizedDirection(dx, dy, a.index, b.index);
  return {
    x: direction.x * (minDistance - distance),
    y: direction.y * (minDistance - distance),
    overlap: minDistance - distance,
  };
};

const getRectangleRectangleSeparation = <T extends CollisionTable>(
  a: LayoutNode<T>,
  b: LayoutNode<T>
): SeparationVector | null => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const overlapX = (a.size + b.size) / 2 + COLLISION_PADDING - Math.abs(dx);
  const overlapY = (a.size + b.size) / 2 + COLLISION_PADDING - Math.abs(dy);

  if (overlapX <= 0 || overlapY <= 0) {
    return null;
  }

  const direction = getNormalizedDirection(dx, dy, a.index, b.index);

  if (overlapX <= overlapY) {
    return {
      x: Math.sign(direction.x || 1) * overlapX,
      y: 0,
      overlap: overlapX,
    };
  }

  return {
    x: 0,
    y: Math.sign(direction.y || 1) * overlapY,
    overlap: overlapY,
  };
};

const getCircleRectangleSeparation = <T extends CollisionTable>(
  circle: LayoutNode<T>,
  rectangle: LayoutNode<T>
): SeparationVector | null => {
  const halfSize = rectangle.size / 2;
  const rectLeft = rectangle.x - halfSize;
  const rectRight = rectangle.x + halfSize;
  const rectTop = rectangle.y - halfSize;
  const rectBottom = rectangle.y + halfSize;
  const closestX = clamp(circle.x, rectLeft, rectRight);
  const closestY = clamp(circle.y, rectTop, rectBottom);
  const dx = closestX - circle.x;
  const dy = closestY - circle.y;
  const distance = Math.hypot(dx, dy);
  const minimumDistance = circle.radius + COLLISION_PADDING;

  if (distance > POSITION_EPSILON) {
    if (distance >= minimumDistance) {
      return null;
    }

    return {
      x: (dx / distance) * (minimumDistance - distance),
      y: (dy / distance) * (minimumDistance - distance),
      overlap: minimumDistance - distance,
    };
  }

  const offsetX = circle.x - rectangle.x;
  const offsetY = circle.y - rectangle.y;
  const overlapX = halfSize + circle.radius + COLLISION_PADDING - Math.abs(offsetX);
  const overlapY = halfSize + circle.radius + COLLISION_PADDING - Math.abs(offsetY);
  const tieBreaker = getTieBreakerDirection(circle.index, rectangle.index);

  if (overlapX <= overlapY) {
    const sign = offsetX !== 0 ? Math.sign(offsetX) : Math.sign(tieBreaker.x || 1);
    return {
      x: sign * overlapX,
      y: 0,
      overlap: overlapX,
    };
  }

  const sign = offsetY !== 0 ? Math.sign(offsetY) : Math.sign(tieBreaker.y || 1);
  return {
    x: 0,
    y: sign * overlapY,
    overlap: overlapY,
  };
};

const getSeparationVector = <T extends CollisionTable>(
  a: LayoutNode<T>,
  b: LayoutNode<T>
): SeparationVector | null => {
  if (a.shape === 'circle' && b.shape === 'circle') {
    return getCircleCircleSeparation(a, b);
  }

  if (a.shape === 'rectangle' && b.shape === 'rectangle') {
    return getRectangleRectangleSeparation(a, b);
  }

  if (a.shape === 'circle') {
    return getCircleRectangleSeparation(a, b);
  }

  const separation = getCircleRectangleSeparation(b, a);
  if (!separation) {
    return null;
  }

  return {
    x: -separation.x,
    y: -separation.y,
    overlap: separation.overlap,
  };
};

export const resolveCollisions = <T extends CollisionTable>(tables: T[]): T[] => {
  if (tables.length <= 1) {
    return tables.map((table, index) => {
      const fallback = getDefaultTableFallbackPosition(index);
      const size = getTableRenderSize(table.capacity);

      return {
        ...table,
        positionX: roundPosition(getBoundedTablePosition(table.positionX, fallback.x, 'x', size)),
        positionY: roundPosition(getBoundedTablePosition(table.positionY, fallback.y, 'y', size)),
      };
    });
  }

  const nodes: Array<LayoutNode<T>> = tables.map((table, index) => {
    const fallback = getDefaultTableFallbackPosition(index);
    const size = getTableRenderSize(table.capacity);
    const boundedX = getBoundedTablePosition(table.positionX, fallback.x, 'x', size);
    const boundedY = getBoundedTablePosition(table.positionY, fallback.y, 'y', size);

    return {
      table,
      index,
      shape: getTableCollisionShape(table.type),
      size,
      radius: size / 2,
      mobility: table.type === 'VIP' ? VIP_MOBILITY : NORMAL_MOBILITY,
      anchorStrength: table.type === 'VIP' ? VIP_ANCHOR_STRENGTH : NORMAL_ANCHOR_STRENGTH,
      x: percentToPixels(boundedX, 'x'),
      y: percentToPixels(boundedY, 'y'),
      originalX: percentToPixels(boundedX, 'x'),
      originalY: percentToPixels(boundedY, 'y'),
    };
  });

  for (let step = 0; step < MAX_RELAXATION_STEPS; step += 1) {
    const forces = nodes.map((node) => ({
      x: (node.originalX - node.x) * node.anchorStrength,
      y: (node.originalY - node.y) * node.anchorStrength,
    }));
    let hasOverlap = false;
    let maxMovement = 0;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const separation = getSeparationVector(nodes[i], nodes[j]);
        if (!separation) {
          continue;
        }

        hasOverlap = true;

        const totalMobility = nodes[i].mobility + nodes[j].mobility;
        const aShare = totalMobility === 0 ? 0.5 : nodes[i].mobility / totalMobility;
        const bShare = totalMobility === 0 ? 0.5 : nodes[j].mobility / totalMobility;

        forces[i].x -= separation.x * aShare;
        forces[i].y -= separation.y * aShare;
        forces[j].x += separation.x * bShare;
        forces[j].y += separation.y * bShare;
      }
    }

    for (let i = 0; i < nodes.length; i += 1) {
      const stepX = clamp(forces[i].x * STEP_DAMPING, -MAX_STEP_DISTANCE, MAX_STEP_DISTANCE);
      const stepY = clamp(forces[i].y * STEP_DAMPING, -MAX_STEP_DISTANCE, MAX_STEP_DISTANCE);

      nodes[i].x += stepX;
      nodes[i].y += stepY;
      clampNodeToBounds(nodes[i]);

      maxMovement = Math.max(maxMovement, Math.hypot(stepX, stepY));
    }

    if (!hasOverlap && maxMovement < 0.25) {
      break;
    }
  }

  return nodes.map((node) => ({
    ...node.table,
    positionX: roundPosition(pixelsToPercent(node.x, 'x')),
    positionY: roundPosition(pixelsToPercent(node.y, 'y')),
  }));
};
