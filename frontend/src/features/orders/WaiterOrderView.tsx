import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { OrderDTO } from '../../services/types';
import { ClipboardList, Bell, CheckCircle, Clock, ChevronRight, Zap, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useWebSocket } from '../../services/useWebSocket';
import { Button, Card, Badge } from '../../components/ui';
import { toast } from '../../store/toastStore';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const STATUS_COLS = [
  { key: 'OPEN',    label: 'New',       color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  { key: 'COOKING', label: 'Cooking',   color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  { key: 'READY',   label: '🔔 Ready',  color: '#059669', bg: 'rgba(5,150,105,0.08)' },
  { key: 'SERVED',  label: 'Served',    color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
];

function timeSince(dateStr: string) {
  const d = new Date(dateStr);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export const WaiterOrderView = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const items = res.data.data?.items || res.data.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch { console.error('Failed to fetch orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  useWebSocket<OrderDTO>(['/topic/orders', '/topic/orders/role/WAITER'], () => {
    fetchOrders();
  });

  const handleMarkServed = async (id: string) => {
    try {
      await api.patch(`/orders/${id}/status?status=SERVED`);
      toast.success('Order marked as served');
      fetchOrders();
    } catch { toast.error('Failed to update'); }
  };

  const grouped = STATUS_COLS.map(col => ({
    ...col,
    orders: orders.filter(o => o.status === col.key),
  }));

  const readyCount = grouped.find(g => g.key === 'READY')?.orders.length || 0;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <motion.div variants={item} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>
            <Zap size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            My Orders
          </h1>
          <p>Quick actions for table service</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
          {readyCount > 0 && (
            <Badge variant="success" size="medium" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
              <Bell size={14} /> {readyCount} Ready to Serve
            </Badge>
          )}
          <Button variant="primary" size="medium" onClick={() => navigate('/tables')}>
            <ClipboardList size={16} /> New Order
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${STATUS_COLS.length}, 1fr)`,
        gap: 'var(--sp-4)',
        flex: 1,
        minHeight: 0,
      }}>
        {grouped.map(col => (
          <div key={col.key} style={{
            background: col.bg,
            borderRadius: 'var(--r-xl)',
            border: `1px solid ${col.color}20`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              padding: 'var(--sp-4) var(--sp-5)',
              borderBottom: `2px solid ${col.color}30`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-card)',
            }}>
              <div style={{ fontWeight: 700, color: col.color, fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col.label}
              </div>
              <Badge variant="neutral" size="small">{col.orders.length}</Badge>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {col.orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  No orders
                </div>
              ) : col.orders.map(order => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--r-lg)',
                    padding: 'var(--sp-4)',
                    border: `1px solid ${col.key === 'READY' ? 'rgba(5,150,105,0.4)' : 'var(--border-main)'}`,
                    boxShadow: col.key === 'READY' ? '0 0 16px rgba(5,150,105,0.15)' : 'var(--shadow-xs)',
                    animation: col.key === 'READY' ? 'pulse 2s ease-in-out infinite' : undefined,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 'var(--text-base)' }}>
                      {order.tableName}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Timer size={12} /> {timeSince(order.createdAt || order.createdDate)}
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }}>
                    {order.items?.length || 0} items · ${(order.totalAmount || 0).toFixed(2)}
                  </div>
                  {col.key === 'READY' && (
                    <Button variant="primary" size="small" style={{ width: '100%', marginTop: 'var(--sp-2)' }} onClick={() => handleMarkServed(order.id)}>
                      <CheckCircle size={14} /> Mark Served
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
