import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { OrderDTO } from '../../services/types';
import { Shield, FileText, Timer, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Card, Badge, Input } from '../../components/ui';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  OPEN: 'info', COOKING: 'warning', READY: 'success', SERVED: 'neutral', PAID: 'info', CANCELED: 'error',
};

export const AdminOrderView = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/orders');
        const items = res.data.data?.items || res.data.data || [];
        setOrders(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = orders.filter(o =>
    o.tableName?.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.status.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>
            <Shield size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Order Audit
          </h1>
          <p>Full order history with metadata for system verification</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="stats-grid">
        {[
          { label: 'Total Orders', value: orders.length, color: 'var(--orange-500)' },
          { label: 'Active', value: orders.filter(o => !['PAID', 'CANCELED'].includes(o.status)).length, color: 'var(--teal)' },
          { label: 'Completed', value: orders.filter(o => o.status === 'PAID').length, color: '#10B981' },
          { label: 'Cancelled', value: orders.filter(o => o.status === 'CANCELED').length, color: 'var(--rose)' },
        ].map((s, i) => (
          <Card key={i} variant="elevated">
            <Card.Content style={{ padding: 'var(--sp-5)' }}>
              <div className="stat-card">
                <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </motion.div>

      {/* Order Table */}
      <motion.div variants={item} style={{ marginTop: 'var(--sp-6)' }}>
        <Card variant="elevated">
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Card.Title><FileText size={18} style={{ display: 'inline', marginRight: 8 }} />Order Audit Log</Card.Title>
              <div style={{ width: 300 }}>
                <Input placeholder="Search by ID, table, status..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={16} />} />
              </div>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Table</th><th>Status</th><th>Items</th><th>Total</th><th>Created</th><th>Assigned To</th><th>Reservation</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{order.id.substring(0, 12)}...</td>
                    <td style={{ fontWeight: 600 }}>{order.tableName}</td>
                    <td><Badge variant={STATUS_COLORS[order.status] || 'neutral'} size="small">{order.status}</Badge></td>
                    <td>{order.items?.length || 0}</td>
                    <td style={{ fontWeight: 600 }}>${(order.totalAmount || 0).toFixed(2)}</td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                      {order.createdAt || order.createdDate ? new Date(order.createdAt || order.createdDate).toLocaleString() : '—'}
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{order.assignedToName || '—'}</td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{order.reservationId ? order.reservationId.substring(0, 8) : '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
};
