import type { TableDTO } from '../../services/types';

const STATUS_COLORS: Record<string, { fill: string; border: string; text: string }> = {
  AVAILABLE: { fill: '#ECFDF5', border: '#10B981', text: '#059669' },
  OCCUPIED: { fill: '#FEF2F2', border: '#EF4444', text: '#DC2626' },
  RESERVED: { fill: '#FFFBEB', border: '#F59E0B', text: '#D97706' },
  DIRTY: { fill: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
};

const DEFAULT_POSITIONS = [
  { x: 8, row: 0 }, { x: 28, row: 0 }, { x: 48, row: 0 }, { x: 68, row: 0 },
  { x: 8, row: 1 }, { x: 28, row: 1 }, { x: 48, row: 1 }, { x: 68, row: 1 },
  { x: 8, row: 2 }, { x: 28, row: 2 }, { x: 48, row: 2 }, { x: 68, row: 2 },
  { x: 88, row: 0 }, { x: 88, row: 1 }, { x: 88, row: 2 },
];

const DEFAULT_TOP_PADDING = 32;
const DEFAULT_TABLE_SIZE = 100;
const DEFAULT_VERTICAL_GAP = 36;
const FLOOR_PLAN_EXTRA_HEIGHT = 84;
const DEFAULT_ROW_COUNT = Math.max(...DEFAULT_POSITIONS.map((position) => position.row)) + 1;
const DEFAULT_LAYOUT_HEIGHT =
  DEFAULT_TOP_PADDING +
  DEFAULT_ROW_COUNT * DEFAULT_TABLE_SIZE +
  (DEFAULT_ROW_COUNT - 1) * DEFAULT_VERTICAL_GAP;

interface FloorPlanProps {
  tables: TableDTO[];
  onTableClick?: (table: TableDTO) => void;
  selectedId?: string | null;
  renderExtra?: (table: TableDTO) => React.ReactNode;
  dimUnavailable?: boolean;
  highlightStatuses?: string[];
  showCapacity?: boolean;
  minHeight?: string;
}

export const FloorPlan = ({ tables, onTableClick, selectedId, renderExtra, dimUnavailable, highlightStatuses, showCapacity = true, minHeight = 'calc(100vh - var(--header-height) - 220px)' }: FloorPlanProps) => {
  return (
    <div
      className="floor-plan"
      // 1. Thêm Flexbox vào container chính để tự động đẩy Legend xuống dưới
      style={{ minHeight, position: 'relative', overflowY: 'auto' }}
    >
      <div
        style={{
          minHeight: `calc(100% + ${FLOOR_PLAN_EXTRA_HEIGHT}px)`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="floor-plan-grid" />

      {/* 2. Bọc các bàn vào một div có flex: 1 để chiếm hết không gian bên trên, chừa lại chỗ cho Legend */}
      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: DEFAULT_LAYOUT_HEIGHT }}>
        {tables.map((table, i) => {
          const pos = DEFAULT_POSITIONS[i % DEFAULT_POSITIONS.length];
          const x = table.positionX ?? pos.x;
          const colors = STATUS_COLORS[table.status] || STATUS_COLORS.AVAILABLE;
          const isSelected = selectedId === table.id;
          const isDimmed = dimUnavailable && table.status !== 'AVAILABLE';
          const isHighlighted = highlightStatuses?.includes(table.status);
          const size = table.capacity > 6 ? 100 : table.capacity > 4 ? 88 : 76;
          const defaultTop = DEFAULT_TOP_PADDING + pos.row * (DEFAULT_TABLE_SIZE + DEFAULT_VERTICAL_GAP);
          const top = table.positionY !== undefined && table.positionY !== null ? `${table.positionY}%` : `${defaultTop}px`;

          return (
            <div
              key={table.id}
              className="floor-table"
              onClick={() => onTableClick?.(table)}
              style={{
                left: `${x}%`,
                top,
                opacity: isDimmed ? 0.4 : 1,
                cursor: onTableClick ? 'pointer' : 'default',
                filter: isHighlighted ? 'drop-shadow(0 0 8px ' + colors.border + ')' : undefined,
              }}
            >
              <div
                className="floor-table-shape"
                style={{
                  width: size,
                  height: size,
                  borderRadius: table.capacity > 6 ? '16px' : '50%',
                  border: `3px solid ${isSelected ? 'var(--orange-500)' : colors.border}`,
                  background: isSelected ? 'var(--orange-100)' : colors.fill,
                  boxShadow: isSelected ? 'var(--shadow-glow-orange)' : 'var(--shadow-sm)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: isSelected ? 'var(--orange-600)' : colors.text }}>
                  {table.name}
                </div>
                {showCapacity && (
                  <div style={{ fontSize: '10px', color: colors.text, opacity: 0.7, marginTop: 2 }}>
                    {table.capacity} seats
                  </div>
                )}
              </div>
              {renderExtra?.(table)}
            </div>
          );
        })}
      </div>

      {/* 3. Chỉnh sửa Legend: Bỏ absolute, dùng margin để cách lưới bàn đúng 36px */}
      <div style={{
        position: 'relative',    // Bỏ absolute để trở thành normal flow element
        alignSelf: 'flex-start', // Ôm sát width của nội dung, căn trái
        marginTop: 36,           // Khoảng cách 36px để không bị bàn đè
        marginBottom: 16,
        marginLeft: 16,
        display: 'flex', gap: 16, padding: '8px 16px',
        background: 'rgba(255,255,255,0.9)', borderRadius: 'var(--r-md)',
        border: '1px solid var(--border-main)', fontSize: 'var(--text-xs)',
        zIndex: 10               // Đảm bảo luôn nằm trên lớp background-grid
      }}>
        {Object.entries(STATUS_COLORS).map(([status, c]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.border }} />
            <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{status}</span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};
