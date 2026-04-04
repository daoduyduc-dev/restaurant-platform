import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { OrderDTO } from '../../services/types';
import { CreditCard, CheckCircle, Search, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Button, Badge, Input } from '../../components/ui';
import { toast } from '../../store/toastStore';

export const StaffPaymentView = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const items = res.data.data?.items || res.data.data || [];
      setOrders(Array.isArray(items) ? items : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Staff sees all active orders, but focuses on SERVED for payment
  const unpaidOrders = orders.filter(o => !['PAID', 'CANCELED'].includes(o.status));
  const filtered = unpaidOrders.filter(o => o.tableName?.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search));

  const handlePay = async (orderId: string, method: string) => {
     try {
       await api.patch(`/orders/${orderId}/status?status=PAID`);
       toast.success(`Payment successful via ${method}`);
       fetchOrders();
     } catch {
       toast.error('Payment processing failed');
     }
  };

  if (loading) return <div className="spinner" style={{ margin: 'auto' }} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
         <div>
            <h1 style={{ color: 'var(--orange-600)' }}><DollarSign size={28} style={{ display:'inline', marginRight: 8, verticalAlign:'middle' }}/> Point of Sale</h1>
            <p>Process payments for tables and walk-ins</p>
         </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--sp-6)', flex: 1, minHeight: 0 }}>
         {/* Order List List */}
         <Card variant="elevated" style={{ width: 400, display: 'flex', flexDirection: 'column' }}>
            <Card.Header style={{ borderBottom: '1px solid var(--border-main)' }}>
               <Input placeholder="Search Table or ID..." value={search} onChange={e=>setSearch(e.target.value)} icon={<Search size={16}/>} />
            </Card.Header>
            <Card.Content style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-2)' }}>
               {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>No unpaid orders found</div>
               ) : (
                  filtered.map(order => (
                     <div key={order.id} style={{
                        padding: 'var(--sp-3)', margin: 'var(--sp-2)', borderRadius: 'var(--r-md)',
                        background: order.status === 'SERVED' ? 'var(--orange-50)' : 'var(--white)',
                        border: `1px solid ${order.status === 'SERVED' ? 'var(--orange-300)' : 'var(--gray-200)'}`,
                     }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                           <span style={{ fontWeight: 700, fontSize: 16 }}>{order.tableName}</span>
                           <span style={{ fontWeight: 700 }}>${(order.totalAmount||0).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Badge variant={order.status === 'SERVED' ? 'success' : 'warning'} size="small">{order.status}</Badge>
                           <Button variant="primary" size="small" onClick={() => handlePay(order.id, 'CARD')}>Process</Button>
                        </div>
                     </div>
                  ))
               )}
            </Card.Content>
         </Card>

         {/* Detailed Receipt view for selected order could go here */}
         <Card variant="elevated" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
               <CreditCard size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
               <h3>Select an order to process payment</h3>
            </div>
         </Card>
      </div>
    </motion.div>
  );
};
