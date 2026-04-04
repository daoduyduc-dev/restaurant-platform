import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import type { OrderDTO } from '../../services/types';
import { ChefHat, Flame, Clock, CheckCircle, Timer, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useWebSocket } from '../../services/useWebSocket';
import { Button, Badge } from '../../components/ui';
import { toast } from '../../store/toastStore';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const COLS = [
  { key: 'OPEN',    label: '🆕 New Orders',  color: '#F59E0B', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)' },
  { key: 'COOKING', label: '🔥 Cooking',     color: '#EF4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.25)' },
  { key: 'READY',   label: '✅ Ready',       color: '#10B981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.25)' },
];

function getMinutes(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
}

function timeColor(mins: number) {
  if (mins < 10) return 'var(--teal)';
  if (mins < 20) return 'var(--amber)';
  return 'var(--rose)';
}

export const KitchenOrderView = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders');
      const items = res.data.data?.items || res.data.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch { console.error('Failed to fetch orders'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useWebSocket<OrderDTO>(['/topic/orders', '/topic/orders/role/KITCHEN'], () => {
    fetchOrders();
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/orders/${id}/status?status=${status}`);
      toast.success(`Order moved to ${status}`);
      fetchOrders();
    } catch { toast.error('Failed to update'); }
  };

  const grouped = COLS.map(col => ({
    ...col,
    orders: orders.filter(o => o.status === col.key),
  }));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <motion.div variants={item} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>
            <ChefHat size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Kitchen Display
          </h1>
          <p>Manage food preparation workflow</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
          {grouped[0].orders.length > 0 && (
            <Badge variant="warning" size="medium" style={{ animation: 'pulse 1.5s ease-in-out infinite', fontSize: 'var(--text-base)', padding: '6px 14px' }}>
              <Flame size={16} /> {grouped[0].orders.length} New Orders
            </Badge>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS.length}, 1fr)`,
        gap: 'var(--sp-5)',
        flex: 1,
        minHeight: 0,
      }}>
        {grouped.map(col => (
          <div key={col.key} style={{
            background: col.bg,
            borderRadius: 'var(--r-xl)',
            border: `2px solid ${col.border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              padding: 'var(--sp-5) var(--sp-5)',
              borderBottom: `2px solid ${col.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-card)',
            }}>
              <div style={{ fontWeight: 800, color: col.color, fontSize: 'var(--text-lg)' }}>
                {col.label}
              </div>
              <div style={{
                background: col.color,
                color: 'white',
                fontWeight: 800,
                fontSize: 'var(--text-lg)',
                width: 36, height: 36,
                borderRadius: 'var(--r-full)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {col.orders.length}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              {col.orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                  <CheckCircle size={40} style={{ opacity: 0.2, marginBottom: 'var(--sp-2)' }} />
                  <div>All clear!</div>
                </div>
              ) : col.orders.map(order => {
                const mins = getMinutes(order.createdAt || order.createdDate);
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--r-lg)',
                      padding: 'var(--sp-5)',
                      border: mins > 20 ? '2px solid var(--rose)' : `1px solid ${col.border}`,
                      boxShadow: col.key === 'OPEN' ? '0 0 20px rgba(245,158,11,0.1)' : 'var(--shadow-sm)',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--text-heading)' }}>
                        {order.tableName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-base)', fontWeight: 700, color: timeColor(mins) }}>
                        {mins > 20 && <AlertTriangle size={16} />}
                        <Timer size={16} />
                        {mins}m
                      </div>
                    </div>

                    {/* Items list — full detail for kitchen */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
                      {(order.items || []).map(itm => (
                        <div key={itm.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: 'var(--sp-2) var(--sp-3)',
                          borderRadius: 'var(--r-md)',
                          background: 'var(--gray-50)',
                        }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-base)' }}>
                            {itm.menuItemName}
                          </span>
                          <Badge variant="neutral" size="small" style={{ fontWeight: 800, fontSize: 'var(--text-base)' }}>
                            ×{itm.quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Action button — large touch target */}
                    {col.key === 'OPEN' && (
                      <Button variant="primary" size="medium" style={{ width: '100%', padding: '14px', fontSize: 'var(--text-base)', fontWeight: 700 }}
                        onClick={() => updateStatus(order.id, 'COOKING')}>
                        <Flame size={18} /> Start Cooking
                      </Button>
                    )}
                    {col.key === 'COOKING' && (
                      <Button variant="primary" size="medium" style={{ width: '100%', padding: '14px', fontSize: 'var(--text-base)', fontWeight: 700, background: 'var(--teal)', borderColor: 'var(--teal)' }}
                        onClick={() => updateStatus(order.id, 'READY')}>
                        <CheckCircle size={18} /> Mark Ready
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
