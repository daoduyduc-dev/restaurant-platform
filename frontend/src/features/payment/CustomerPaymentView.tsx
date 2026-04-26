import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { OrderDTO } from '../../services/types';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Button, Badge } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { translateStatus } from '../../utils/translations';

export const CustomerPaymentView = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const items = res.data.data?.items || res.data.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // For a customer, standard unpaid orders matter for payment
  const unpaidOrders = orders.filter(o => !['PAID', 'CANCELED'].includes(o.status));

  const handlePay = async (orderId: string) => {
     try {
       // Simulate payment flow
       toast.success('Đang xử lý thanh toán...');
       await new Promise(r => setTimeout(r, 1500));
       await api.patch(`/orders/${orderId}/status?status=PAID`);
       toast.success('Thanh toán thành công!');
       fetchOrders();
     } catch {
       toast.error('Thanh toán thất bại');
     }
  };

  if (loading) return <div className="spinner" style={{ margin: 'auto' }} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
         <div>
            <h1 style={{ color: 'var(--orange-600)' }}>Thanh toán & Hóa đơn</h1>
            <p>Xem hóa đơn và thanh toán từ thiết bị của bạn</p>
         </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
         {unpaidOrders.length === 0 ? (
            <Card variant="elevated" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
               <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
               <h3>Không có hóa đơn chưa thanh toán</h3>
               <p style={{ color: 'var(--text-muted)' }}>Tất cả đã thanh toán!</p>
            </Card>
         ) : (
            unpaidOrders.map(order => (
               <Card key={order.id} variant="elevated" style={{ borderTop: '4px solid var(--orange-500)' }}>
                  <Card.Header>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                           <Card.Title>Bàn {order.tableName}</Card.Title>
                           <Card.Description>Order #{order.id.substring(0, 8)}</Card.Description>
                        </div>
                        <Badge variant="warning">{translateStatus(order.status)}</Badge>
                     </div>
                  </Card.Header>
                  <Card.Content>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                        {(order.items || []).map(item => (
                           <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px dashed var(--gray-200)' }}>
                              <div>
                                 <div style={{ fontWeight: 600 }}>{item.quantity}x {item.menuItemName}</div>
                                 <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>${(item.price||0).toFixed(2)} mỗi món</div>
                              </div>
                              <div style={{ fontWeight: 600 }}>${(item.total||0).toFixed(2)}</div>
                           </div>
                        ))}
                     </div>

                     <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--r-md)', marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--text-muted)' }}>
                           <span>Tạm tính</span>
                           <span>${(order.totalAmount || 0).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--text-muted)' }}>
                           <span>Thuế (8%)</span>
                           <span>${((order.totalAmount || 0) * 0.08).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-main)', fontWeight: 800, fontSize: 20 }}>
                           <span>Tổng cộng</span>
                           <span>${((order.totalAmount || 0) * 1.08).toFixed(2)}</span>
                        </div>
                     </div>
                  </Card.Content>
                  <Card.Footer style={{ borderTop: 'none', paddingTop: 0 }}>
                     <Button variant="primary" size="large" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handlePay(order.id)}>
                        <CreditCard size={18} /> Thanh toán bằng thẻ
                     </Button>
                  </Card.Footer>
               </Card>
            ))
         )}
      </div>
    </motion.div>
  );
};
