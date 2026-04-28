import { memo } from 'react';
import { Layer, Line, Rect, Text } from 'react-konva';
import type { TableDTO } from '../../../services/types';
import { getTableCanvasRect } from './layout';

interface OverlayLayerProps {
  tables: TableDTO[];
  selectedId?: string | null;
}

const EDITOR_ACCENT_COLOR = '#D4AF37';

export const OverlayLayer = memo(({ tables, selectedId }: OverlayLayerProps) => {
  const selectedIndex = tables.findIndex((table) => table.id === selectedId);
  const selectedTable = selectedIndex >= 0 ? tables[selectedIndex] : null;
  const selectedRect = selectedTable ? getTableCanvasRect(selectedTable, selectedIndex) : null;

  return (
    <Layer listening={false}>
      <Line
        points={[0, 0, 100, 0]}
        stroke="#F59E0B"
        strokeWidth={3}
        opacity={0.9}
        perfectDrawEnabled={false}
      />
      <Line
        points={[0, 0, 0, 100]}
        stroke="#F59E0B"
        strokeWidth={3}
        opacity={0.9}
        perfectDrawEnabled={false}
      />
      <Text
        x={10}
        y={10}
        text="(0, 0)"
        fontSize={16}
        fontStyle="bold"
        fill="#B45309"
        perfectDrawEnabled={false}
      />

      {selectedRect ? (
        <>
          <Rect
            x={selectedRect.x - 10}
            y={selectedRect.y - 10}
            width={selectedRect.width + 20}
            height={selectedRect.height + 20}
            stroke={EDITOR_ACCENT_COLOR}
            strokeWidth={3}
            dash={[12, 8]}
            cornerRadius={selectedRect.isVip ? 32 : 24}
            perfectDrawEnabled={false}
          />
          <Text
            x={selectedRect.x}
            y={selectedRect.y - 34}
            text={`${selectedRect.x}, ${selectedRect.y}`}
            fontSize={16}
            fontStyle="bold"
            fill="#92400E"
            perfectDrawEnabled={false}
          />
        </>
      ) : null}
    </Layer>
  );
});

OverlayLayer.displayName = 'OverlayLayer';
