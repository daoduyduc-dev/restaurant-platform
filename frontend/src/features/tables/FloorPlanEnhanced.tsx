import type { TableDTO } from '../../services/types';
import { Flower, Crown, DoorOpen } from 'lucide-react';
import {
  getBoundedTablePosition,
  getDefaultTableFallbackPosition,
  getTableRenderSize,
  resolveCollisions,
} from './positioning';

const STATUS_COLORS: Record<string, { fill: string; border: string; text: string; gradient: string }> = {
  AVAILABLE: { 
    fill: '#ECFDF5', 
    border: '#10B981', 
    text: '#059669',
    gradient: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)'
  },
  OCCUPIED:  { 
    fill: '#FEF2F2', 
    border: '#EF4444', 
    text: '#DC2626',
    gradient: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)'
  },
  RESERVED:  { 
    fill: '#FFFBEB', 
    border: '#F59E0B', 
    text: '#D97706',
    gradient: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)'
  },
  DIRTY:     { 
    fill: '#F3F4F6', 
    border: '#9CA3AF', 
    text: '#6B7280',
    gradient: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)'
  },
};

interface FloorPlanProps {
  tables: TableDTO[];
  onTableClick?: (table: TableDTO) => void;
  selectedId?: string | null;
  renderExtra?: (table: TableDTO) => React.ReactNode;
  dimUnavailable?: boolean;
  highlightStatuses?: string[];
  showCapacity?: boolean;
  minHeight?: string;
  showDecorations?: boolean;
}

export const FloorPlan = ({ 
  tables, 
  onTableClick, 
  selectedId, 
  renderExtra, 
  dimUnavailable, 
  highlightStatuses, 
  showCapacity = true, 
  minHeight = 'calc(100vh - var(--header-height) - 220px)',
  showDecorations = true
}: FloorPlanProps) => {
  const resolvedTables = resolveCollisions(tables);
  const vipTables = resolvedTables.filter((table) => table.type === 'VIP');

  return (
    <div className="floor-plan" style={{ minHeight }}>
      <div className="floor-plan-viewport">
        {/* Background pattern - subtle dot grid */}
        <div 
          className="floor-plan-grid" 
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Decorative Elements */}
        {showDecorations && (
          <>
          {/* Walls */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #8B7355, #A0896C, #8B7355)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }} />
          
          {/* Windows with curtains */}
          {[15, 45, 75].map((x, i) => (
            <div key={`window-${i}`} style={{
              position: 'absolute',
              top: '8px',
              left: `${x}%`,
              width: '60px',
              height: '80px',
              background: 'linear-gradient(180deg, #87CEEB, #B0E0E6)',
              border: '3px solid #8B7355',
              borderRadius: '4px 4px 0 0',
              boxShadow: 'inset 0 0 20px rgba(135, 206, 235, 0.5)',
            }}>
              {/* Left curtain */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '45%',
                height: '100%',
                background: 'linear-gradient(90deg, rgba(255,248,220,0.9), rgba(255,248,220,0.3))',
                clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 100%)',
              }} />
              {/* Right curtain */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '45%',
                height: '100%',
                background: 'linear-gradient(270deg, rgba(255,248,220,0.9), rgba(255,248,220,0.3))',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)',
              }} />
            </div>
          ))}

          {/* Door */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '80px',
            background: 'linear-gradient(135deg, #8B4513, #A0522D)',
            border: '3px solid #654321',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>
            <DoorOpen size={24} color="#FFD700" />
          </div>

          {/* Flowers/Plants decorations */}
          {[
            { x: '5%', y: '15%' },
            { x: '90%', y: '15%' },
            { x: '5%', y: '85%' },
            { x: '90%', y: '85%' },
          ].map((pos, i) => (
            <div key={`flower-${i}`} style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: '40px',
              height: '40px',
              background: 'radial-gradient(circle, rgba(34,197,94,0.2), transparent)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Flower size={20} color="#22C55E" />
            </div>
          ))}

          {/* VIP Room Area */}
          {vipTables.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '10%',
              right: '5%',
              width: '200px',
              padding: 'var(--sp-3)',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(180, 140, 40, 0.05))',
              border: '2px solid var(--orange-500)',
              borderRadius: 'var(--r-lg)',
              boxShadow: '0 8px 32px rgba(212, 175, 55, 0.2)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-2)',
                marginBottom: 'var(--sp-2)',
                color: 'var(--orange-600)',
                fontWeight: 700,
                fontSize: 'var(--text-sm)',
              }}>
                <Crown size={16} />
                VIP Room
              </div>
              <div style={{
                height: '100px',
                border: '1px dashed var(--orange-300)',
                borderRadius: 'var(--r-md)',
              }} />
            </div>
          )}
          </>
        )}

        {/* Tables */}
        {resolvedTables.map((table, i) => {
          const pos = getDefaultTableFallbackPosition(i);
        const colors = STATUS_COLORS[table.status] || STATUS_COLORS.AVAILABLE;
        const isSelected = selectedId === table.id;
        const isDimmed = dimUnavailable && table.status !== 'AVAILABLE';
        const isHighlighted = highlightStatuses?.includes(table.status);
        const size = getTableRenderSize(table.capacity);
        const x = getBoundedTablePosition(table.positionX, pos.x, 'x', size);
        const y = getBoundedTablePosition(table.positionY, pos.y, 'y', size);
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
              filter: isHighlighted ? `drop-shadow(0 0 8px ${colors.border})` : undefined,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              className="floor-table-shape"
              style={{
                width: size,
                height: size,
                borderRadius: isVip ? '16px' : '50%',
                border: `3px solid ${isSelected ? 'var(--orange-500)' : isVip ? '#D4AF37' : colors.border}`,
                background: isSelected ? 'var(--orange-100)' : colors.gradient,
                boxShadow: isSelected 
                  ? '0 0 20px rgba(212, 175, 55, 0.6), 0 4px 12px rgba(0,0,0,0.1)' 
                  : isVip
                    ? '0 0 0 3px rgba(212, 175, 55, 0.15), 0 2px 8px rgba(0,0,0,0.1)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
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
                  background: 'linear-gradient(135deg, #FDE68A, #D4AF37)',
                  border: '1px solid rgba(180, 140, 40, 0.8)',
                  color: '#6B4F00',
                  fontSize: 10,
                  fontWeight: 800,
                  boxShadow: '0 4px 10px rgba(180, 140, 40, 0.25)',
                }}>
                  <Crown size={10} />
                  VIP
                </div>
              )}
              <div style={{ 
                fontWeight: 800, 
                fontSize: 'var(--text-base)', 
                color: isSelected ? 'var(--orange-600)' : colors.text 
              }}>
                {table.name}
              </div>
              {showCapacity && (
                <div style={{ 
                  fontSize: '10px', 
                  color: colors.text, 
                  opacity: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  <span>👥</span> {table.capacity}
                </div>
              )}
            </div>
            {renderExtra?.(table)}
          </div>
        );
        })}
      </div>

      <div className="floor-plan-legend" style={{ backdropFilter: 'blur(10px)' }}>
        {Object.entries(STATUS_COLORS).map(([status, c]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              background: c.border,
              boxShadow: `0 0 8px ${c.border}40`,
            }} />
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{status}</span>
          </div>
        ))}
        {vipTables.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Crown size={12} color="#B8860B" />
            <span style={{ fontWeight: 600, color: '#8A6A00' }}>VIP</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const FloorPlanEnhanced = FloorPlan;
