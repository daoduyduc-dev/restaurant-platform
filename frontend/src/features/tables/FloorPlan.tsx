import type { TableDTO } from '../../services/types';

const STATUS_COLORS: Record<string, { fill: string; border: string; text: string }> = {
  AVAILABLE: { fill: '#ECFDF5', border: '#10B981', text: '#059669' },
  OCCUPIED:  { fill: '#FEF2F2', border: '#EF4444', text: '#DC2626' },
  RESERVED:  { fill: '#FFFBEB', border: '#F59E0B', text: '#D97706' },
  DIRTY:     { fill: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
};

const DEFAULT_POSITIONS = [
  { x: 8, y: 8 }, { x: 28, y: 8 }, { x: 48, y: 8 }, { x: 68, y: 8 },
  { x: 8, y: 35 }, { x: 28, y: 35 }, { x: 48, y: 35 }, { x: 68, y: 35 },
  { x: 8, y: 62 }, { x: 28, y: 62 }, { x: 48, y: 62 }, { x: 68, y: 62 },
  { x: 88, y: 8 }, { x: 88, y: 35 }, { x: 88, y: 62 },
];

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
    <div className="floor-plan" style={{ minHeight, position: 'relative' }}>
      <div className="floor-plan-grid" />
      {tables.map((table, i) => {
        const pos = DEFAULT_POSITIONS[i % DEFAULT_POSITIONS.length];
        const x = table.positionX ?? pos.x;
        const y = table.positionY ?? pos.y;
        const colors = STATUS_COLORS[table.status] || STATUS_COLORS.AVAILABLE;
        const isSelected = selectedId === table.id;
        const isDimmed = dimUnavailable && table.status !== 'AVAILABLE';
        const isHighlighted = highlightStatuses?.includes(table.status);
        const size = table.capacity > 6 ? 100 : table.capacity > 4 ? 88 : 76;

        return (
          <div
            key={table.id}
            className="floor-table"
            onClick={() => onTableClick?.(table)}
            style={{
              left: `${x}%`,
              top: `${y}%`,
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

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16,
        display: 'flex', gap: 16, padding: '8px 16px',
        background: 'rgba(255,255,255,0.9)', borderRadius: 'var(--r-md)',
        border: '1px solid var(--border-main)', fontSize: 'var(--text-xs)',
      }}>
        {Object.entries(STATUS_COLORS).map(([status, c]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.border }} />
            <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
