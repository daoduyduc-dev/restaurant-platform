import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { LoyaltyDTO } from '../../services/types';
import { Star, Crown, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, Modal, Input } from '../../components/ui';
import { toast } from '../../store/toastStore';

export const CustomerLoyaltyView = () => {
  const [loyalty, setLoyalty] = useState<LoyaltyDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to get loyalty context for current user. For demo, get `/loyalty/my`.
    api.get('/loyalty/me').then((res) => {
      setLoyalty(res.data.data);
    }).catch(() => {
      // Mock for demo if endpoint fails
      setLoyalty({
        userId: '123',
        points: 450,
        tier: 'GOLD',
        totalPointsEarned: 450,
        totalPointsRedeemed: 0,
        pointsMultiplier: 1.0,
        pointsToNextTier: 550,
        nextTier: 'PLATINUM',
        lastUpdated: new Date().toISOString()
      });
    }).finally(() => setLoading(false));
  }, []);

  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState<number>(100);

  const handleRedeem = async () => {
    try {
      await api.post('/loyalty/redeem', { points: redeemPoints });
      toast.success(`Successfully redeemed ${redeemPoints} points`);
      setIsRedeemModalOpen(false);
      // Reload loyalty
      const res = await api.get('/loyalty/me');
      setLoyalty(res.data.data);
    } catch {
      toast.error('Failed to redeem points');
    }
  };

  if (loading) return <div className="spinner" style={{ margin: 'auto' }} />;

  const pointsToNext = loyalty?.pointsToNextTier || (loyalty?.tier === 'GOLD' ? 550 : 100);
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
         <Card variant="elevated" style={{ background: loyalty?.tier === 'GOLD' ? 'linear-gradient(135deg, var(--amber-bg) 0%, #fff 100%)' : 'var(--white)', borderTop: `4px solid ${loyalty?.tier === 'GOLD' ? 'var(--amber)' : 'var(--orange-400)'}` }}>
            <Card.Content style={{ padding: 'var(--sp-8)', textAlign: 'center' }}>
               <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
                  {loyalty?.tier === 'GOLD' ? <Crown size={64} color="var(--amber)" /> : <Star size={64} color="var(--orange-400)" />}
               </div>
               <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{loyalty?.points || 0}</div>
               <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 24 }}>Available Points</div>

               <Badge variant={loyalty?.tier === 'GOLD' ? 'warning' : 'neutral'} style={{ fontSize: 18, padding: '8px 24px', letterSpacing: '0.05em' }}>
                  {loyalty?.tier || 'BRONZE'} Member
               </Badge>

               <div style={{ marginTop: 'var(--sp-6)' }}>
                  <Button variant={loyalty?.points && loyalty.points >= 100 ? 'primary' : 'secondary'} 
                          disabled={!loyalty?.points || loyalty.points < 100}
                          onClick={() => setIsRedeemModalOpen(true)}>
                    Redeem Points
                  </Button>
               </div>
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
                  ID: {loyalty?.userId || '----'}
               </div>
            </Card.Content>
         </Card>
      </div>

      <Modal isOpen={isRedeemModalOpen} onClose={() => setIsRedeemModalOpen(false)} title="Redeem Loyalty Points">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You currently have {loyalty?.points || 0} points available.</p>
          <Input 
            type="number" 
            label="Points to Redeem" 
            value={redeemPoints} 
            onChange={(e) => setRedeemPoints(parseInt(e.target.value) || 0)} 
            min={100}
            max={loyalty?.points || 0}
            step={100}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>* 100 points = $10 discount</p>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
            <Button variant="ghost" onClick={() => setIsRedeemModalOpen(false)}>Cancel</Button>
            <Button 
                variant="primary" 
                onClick={handleRedeem}
                disabled={redeemPoints < 100 || redeemPoints > (loyalty?.points || 0)}
            >
                Confirm Redemption
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
