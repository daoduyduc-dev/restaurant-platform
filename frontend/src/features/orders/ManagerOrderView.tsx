import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { OrderDTO, UserDTO } from '../../services/types';
import { BarChart3, AlertTriangle, Users, Timer, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useWebSocket } from '../../services/useWebSocket';
import { Button, Card, Badge } from '../../components/ui';
import { toast } from '../../store/toastStore';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const ALL_STATUSES = ['OPEN', 'COOKING', 'READY', 'SERVED', 'PAID'];
const STATUS_COLORS: Record<string, string> = {
  OPEN: '#3B82F6', COOKING: '#EF4444', READY: '#10B981', SERVED: '#6B7280', PAID: '#8B5CF6',
};

function getMinutes(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
}

export const ManagerOrderView = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [staff, setStaff] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const items = res.data.data?.items || res.data.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch { console.error('Failed'); }
    finally { setLoading(false); }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.data?.items) setStaff(res.data.data.items.filter((u: UserDTO) => u.roles?.some(r => ['WAITER', 'KITCHEN'].includes(r.toUpperCase()))));
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  useEffect(() => { fetchOrders(); fetchStaff(); }, []);
  useWebSocket<OrderDTO>('/topic/orders/role/MANAGER', () => fetchOrders());

  const grouped = ALL_STATUSES.map(s => ({
    status: s,
    count: orders.filter(o => o.status === s).length,
    avgWait: (() => {
      const ords = orders.filter(o => o.status === s);
      if (!ords.length) return 0;
      return Math.round(ords.reduce((sum, o) => sum + getMinutes(o.createdAt || o.createdDate), 0) / ords.length);
    })(),
  }));

  const delayedOrders = orders.filter(o => ['OPEN', 'COOKING'].includes(o.status) && getMinutes(o.createdAt || o.createdDate) > 20);
  const totalActive = orders.filter(o => !['PAID', 'CANCELED'].includes(o.status)).length;

  const handleAssign = async (orderId: string, userId: string) => {
    try {
      await api.post(`/orders/${orderId}/assign`, { userId });
      toast.success('Order assigned');
      fetchOrders();
    } catch { toast.error('Failed to assign'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>
            <BarChart3 size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Order Pipeline
          </h1>
          <p>Monitor order flow and detect bottlenecks</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          {delayedOrders.length > 0 && (
            <Badge variant="error" size="medium" style={{ animation: 'pulse 1.5s infinite' }}>
              <AlertTriangle size={14} /> {delayedOrders.length} Delayed
            </Badge>
          )}
          <Button variant="secondary" size="medium" onClick={() => navigate('/report')}>
            <TrendingUp size={16} /> Full Reports
          </Button>
        </div>
      </motion.div>

      {/* Pipeline visualization */}
      <motion.div variants={item} style={{ marginBottom: 'var(--sp-6)' }}>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-end', marginBottom: 'var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>PIPELINE STATUS</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>· {totalActive} active orders</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'stretch' }}>
              {grouped.map((g, i) => (
                <div key={g.status} style={{ flex: 1, position: 'relative' }}>
                  <div style={{
                    background: `${STATUS_COLORS[g.status]}12`,
                    borderRadius: 'var(--r-lg)',
                    padding: 'var(--sp-4)',
                    border: g.count > 5 ? `2px solid ${STATUS_COLORS[g.status]}` : `1px solid ${STATUS_COLORS[g.status]}30`,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: STATUS_COLORS[g.status] }}>{g.count}</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-1)' }}>{g.status}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: g.avgWait > 20 ? 'var(--rose)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Clock size={11} /> Avg {g.avgWait}m
                    </div>
                  </div>
                  {i < grouped.length - 1 && (
                    <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-300)', fontSize: 20 }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      {/* Delayed Orders Alert */}
      {delayedOrders.length > 0 && (
        <motion.div variants={item} style={{ marginBottom: 'var(--sp-6)' }}>
          <Card variant="elevated" style={{ border: '2px solid var(--rose)', background: 'rgba(225,29,72,0.03)' }}>
            <Card.Header>
              <Card.Title style={{ color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <AlertTriangle size={20} /> Bottleneck Alert — {delayedOrders.length} orders delayed &gt;20 min
              </Card.Title>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-4)' }}>
              <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                {delayedOrders.map(order => (
                  <div key={order.id} style={{
                    padding: 'var(--sp-3) var(--sp-4)',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--rose-bg)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{order.tableName}</span>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginLeft: 'var(--sp-3)' }}>
                        {order.status} · {order.items?.length || 0} items
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <Badge variant="error" size="small">
                        <Timer size={12} /> {getMinutes(order.createdAt || order.createdDate)}m
                      </Badge>
                      {staff.length > 0 && (
                        <select
                          onChange={(e) => e.target.value && handleAssign(order.id, e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-main)', fontSize: 'var(--text-sm)' }}
                          defaultValue=""
                        >
                          <option value="">Assign...</option>
                          {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      )}

      {/* All Orders Table */}
      <motion.div variants={item}>
        <Card variant="elevated">
          <Card.Header>
            <Card.Title>All Active Orders</Card.Title>
            <Card.Description>Full operational view</Card.Description>
          </Card.Header>
          <Card.Content style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th><th>Table</th><th>Status</th><th>Items</th><th>Amount</th><th>Wait Time</th><th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => !['PAID', 'CANCELED'].includes(o.status)).map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>#{order.id.substring(0, 8)}</td>
                    <td style={{ fontWeight: 600 }}>{order.tableName}</td>
                    <td><Badge variant={order.status === 'READY' ? 'success' : order.status === 'COOKING' ? 'warning' : 'info'} size="small">{order.status}</Badge></td>
                    <td>{order.items?.length || 0}</td>
                    <td style={{ fontWeight: 600 }}>${(order.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      <span style={{ color: getMinutes(order.createdAt || order.createdDate) > 20 ? 'var(--rose)' : 'var(--text-muted)', fontWeight: getMinutes(order.createdAt || order.createdDate) > 20 ? 700 : 400 }}>
                        {getMinutes(order.createdAt || order.createdDate)}m
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{order.assignedToName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
};
