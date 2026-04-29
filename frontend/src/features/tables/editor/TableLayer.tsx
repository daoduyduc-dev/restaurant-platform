import { memo } from 'react';
import type Konva from 'konva';
import { Group, Label, Layer, Rect, Tag, Text } from 'react-konva';
import type { TableDTO } from '../../../services/types';
import { getTableCanvasRect, getTableStatusStyle, toRoundedCanvasPoint } from './layout';
import type { CanvasPoint } from './types';

interface TableLayerProps {
  tables: TableDTO[];
  selectedId?: string | null;
  onTableSelect?: (table: TableDTO) => void;
  onTablePositionChange?: (tableId: string, position: CanvasPoint) => void;
  onTablePositionCommit?: (tableId: string, position: CanvasPoint) => void;
  showCapacity?: boolean;
  draggableTables?: boolean;
}

interface TableNodeProps {
  table: TableDTO;
  index: number;
  selected: boolean;
  showCapacity: boolean;
  draggableTables: boolean;
  onTableSelect?: (table: TableDTO) => void;
  onTablePositionChange?: (tableId: string, position: CanvasPoint) => void;
  onTablePositionCommit?: (tableId: string, position: CanvasPoint) => void;
}

const EDITOR_ACCENT_COLOR = '#D4AF37';

const TableNode = memo(({
  table,
  index,
  selected,
  showCapacity,
  draggableTables,
  onTableSelect,
  onTablePositionChange,
  onTablePositionCommit,
}: TableNodeProps) => {
  const rect = getTableCanvasRect(table, index);
  const colors = getTableStatusStyle(table);
  const badgeFill = table.type === 'VIP' ? '#D4AF37' : colors.stroke;
  const fill = table.type === 'VIP' ? '#FFF7D6' : colors.fill;

  const updateCursor = (event: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
    const container = event.target.getStage()?.container();
    if (container) {
      container.style.cursor = cursor;
    }
  };

  const emitPosition = (
    event: Konva.KonvaEventObject<DragEvent>,
    callback?: (tableId: string, position: CanvasPoint) => void
  ) => {
    if (!callback) {
      return;
    }

    callback(table.id, toRoundedCanvasPoint({
      x: event.target.x(),
      y: event.target.y(),
    }));
  };

  return (
    <Group
      x={rect.x}
      y={rect.y}
      draggable={draggableTables}
      onClick={() => onTableSelect?.(table)}
      onTap={() => onTableSelect?.(table)}
      onDragStart={draggableTables ? (event) => updateCursor(event as Konva.KonvaEventObject<MouseEvent>, 'grabbing') : undefined}
      onDragMove={draggableTables ? (event) => emitPosition(event, onTablePositionChange) : undefined}
      onDragEnd={draggableTables ? (event) => {
        emitPosition(event, onTablePositionChange);
        emitPosition(event, onTablePositionCommit);
        const container = event.target.getStage()?.container();
        if (container) {
          container.style.cursor = 'grab';
        }
      } : undefined}
      onMouseEnter={(event) => updateCursor(event, draggableTables ? 'grab' : onTableSelect ? 'pointer' : 'default')}
      onMouseLeave={(event) => updateCursor(event, 'default')}
    >
      <Rect
        width={rect.width}
        height={rect.height}
        cornerRadius={table.type === 'VIP' ? 24 : 18}
        fill={fill}
        stroke={selected ? EDITOR_ACCENT_COLOR : badgeFill}
        strokeWidth={selected ? 4 : 2}
        shadowColor={selected ? 'rgba(212, 175, 55, 0.35)' : 'rgba(15, 23, 42, 0.12)'}
        shadowBlur={selected ? 18 : 10}
        shadowOffsetY={selected ? 8 : 4}
        shadowOpacity={1}
        perfectDrawEnabled={false}
      />

      <Rect
        x={0}
        y={0}
        width={rect.width}
        height={10}
        cornerRadius={[18, 18, 0, 0]}
        fill={badgeFill}
        opacity={0.95}
        perfectDrawEnabled={false}
      />

      {table.type === 'VIP' ? (
        <Label x={rect.width - 58} y={-16}>
          <Tag fill="#7C5A00" cornerRadius={999} />
          <Text
            text="VIP"
            fontSize={12}
            fontStyle="bold"
            fill="#FFF8DC"
            padding={8}
            perfectDrawEnabled={false}
          />
        </Label>
      ) : null}

      <Text
        x={12}
        y={20}
        width={rect.width - 24}
        text={table.name}
        align="center"
        fontSize={18}
        fontStyle="bold"
        fill={colors.text}
        perfectDrawEnabled={false}
      />

      {showCapacity ? (
        <Text
          x={12}
          y={rect.height - 30}
          width={rect.width - 24}
          text={`${table.capacity} seats`}
          align="center"
          fontSize={14}
          fill={colors.text}
          opacity={0.82}
          perfectDrawEnabled={false}
        />
      ) : null}
    </Group>
  );
}, (previousProps, nextProps) => {
  return previousProps.selected === nextProps.selected
    && previousProps.showCapacity === nextProps.showCapacity
    && previousProps.draggableTables === nextProps.draggableTables
    && previousProps.index === nextProps.index
    && previousProps.table.id === nextProps.table.id
    && previousProps.table.name === nextProps.table.name
    && previousProps.table.capacity === nextProps.table.capacity
    && previousProps.table.status === nextProps.table.status
    && previousProps.table.type === nextProps.table.type
    && previousProps.table.positionX === nextProps.table.positionX
    && previousProps.table.positionY === nextProps.table.positionY;
});

export const TableLayer = memo(({
  tables,
  selectedId,
  onTableSelect,
  onTablePositionChange,
  onTablePositionCommit,
  showCapacity = true,
  draggableTables = true,
}: TableLayerProps) => {
  return (
    <Layer>
      {tables.map((table, index) => (
        <TableNode
          key={table.id}
          table={table}
          index={index}
          selected={selectedId === table.id}
          showCapacity={showCapacity}
          draggableTables={draggableTables}
          onTableSelect={onTableSelect}
          onTablePositionChange={onTablePositionChange}
          onTablePositionCommit={onTablePositionCommit}
        />
      ))}
    </Layer>
  );
});

TableLayer.displayName = 'TableLayer';
