import type { TableDTO } from '../../../services/types';
import { getDefaultTableFallbackPosition } from '../positioning';
import { EDITOR_LAYOUT_SIZE } from './config';
import type { CanvasPoint, TableCanvasRect } from './types';

const STATUS_STYLES = {
  AVAILABLE: { fill: '#ECFDF3', stroke: '#10B981', text: '#047857' },
  RESERVED: { fill: '#FFFBEB', stroke: '#D97706', text: '#92400E' },
  OCCUPIED: { fill: '#FEF2F2', stroke: '#EF4444', text: '#B91C1C' },
} as const;

const roundCanvasCoordinate = (value: number) => Math.round(value);

export const getTableCanvasSize = (table: Pick<TableDTO, 'capacity' | 'type'>) => {
  const baseWidth = table.capacity > 6 ? 152 : table.capacity > 4 ? 136 : 118;
  const baseHeight = table.capacity > 6 ? 92 : table.capacity > 4 ? 86 : 78;

  if (table.type === 'VIP') {
    return {
      width: baseWidth + 22,
      height: baseHeight + 10,
    };
  }

  return {
    width: baseWidth,
    height: baseHeight,
  };
};

export const getDefaultTableCanvasPoint = (
  table: Pick<TableDTO, 'capacity' | 'type'>,
  index: number
): CanvasPoint => {
  const size = getTableCanvasSize(table);
  const fallback = getDefaultTableFallbackPosition(index);

  return {
    x: roundCanvasCoordinate(((fallback.x / 100) * EDITOR_LAYOUT_SIZE.width) - (size.width / 2)),
    y: roundCanvasCoordinate(((fallback.y / 100) * EDITOR_LAYOUT_SIZE.height) - (size.height / 2)),
  };
};

export const getTableCanvasPoint = (table: TableDTO, index: number): CanvasPoint => {
  const fallbackPoint = getDefaultTableCanvasPoint(table, index);

  return {
    x: roundCanvasCoordinate(
      table.positionX == null || Number.isNaN(table.positionX) ? fallbackPoint.x : table.positionX
    ),
    y: roundCanvasCoordinate(
      table.positionY == null || Number.isNaN(table.positionY) ? fallbackPoint.y : table.positionY
    ),
  };
};

export const normalizeTableToCanvasSpace = (table: TableDTO, index: number): TableDTO => {
  const point = getTableCanvasPoint(table, index);

  return {
    ...table,
    positionX: point.x,
    positionY: point.y,
  };
};

export const getTableCanvasRect = (table: TableDTO, index: number): TableCanvasRect => {
  const size = getTableCanvasSize(table);
  const point = getTableCanvasPoint(table, index);

  return {
    x: point.x,
    y: point.y,
    width: size.width,
    height: size.height,
    isVip: table.type === 'VIP',
  };
};

export const getTableStatusStyle = (table: Pick<TableDTO, 'status' | 'type'>) => {
  const statusStyle = STATUS_STYLES[table.status] ?? STATUS_STYLES.AVAILABLE;

  return {
    ...statusStyle,
  };
};

export const toRoundedCanvasPoint = (point: CanvasPoint): CanvasPoint => {
  return {
    x: roundCanvasCoordinate(point.x),
    y: roundCanvasCoordinate(point.y),
  };
};
