import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { OrderDTO } from '../../services/types';
import { UserCheck, MapPin, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useWebSocket } from '../../services/useWebSocket';
import { Card, Badge } from '../../components/ui';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

export const ReceptionistOrderView = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const items = res.data.data?.items || res.data.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);
  useWebSocket<OrderDTO>('/topic/orders', () => fetchOrders());

  const servingOrders = orders.filter(o => ['OPEN', 'COOKING', 'READY'].includes(o.status));
  const completedRecent = orders.filter(o => ['SERVED', 'PAID'].includes(o.status)).slice(0, 10);
  const tablesAboutToFree = orders.filter(o => o.status === 'SERVED');

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>
            <UserCheck size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Order Status
          </h1>
          <p>Monitor which tables are being served and which will free up soon</p>
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div variants={item} className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.12)' }}><Clock size={20} color="#3B82F6" /></div>
              <div className="stat-card-value">{servingOrders.length}</div>
              <div className="stat-card-label">Currently Serving</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.12)' }}><CheckCircle size={20} color="#10B981" /></div>
              <div className="stat-card-value">{tablesAboutToFree.length}</div>
              <div className="stat-card-label">Tables Freeing Soon</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(212,175,55,0.12)' }}><MapPin size={20} color="var(--orange-500)" /></div>
              <div className="stat-card-value">{completedRecent.length}</div>
              <div className="stat-card-label">Recently Completed</div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)', marginTop: 'var(--sp-6)' }}>
        {/* Tables about to free */}
        <motion.div variants={item}>
          <Card variant="elevated">
            <Card.Header>
              <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <MapPin size={18} color="var(--teal)" /> Tables Freeing Soon
              </Card.Title>
              <Card.Description>Orders served — guests finishing up</Card.Description>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-4)' }}>
              {tablesAboutToFree.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)' }}>No tables freeing soon</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {tablesAboutToFree.map(o => (
                    <div key={o.id} style={{ padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--r-md)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{o.tableName}</span>
                      <Badge variant="success" size="small">Served</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>

        {/* Active orders */}
        <motion.div variants={item}>
          <Card variant="elevated">
            <Card.Header>
              <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <Clock size={18} color="#3B82F6" /> Currently Serving
              </Card.Title>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-4)' }}>
              {servingOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)' }}>No active orders</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {servingOrders.map(o => (
                    <div key={o.id} style={{ padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--r-md)', background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{o.tableName}</span>
                      <Badge variant={o.status === 'READY' ? 'success' : o.status === 'COOKING' ? 'warning' : 'info'} size="small">{o.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
