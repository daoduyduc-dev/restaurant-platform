import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Award, Star, TrendingUp, Users, Gift, Crown, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, Badge, Modal, Input } from '../../components/ui';
import type { LucideIcon } from 'lucide-react';
import { toast } from '../../store/toastStore';
import i18n from '../../i18n';

interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: string;
  visits: number;
  spent: string;
}



const TIER_COLORS: Record<string, { bg:string; color:string; icon:LucideIcon }> = {
  Bronze: { bg:'rgba(205,127,50,0.08)', color:'#CD7F32', icon:Star },
  Silver: { bg:'rgba(192,192,192,0.1)', color:'#A0A0A0', icon:Star },
  Gold: { bg:'var(--amber-bg)', color:'var(--amber)', icon:Crown },
  Platinum: { bg:'rgba(139,92,246,0.06)', color:'#8B5CF6', icon:Crown },
};

export const StaffLoyaltyView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [issueRewardOpen, setIssueRewardOpen] = useState(false);
  const [rewardForm, setRewardForm] = useState({ memberId: '', points: '' });

  useEffect(() => {
    api.get('/loyalty/all')
      .then((res) => {
        const data = res.data.data;
        if (Array.isArray(data)) {
          setMembers(data.map((loyalty: any) => ({
            id: loyalty.id || loyalty.userId || '',
            name: loyalty.customerName || loyalty.name || 'Unknown',
            email: loyalty.email || '',
            points: loyalty.totalPointsEarned || loyalty.points || 0,
            tier: loyalty.tier || 'Bronze',
            visits: loyalty.visits || 0,
            spent: new Intl.NumberFormat(i18n.language, { style: 'currency', currency: i18n.language === 'vi' ? 'VND' : 'USD', maximumFractionDigits: i18n.language === 'vi' ? 0 : 2 }).format(loyalty.totalSpent || 0),
          })));
        }
      })
      .catch((error: Error) => {
        console.error('Failed to fetch loyalty members:', error);
      });
  }, []);

  const totals = {
    members: members.length,
    totalPoints: members.reduce((s, m) => s + m.points, 0),
    avgVisits: members.length ? Math.round(members.reduce((s, m) => s + m.visits, 0) / members.length) : 0,
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>{t('staffLoyalty.title')}</h1>
          <p>{t('staffLoyalty.subtitle')}</p>
        </div>
        <Button variant="primary" size="medium" onClick={() => setIssueRewardOpen(true)}><Gift size={16} /> {t('staffLoyalty.issueReward')}</Button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(3, 1fr)', marginBottom:'var(--sp-5)' }}>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card variant="elevated">
            <Card.Content style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-3)' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'var(--r-lg)', background:'var(--orange-100)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Users size={24} color="var(--orange-600)" />
                </div>
              </div>
              <div style={{ fontSize:'var(--text-2xl)', fontWeight:800, marginBottom:'var(--sp-1)' }}>{totals.members}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>{t('staffLoyalty.activeMembers')}</div>
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card variant="elevated">
            <Card.Content style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-3)' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'var(--r-lg)', background:'var(--amber-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Award size={24} color="var(--amber)" />
                </div>
              </div>
              <div style={{ fontSize:'var(--text-2xl)', fontWeight:800, marginBottom:'var(--sp-1)' }}>{totals.totalPoints.toLocaleString()}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>{t('staffLoyalty.totalPointsIssued')}</div>
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card variant="elevated">
            <Card.Content style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-3)' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'var(--r-lg)', background:'var(--teal-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <TrendingUp size={24} color="var(--teal)" />
                </div>
              </div>
              <div style={{ fontSize:'var(--text-2xl)', fontWeight:800, marginBottom:'var(--sp-1)' }}>{totals.avgVisits}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>{t('staffLoyalty.avgVisits')}</div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      <Card variant="elevated">
        <Card.Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Card.Title>{t('staffLoyalty.members')}</Card.Title>
            <Button variant="ghost" size="small" onClick={() => navigate('/app/report')}>{t('staffLoyalty.viewAll')} <ArrowUpRight size={14} /></Button>
          </div>
        </Card.Header>
        <Card.Content style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('staffLoyalty.member')}</th>
                <th>{t('staffLoyalty.tier')}</th>
                <th style={{ textAlign:'right' }}>{t('staffLoyalty.points')}</th>
                <th style={{ textAlign:'right' }}>{t('staffLoyalty.visits')}</th>
                <th style={{ textAlign:'right' }}>{t('staffLoyalty.totalSpent')}</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => {
                const t = TIER_COLORS[m.tier] || TIER_COLORS.Bronze;
                return (
                  <motion.tr 
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td>
                      <div>
                        <div style={{ fontWeight:600 }}>{m.name}</div>
                        <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>{m.email}</div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={m.tier === 'Gold' ? 'warning' : 'info'} size="small" style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}>
                        <t.icon size={12} /> {m.tier}
                      </Badge>
                    </td>
                    <td style={{ textAlign:'right', fontWeight:700, color:'var(--orange-600)' }}>{m.points.toLocaleString()}</td>
                    <td style={{ textAlign:'right', fontWeight:600 }}>{m.visits}</td>
                    <td style={{ textAlign:'right', fontWeight:600 }}>{m.spent}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </Card.Content>
      </Card>

      {/* Issue Reward Modal */}
      <Modal title={t('staffLoyalty.issueRewardTitle')} isOpen={issueRewardOpen} onClose={() => setIssueRewardOpen(false)} size="medium">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-heading)' }}>{t('staffLoyalty.member')}</label>
            <select
              value={rewardForm.memberId}
              onChange={(e) => setRewardForm({ ...rewardForm, memberId: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-sans)'
              }}
            >
              <option value="">{t('staffLoyalty.selectMember')}</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <Input
            label={t('staffLoyalty.pointsToIssue')}
            type="number"
            value={rewardForm.points}
            onChange={(e) => setRewardForm({ ...rewardForm, points: e.target.value })}
            placeholder="e.g. 100"
          />
          <Button variant="primary" size="medium" onClick={() => { toast.info(t('staffLoyalty.comingSoon')); setIssueRewardOpen(false); }} style={{ width: '100%' }}>
            {t('staffLoyalty.issueReward')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
