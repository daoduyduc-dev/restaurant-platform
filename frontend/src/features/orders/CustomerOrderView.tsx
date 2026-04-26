import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { OrderDTO } from '../../services/types';
import { ShoppingBag, Clock, CheckCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button, Card, Badge } from '../../components/ui';
import { translateStatus } from '../../utils/translations';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const STATUS_MAP: Record<string, { label: string; icon: any; color: string; step: number }> = {
  OPEN: { label: 'Đã đặt', icon: ShoppingBag, color: '#3B82F6', step: 1 },
  COOKING: { label: 'Đang chuẩn bị', icon: Package, color: '#D97706', step: 2 },
  READY: { label: 'Sẵn sàng', icon: CheckCircle, color: '#10B981', step: 3 },
  SERVED: { label: 'Đã phục vụ', icon: CheckCircle, color: '#6B7280', step: 4 },
};

export const CustomerOrderView = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/orders/my');
        const items = res.data.data?.items || res.data.data || [];
        setOrders(Array.isArray(items) ? items : []);
      } catch {
      } finally { setLoading(false); }
    })();
  }, []);

  const activeOrders = orders.filter(o => !['PAID', 'CANCELED'].includes(o.status));
  const pastOrders = orders.filter(o => ['PAID', 'CANCELED'].includes(o.status));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>Order của tôi</h1>
          <p>Theo dõi order hiện tại và lịch sử</p>
        </div>
        <Button variant="primary" size="medium" onClick={() => navigate('/menu')}>
          <ShoppingBag size={16} /> Đặt món từ Menu
        </Button>
      </motion.div>

      {/* Active Orders with Progress Tracker */}
      {activeOrders.length > 0 && (
        <motion.div variants={item} style={{ marginBottom: 'var(--sp-6)' }}>
          <Card variant="elevated" style={{ border: '2px solid var(--orange-400)', background: 'linear-gradient(135deg, rgba(212,175,55,0.03), rgba(251,191,36,0.02))' }}>
            <Card.Header><Card.Title>🍽️ Order đang hoạt động</Card.Title></Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)' }}>
              {activeOrders.map(order => {
                const info = STATUS_MAP[order.status] || STATUS_MAP.OPEN;
                return (
                  <div key={order.id} style={{ marginBottom: 'var(--sp-6)', paddingBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border-main)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-heading)' }}>{order.tableName}</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{order.items?.length || 0} món · ${(order.totalAmount || 0).toFixed(2)}</div>
                      </div>
                      <Badge variant={order.status === 'READY' ? 'success' : 'warning'} size="medium">{info.label}</Badge>
                    </div>
                    {/* Progress bar */}
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
                      {Object.entries(STATUS_MAP).map(([key, val], i) => (
                        <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{
                            height: 6, width: '100%', borderRadius: 'var(--r-full)',
                            background: info.step >= val.step ? val.color : 'var(--gray-200)',
                            transition: 'all 0.5s ease',
                          }} />
                          <span style={{ fontSize: '10px', color: info.step >= val.step ? val.color : 'var(--text-muted)', fontWeight: info.step >= val.step ? 600 : 400 }}>
                            {val.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Items */}
                    <div style={{ marginTop: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                      {(order.items || []).map(itm => (
                        <div key={itm.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--sp-2) 0', borderBottom: '1px solid var(--gray-100)' }}>
                          <span style={{ color: 'var(--text-heading)' }}>{itm.menuItemName} ×{itm.quantity}</span>
                          <span style={{ fontWeight: 600, color: 'var(--orange-500)' }}>${itm.total?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Card.Content>
          </Card>
        </motion.div>
      )}

      {/* Past Orders */}
      <motion.div variants={item}>
        <Card variant="elevated">
          <Card.Header><Card.Title>Lịch sử Order</Card.Title></Card.Header>
          <Card.Content style={{ padding: 'var(--sp-4)' }}>
            {pastOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: 'var(--sp-3)' }} />
                <p>Chưa có order nào</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {pastOrders.slice(0, 10).map(o => (
                  <div key={o.id} style={{ padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--r-md)', background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{o.tableName}</span>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginLeft: 'var(--sp-2)' }}>{o.items?.length || 0} món</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--orange-500)' }}>${(o.totalAmount || 0).toFixed(2)}</span>
                      <Badge variant={o.status === 'PAID' ? 'success' : 'error'} size="small">{translateStatus(o.status)}</Badge>
                    </div>
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
