import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { OrderDTO, TableDTO } from '../../services/types';
import { ClipboardList, Bell, CheckCircle, AlertCircle, Clock, Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWebSocket } from '../../services/useWebSocket';
import type { Variants } from 'framer-motion';
import { Button, Card, Badge } from '../../components/ui';
import { toast } from '../../store/toastStore';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const WaiterDashboard = () => {
  const navigate = useNavigate();
  const [myTables, setMyTables] = useState<TableDTO[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderDTO[]>([]);
  const [readyOrders, setReadyOrders] = useState<OrderDTO[]>([]);

  useEffect(() => {
    fetchTables();
    fetchOrders();
  }, []);

  // Live updates for orders ready to serve (subscribe to role-specific topic)
  useWebSocket<OrderDTO>('/topic/orders/role/WAITER', (msg) => {
    try {
      if (msg && msg.status === 'READY') {
        setReadyOrders((prev) => {
          // avoid duplicates
          if (prev.find(o => o.id === msg.id)) return prev;
          return [msg, ...prev];
        });
      }
      // Also refresh counts for active orders
      fetchOrders();
    } catch (e) {
      console.error('WS handler error:', e);
    }
  });

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables?status=OCCUPIED');
      if (res.data.data?.items) {
        setMyTables(res.data.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders?status=OPEN,PENDING');
      if (res.data.data?.items) {
        const orders = res.data.data.items;
        setActiveOrders(orders.filter(o => o.status === 'OPEN'));
        setReadyOrders(orders.filter(o => o.status === 'PENDING'));
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleMarkServed = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'SERVED' });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemAnim} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-400)' }}>Waiter Dashboard</h1>
          <p>Manage your tables and serve customers efficiently</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <Button variant="secondary" size="medium" onClick={() => { toast.info('Notifications page coming soon'); }}>
            <Bell size={16} /> Notifications
          </Button>
          <Button variant="primary" size="medium" onClick={() => navigate('/tables')}>
            <ClipboardList size={16} /> New Order
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemAnim} className="stats-grid">
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(45, 212, 191, 0.15)' }}>
                <Users size={20} color="var(--teal)" />
              </div>
              <div className="stat-card-value">{myTables.length}</div>
              <div className="stat-card-label">My Tables</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
                <Clock size={20} color="var(--orange-500)" />
              </div>
              <div className="stat-card-value">{activeOrders.length}</div>
              <div className="stat-card-label">Active Orders</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                <CheckCircle size={20} color="var(--green-500)" />
              </div>
              <div className="stat-card-value">{readyOrders.length}</div>
              <div className="stat-card-label">Ready to Serve</div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      {/* Ready to Serve Orders */}
      <motion.div variants={itemAnim} style={{ marginTop: 'var(--sp-6)' }}>
        <Card variant="elevated">
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <Bell size={18} color="var(--green-500)" />
                  Ready to Serve
                </Card.Title>
                <Card.Description>Kitchen has completed these orders</Card.Description>
              </div>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 'var(--sp-4)' }}>
            {readyOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)' }}>
                <CheckCircle size={48} style={{ marginBottom: 'var(--sp-3)', opacity: 0.3 }} />
                <p>No orders ready to serve</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                {readyOrders.map(order => (
                  <div key={order.id} style={{
                    padding: 'var(--sp-4)',
                    borderRadius: 'var(--r-md)',
                    background: 'rgba(34, 197, 94, 0.05)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--r-md)',
                        background: 'rgba(34, 197, 94, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--green-500)'
                      }}>
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>
                          {order.tableName} - #{order.id.substring(0, 4)}
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                          {order.items?.length || 0} items · ${order.totalAmount?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <Button variant="primary" size="small" onClick={() => handleMarkServed(order.id)}>
                      Mark Served
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </motion.div>

      {/* Active Orders */}
      <motion.div variants={itemAnim} style={{ marginTop: 'var(--sp-6)' }}>
        <Card variant="elevated">
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Card.Title>Active Orders</Card.Title>
                <Card.Description>Orders currently being prepared</Card.Description>
              </div>
              <Button variant="ghost" size="small" onClick={() => navigate('/orders')}>View All <ChevronRight size={14} /></Button>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 'var(--sp-4)' }}>
            {activeOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)' }}>
                <ClipboardList size={48} style={{ marginBottom: 'var(--sp-3)', opacity: 0.3 }} />
                <p>No active orders</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                {activeOrders.map(order => (
                  <div key={order.id} style={{
                    padding: 'var(--sp-4)',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--r-md)',
                        background: 'rgba(212, 175, 55, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--orange-500)'
                      }}>
                        <Clock size={24} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>
                          {order.tableName} - #{order.id.substring(0, 4)}
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                          {order.items?.length || 0} items · ${order.totalAmount?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="warning" size="small">
                      <AlertCircle size={12} /> Preparing
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
};
