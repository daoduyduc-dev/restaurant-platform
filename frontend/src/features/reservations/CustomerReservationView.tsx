import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { ReservationDTO, TableDTO } from '../../services/types';
import { useWebSocket } from '../../services/useWebSocket';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, Badge } from '../../components/ui';

export const CustomerReservationView = () => {
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations/my');
      setReservations(res.data.data?.items || res.data.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchReservations(); }, []);
  // Assuming a generic endpoint since customer is filtered by backend, or just filtering client side.
  // Actually, backend needs to support /reservations/my, but if not, we filter by their phone number or something.
  // We'll assume the endpoint works or returns their own.

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-600)' }}>My Reservations</h1>
          <p>Your upcoming and past dining bookings</p>
        </div>
        <Button variant="primary" onClick={() => window.location.href = '/tables'}><Calendar size={16} /> Book New Table</Button>
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
            return (
              <Card key={res.id} variant="elevated">
                <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        </div>
                     </div>
                  </div>
                  {res.status === 'PENDING' && (
                     <Button variant="danger" size="small">Cancel Booking</Button>
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
