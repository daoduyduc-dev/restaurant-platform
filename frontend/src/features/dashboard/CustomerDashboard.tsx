import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { MenuItemDTO, ReservationDTO, LoyaltyDTO } from '../../services/types';
import { Calendar, Star, Clock, MapPin, UtensilsCrossed, Gift, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button, Card, Badge } from '../../components/ui';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [upcomingReservations, setUpcomingReservations] = useState<ReservationDTO[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyDTO | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<MenuItemDTO[]>([]);

  useEffect(() => {
    fetchReservations();
    fetchLoyalty();
    fetchFavorites();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations?status=PENDING,RESERVED');
      if (res.data.data?.items) {
        setUpcomingReservations(res.data.data.items.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const fetchLoyalty = async () => {
    try {
      const res = await api.get('/loyalty/me');
      if (res.data.data) {
        setLoyalty(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch loyalty:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/menu?size=4');
      if (res.data.data?.items) {
        setFavoriteItems(res.data.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'PLATINUM': return 'var(--purple-500)';
      case 'GOLD': return 'var(--orange-500)';
      case 'SILVER': return 'var(--gray-400)';
      default: return 'var(--text-muted)';
    }
  };

  const getTierProgress = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'SILVER': return 30;
      case 'GOLD': return 65;
      case 'PLATINUM': return 100;
      default: return 10;
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Welcome Header */}
      <motion.div variants={itemAnim} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-400)' }}>Welcome Back! 👋</h1>
          <p>Ready to make a reservation or order your favorite dishes?</p>
        </div>
        <Button variant="primary" size="medium" onClick={() => navigate('/reservations')}>
          <Plus size={16} /> New Reservation
        </Button>
      </motion.div>

      {/* Loyalty Status Card */}
      <motion.div variants={itemAnim} style={{ marginBottom: 'var(--sp-6)' }}>
        <Card variant="elevated" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(251, 191, 36, 0.05))' }}>
          <Card.Content style={{ padding: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--r-full)',
                  background: `linear-gradient(135deg, ${getTierColor(loyalty?.tier || 'Silver')}, ${getTierColor(loyalty?.tier || 'Silver')}88)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Star size={32} color="white" fill="white" />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '4px' }}>Loyalty Status</div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '4px' }}>
                    {loyalty?.tier || 'Silver'} Member
                  </div>
                  <div style={{ fontSize: 'var(--text-lg)', color: getTierColor(loyalty?.tier || 'Silver'), fontWeight: 600 }}>
                    {loyalty?.totalPoints || 0} Points
                  </div>
                </div>
              </div>
              <div style={{ width: '200px' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Progress to {loyalty?.tier === 'SILVER' ? 'Gold' : loyalty?.tier === 'GOLD' ? 'Platinum' : 'Max'}
                </div>
                <div style={{ height: '8px', borderRadius: 'var(--r-full)', background: 'var(--border-main)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${getTierProgress(loyalty?.tier || 'Silver')}%`,
                    borderRadius: 'var(--r-full)',
                    background: `linear-gradient(90deg, ${getTierColor(loyalty?.tier || 'Silver')}, ${getTierColor(loyalty?.tier || 'Silver')}88)`
                  }} />
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      {/* Upcoming Reservations */}
      <motion.div variants={itemAnim} style={{ marginBottom: 'var(--sp-6)' }}>
        <Card variant="elevated">
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Card.Title>Upcoming Reservations</Card.Title>
                <Card.Description>Your next dining experiences</Card.Description>
              </div>
              <Button variant="ghost" size="small" onClick={() => navigate('/reservations')}>View All <ChevronRight size={14} /></Button>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 'var(--sp-4)' }}>
            {upcomingReservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)' }}>
                <Calendar size={48} style={{ marginBottom: 'var(--sp-3)', opacity: 0.3 }} />
                <p>No upcoming reservations</p>
                <Button variant="primary" size="small" style={{ marginTop: 'var(--sp-3)' }} onClick={() => navigate('/reservations')}>Book a Table</Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                {upcomingReservations.map(res => (
                  <div key={res.id} style={{
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
                        <Calendar size={24} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px' }}>
                          {res.tableName} - {res.numberOfGuests} guests
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
                          <Clock size={12} /> {new Date(res.reservationTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={res.status === 'RESERVED' ? 'success' : 'warning'} size="small">
                      {res.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </motion.div>

      {/* Favorite Dishes */}
      <motion.div variants={itemAnim}>
        <Card variant="elevated">
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Card.Title>Your Favorite Dishes</Card.Title>
                <Card.Description>Based on your order history</Card.Description>
              </div>
              <Button variant="ghost" size="small" onClick={() => navigate('/menu')}>View Menu <ChevronRight size={14} /></Button>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 'var(--sp-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sp-4)' }}>
              {favoriteItems.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)' }}>
                  <UtensilsCrossed size={48} style={{ marginBottom: 'var(--sp-3)', opacity: 0.3 }} />
                  <p>No favorites yet. Start exploring our menu!</p>
                </div>
              ) : (
                favoriteItems.map(item => (
                  <div key={item.id} style={{
                    borderRadius: 'var(--r-md)',
                    overflow: 'hidden',
                    background: 'var(--bg-secondary)',
                    cursor: 'pointer'
                  }}>
                    <div style={{
                      height: '120px',
                      background: `linear-gradient(135deg, var(--orange-600), var(--orange-500))`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <UtensilsCrossed size={40} color="white" opacity={0.5} />
                    </div>
                    <div style={{ padding: 'var(--sp-3)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '4px', fontSize: 'var(--text-sm)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--orange-500)' }}>
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
};
