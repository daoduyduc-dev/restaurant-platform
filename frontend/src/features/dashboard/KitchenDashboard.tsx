import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { OrderDTO } from '../../services/types';
import { Flame, Clock, CheckCircle, AlertTriangle, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button, Card, Badge } from '../../components/ui';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const KitchenDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState<OrderDTO[]>([]);
  const [cookingOrders, setCookingOrders] = useState<OrderDTO[]>([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders?status=PENDING,COOKING');
      if (res.data.data?.items) {
        const orders = res.data.data.items;
        setPendingOrders(orders.filter(o => o.status === 'PENDING'));
        setCookingOrders(orders.filter(o => o.status === 'COOKING'));
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleStartCooking = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'COOKING' });
      fetchOrders();
    } catch (error) {
      console.error('Failed to start cooking:', error);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'READY' });
      fetchOrders();
    } catch (error) {
      console.error('Failed to mark ready:', error);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemAnim} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-400)' }}>Kitchen Display System</h1>
          <p>Manage and prepare orders efficiently</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', padding: 'var(--sp-2) var(--sp-4)', borderRadius: 'var(--r-md)', background: 'rgba(212, 175, 55, 0.1)' }}>
            <Flame size={18} color="var(--orange-500)" />
            <span style={{ fontWeight: 600, color: 'var(--orange-500)' }}>
              {pendingOrders.length + cookingOrders.length} Active Orders
            </span>
          </div>
        </div>
      </motion.div>

      {/* Pending Orders */}
      <motion.div variants={itemAnim} style={{ marginBottom: 'var(--sp-6)' }}>
        <Card variant="elevated">
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <AlertTriangle size={18} color="var(--yellow-500)" />
                  Pending Orders
                </Card.Title>
                <Card.Description>Orders waiting to be prepared</Card.Description>
              </div>
              <Badge variant="warning" size="large">{pendingOrders.length}</Badge>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 'var(--sp-4)' }}>
            {pendingOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                <ChefHat size={48} style={{ marginBottom: 'var(--sp-3)', opacity: 0.3 }} />
                <p>No pending orders - Great job!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}>
                {pendingOrders.map(order => (
                  <motion.div key={order.id} variants={itemAnim}>
                    <Card variant="bordered" style={{ borderLeft: '4px solid var(--yellow-500)' }}>
                      <Card.Content style={{ padding: 'var(--sp-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 'var(--text-lg)', marginBottom: '4px' }}>
                              {order.tableName}
                            </div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                              #{order.id.substring(0, 4)} · {getTimeAgo(order.createdDate)}
                            </div>
                          </div>
                          <Badge variant="warning" size="small">
                            <Clock size={12} /> Pending
                          </Badge>
                        </div>

                        <div style={{ marginBottom: 'var(--sp-3)' }}>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>
                            Items:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                            {order.items?.map((item, idx) => (
                              <div key={idx} style={{
                                padding: 'var(--sp-2)',
                                borderRadius: 'var(--r-sm)',
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-main)' }}>
                                  {item.quantity}x {item.menuItemName}
                                </span>
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--orange-500)' }}>
                                  ${item.subtotal?.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                          <Button variant="primary" size="medium" style={{ flex: 1 }} onClick={() => handleStartCooking(order.id)}>
                            <Flame size={16} /> Start Cooking
                          </Button>
                        </div>
                      </Card.Content>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </motion.div>

      {/* Cooking Orders */}
      <motion.div variants={itemAnim}>
        <Card variant="elevated">
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <Flame size={18} color="var(--orange-500)" />
                  Currently Cooking
                </Card.Title>
                <Card.Description>Orders being prepared</Card.Description>
              </div>
              <Badge variant="info" size="large">{cookingOrders.length}</Badge>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 'var(--sp-4)' }}>
            {cookingOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)' }}>
                <p>No orders currently cooking</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--sp-4)' }}>
                {cookingOrders.map(order => (
                  <motion.div key={order.id} variants={itemAnim}>
                    <Card variant="bordered" style={{ borderLeft: '4px solid var(--orange-500)' }}>
                      <Card.Content style={{ padding: 'var(--sp-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 'var(--text-lg)', marginBottom: '4px' }}>
                              {order.tableName}
                            </div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                              #{order.id.substring(0, 4)} · {getTimeAgo(order.createdDate)}
                            </div>
                          </div>
                          <Badge variant="info" size="small">
                            <Flame size={12} /> Cooking
                          </Badge>
                        </div>

                        <div style={{ marginBottom: 'var(--sp-3)' }}>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>
                            Items:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                            {order.items?.map((item, idx) => (
                              <div key={idx} style={{
                                padding: 'var(--sp-2)',
                                borderRadius: 'var(--r-sm)',
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-main)' }}>
                                  {item.quantity}x {item.menuItemName}
                                </span>
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--orange-500)' }}>
                                  ${item.subtotal?.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                          <Button variant="primary" size="medium" style={{ flex: 1, background: 'var(--green-500)' }} onClick={() => handleMarkReady(order.id)}>
                            <CheckCircle size={16} /> Mark Ready
                          </Button>
                        </div>
                      </Card.Content>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
};
