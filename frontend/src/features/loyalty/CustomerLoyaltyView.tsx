import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { LoyaltyDTO } from '../../services/types';
import { Star, Crown, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../../components/ui';

export const CustomerLoyaltyView = () => {
  const [loyalty, setLoyalty] = useState<LoyaltyDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to get loyalty context for current user. For demo, get `/loyalty/my`.
    api.get('/loyalty/my').then((res) => {
      setLoyalty(res.data.data);
    }).catch(() => {
      // Mock for demo if endpoint fails
      setLoyalty({
        id: '123',
        points: 450,
        tier: 'Gold',
        totalPoints: 450,
        totalSpent: 1200
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" style={{ margin: 'auto' }} />;

  const pointsToNext = loyalty?.tier === 'Gold' ? 550 : 100;
  const progress = Math.min((loyalty?.points || 0) / ((loyalty?.points || 0) + pointsToNext) * 100, 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="page-header" style={{ width: '100%', maxWidth: 600 }}>
         <div>
            <h1 style={{ color: 'var(--orange-600)' }}>My Rewards</h1>
            <p>Your benefits, points, and exclusive perks.</p>
         </div>
      </div>

      <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
         <Card variant="elevated" style={{ background: loyalty?.tier === 'Gold' ? 'linear-gradient(135deg, var(--amber-bg) 0%, #fff 100%)' : 'var(--white)', borderTop: `4px solid ${loyalty?.tier === 'Gold' ? 'var(--amber)' : 'var(--orange-400)'}` }}>
            <Card.Content style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
               <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                  {loyalty?.tier === 'Gold' ? <Crown size={64} color="var(--amber)" /> : <Star size={64} color="var(--orange-400)" />}
               </div>
               <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{loyalty?.points || 0}</div>
               <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 24 }}>Available Points</div>

               <Badge variant={loyalty?.tier === 'Gold' ? 'warning' : 'neutral'} size="large" style={{ fontSize: 18, padding: '8px 24px', letterSpacing: '0.05em' }}>
                  {loyalty?.tier || 'Bronze'} Member
               </Badge>
            </Card.Content>
            <Card.Footer style={{ borderTop: '1px solid var(--border-main)', padding: 'var(--sp-5)' }}>
               <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                     <span style={{ fontWeight: 600 }}>Progress to next tier</span>
                     <span>{pointsToNext} more points</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--gray-200)', borderRadius: 4, overflow: 'hidden' }}>
                     <div style={{ width: `${progress}%`, height: '100%', background: 'var(--orange-500)', transition: 'width 1s ease' }} />
                  </div>
               </div>
            </Card.Footer>
         </Card>

         <Card variant="elevated">
            <Card.Header>
               <Card.Title>Your QR Code</Card.Title>
               <Card.Description>Scan this code at the table or checkout</Card.Description>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-8)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ width: 240, height: 240, background: 'var(--gray-100)', borderRadius: 16, border: '2px dashed var(--gray-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <Gift size={64} style={{ opacity: 0.1 }} />
                  {/* Real QR would go here */}
               </div>
               <div style={{ letterSpacing: '0.2em', fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: 'var(--text-muted)' }}>
                  ID: {loyalty?.id || '----'}
               </div>
            </Card.Content>
         </Card>
      </div>
    </motion.div>
  );
};
