import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { OrderDTO, ReservationDTO } from '../../services/types';
import { AlertTriangle, Calendar, Clock, MapPin, ShoppingBag, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, Badge } from '../../components/ui';
import { toast } from '../../store/toastStore';
import { translateStatus } from '../../utils/translations';

const money = (value: unknown) => Number(value || 0).toFixed(2);

export const CustomerReservationView = () => {
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations/my');
      setReservations(res.data.data?.items || res.data.data || []);
      const orderRes = await api.get('/orders/my?page=0&size=100');
      setOrders(orderRes.data.data?.items || orderRes.data.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancel = async (id: string, customerName: string) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đặt bàn cho ${customerName}?`)) {
      return;
    }

    try {
      await api.post(`/reservations/${id}/cancel`);
      toast.success('Đã hủy đặt bàn thành công');
      fetchReservations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hủy đặt bàn');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>Đặt bàn của tôi</h1>
          <p>Các đặt bàn sắp tới và đã qua</p>
        </div>
        <Button variant="primary" onClick={() => window.location.href = '/tables'}><Calendar size={16} /> Đặt bàn mới</Button>
      </div>

      <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
        {reservations.length === 0 ? (
          <Card variant="elevated" style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
             <Calendar size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
             <h3>No Reservations Found</h3>
             <p style={{ color: 'var(--text-muted)' }}>You haven't made any bookings yet.</p>
          </Card>
        ) : (
          reservations.map(res => {
            const date = new Date(res.reservationTime);
            const late = ['RESERVED', 'CHECKED_IN'].includes(res.status) && Date.now() > date.getTime() + 15 * 60 * 1000;
            const reservationOrders = orders.filter(order => order.reservationId === res.id);
            return (
              <Card key={res.id} variant="elevated">
                <Card.Content style={{ padding: 'var(--sp-5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--sp-5)' }}>
                    <div style={{ display: 'flex', gap: 'var(--sp-5)', alignItems: 'center' }}>
                     <div style={{ background: 'var(--orange-50)', padding: '16px', borderRadius: 'var(--r-md)', textAlign: 'center', minWidth: 80 }}>
                        <div style={{ color: 'var(--orange-600)', fontSize: 13, textTransform: 'uppercase', fontWeight: 700 }}>{date.toLocaleDateString(undefined, { month: 'short' })}</div>
                        <div style={{ color: 'var(--text-heading)', fontSize: 24, fontWeight: 800 }}>{date.getDate()}</div>
                     </div>
                     <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                           <h3 style={{ margin: 0 }}>{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</h3>
                           <Badge variant={res.status === 'PENDING' ? 'warning' : res.status === 'CHECKED_IN' ? 'success' : 'neutral'}>{res.status}</Badge>
                        </div>
                        <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 14 }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {res.numberOfGuests} guests</span>
                           <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {res.tableName || 'Table assigning upon arrival'}</span>
                           <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> Receive at {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {late && (
                          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--rose)', fontWeight: 700, fontSize: 13 }}>
                            <AlertTriangle size={15} /> Reservation is past the allowed arrival grace period.
                          </div>
                        )}
                     </div>
                    </div>
                    {['PENDING', 'RESERVED'].includes(res.status) && (
                       <Button variant="danger" size="small" onClick={() => handleCancel(res.id, res.customerName)}>Cancel Booking</Button>
                    )}
                  </div>
                  {reservationOrders.length > 0 && (
                    <div style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 10 }}>
                        <ShoppingBag size={16} /> Ordered dishes
                      </div>
                      {reservationOrders.map(order => (
                        <div key={order.id} style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
                          {(order.items || []).map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 14 }}>
                              <span>{item.menuItemName} x{item.quantity}</span>
                              <span>${money(item.total)}</span>
                            </div>
                          ))}
                          <strong style={{ textAlign: 'right', color: 'var(--orange-600)' }}>${money(order.totalAmount)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
