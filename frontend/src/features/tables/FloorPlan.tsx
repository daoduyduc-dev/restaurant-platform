import type { TableDTO } from '../../services/types';
import { Crown } from 'lucide-react';
import {
  getBoundedTablePosition,
  getDefaultTableFallbackPosition,
  getTableRenderSize,
  resolveCollisions,
} from './positioning';
import { getTableStatusStyle } from './editor/layout';

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
  const resolvedTables = resolveCollisions(tables);
  const hasVipTables = resolvedTables.some((table) => table.type === 'VIP');

  return (
    <div className="floor-plan" style={{ minHeight }}>
      <div className="floor-plan-viewport">
        <div className="floor-plan-grid" />
        {resolvedTables.map((table, i) => {
          const pos = getDefaultTableFallbackPosition(i);
          const size = getTableRenderSize(table.capacity);
          const x = getBoundedTablePosition(table.positionX, pos.x, 'x', size);
          const y = getBoundedTablePosition(table.positionY, pos.y, 'y', size);
        const colors = getTableStatusStyle(table);
        const isSelected = selectedId === table.id;
        const isDimmed = dimUnavailable && table.status !== 'AVAILABLE';
        const isHighlighted = highlightStatuses?.includes(table.status);
        const isVip = table.type === 'VIP';

        return (
          <div
            key={table.id}
            className="floor-table"
            onClick={() => onTableClick?.(table)}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              marginLeft: `${-size / 2}px`,
              marginTop: `${-size / 2}px`,
              opacity: isDimmed ? 0.4 : 1,
              cursor: onTableClick ? 'pointer' : 'default',
              filter: isHighlighted ? 'drop-shadow(0 0 8px ' + colors.stroke + ')' : undefined,
            }}
          >
            <div
              className="floor-table-shape"
              style={{
                width: size,
                height: size,
                borderRadius: isVip ? '16px' : '50%',
                border: `3px solid ${colors.stroke}`,
                background: isSelected ? 'var(--orange-100)' : colors.fill,
                boxShadow: isSelected
                  ? `0 0 0 3px ${colors.stroke}33, 0 4px 12px rgba(0,0,0,0.1)`
                  : 'var(--shadow-sm)',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              {isVip && (
              <div style={{
                position: 'absolute',
                top: -10,
                right: -10,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 999,
                background: '#D4AF37',
                border: '1px solid rgba(255,255,255,0.5)',
                color: '#fff8dc',
                fontSize: 10,
                fontWeight: 800,
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                }}>
                  <Crown size={10} />
                  VIP
                </div>
              )}
              <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: colors.text }}>
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

      <div className="floor-plan-legend">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706' }} />
          <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Reserved</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
          <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Occupied</span>
        </div>
        {hasVipTables && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Crown size={12} color="#B8860B" />
            <span style={{ fontWeight: 600, color: '#8A6A00' }}>VIP</span>
          </div>
        )}
      </div>
    </div>
  );
};
