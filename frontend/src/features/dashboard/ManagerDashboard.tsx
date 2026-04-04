import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { DashboardDTO, TopSellingItemDTO, UserDTO } from '../../services/types';
import { TrendingUp, DollarSign, Users, ShoppingBag, BarChart3, Settings, UserCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button, Card, Badge } from '../../components/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null);
  const [topItems, setTopItems] = useState<TopSellingItemDTO[]>([]);
  const [staff, setStaff] = useState<UserDTO[]>([]);
  const [revenueData, setRevenueData] = useState<Array<{ name: string; revenue: number }>>([]);

  useEffect(() => {
    fetchDashboard();
    fetchTopItems();
    fetchStaff();
    fetchRevenue();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.data.data) setDashboard(res.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const fetchTopItems = async () => {
    try {
      const res = await api.get('/reports/top-selling?limit=5');
      if (res.data.data) setTopItems(res.data.data);
    } catch (error) {
      console.error('Failed to fetch top items:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.data?.items) setStaff(res.data.data.items);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const fetchRevenue = async () => {
    try {
      const res = await api.get('/reports/revenue');
      if (res.data.data) {
        const revenue = res.data.data;
        const data = Array.isArray(revenue)
          ? revenue
          : [{ name: 'Today', revenue: revenue.totalRevenue || 0 }];
        setRevenueData(data.map((d: any, i: number) => ({
          name: d.name || d.date || `Day ${i + 1}`,
          revenue: d.revenue || d.totalRevenue || 0
        })));
      }
    } catch (error) {
      console.error('Failed to fetch revenue:', error);
    }
  };

  const STATS = [
    { label: 'Revenue Today', value: `$${dashboard?.revenue?.todayRevenue?.toLocaleString() || 0}`, trend: `${dashboard?.revenue?.growthPercent?.toFixed(1) || 0}%`, icon: DollarSign, color: 'var(--orange-500)' },
    { label: 'Active Orders', value: dashboard?.orders?.activeOrders || 0, trend: `${dashboard?.orders?.todayOrders || 0} today`, icon: ShoppingBag, color: 'var(--teal)' },
    { label: 'Tables Occupied', value: `${dashboard?.tables?.occupied || 0}/${dashboard?.tables?.total || 0}`, trend: `${Math.round((dashboard?.tables?.occupied || 0) / (dashboard?.tables?.total || 1) * 100)}%`, icon: Users, color: 'var(--yellow-500)' },
    { label: 'Staff On Duty', value: staff.filter(s => s.active).length, trend: `${staff.length} total`, icon: UserCheck, color: 'var(--green-500)' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemAnim} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-400)' }}>Manager Dashboard</h1>
          <p>Monitor operations and manage your restaurant</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <Button variant="secondary" size="medium" onClick={() => navigate('/report')}>
            <BarChart3 size={16} /> Reports
          </Button>
          <Button variant="primary" size="medium" onClick={() => navigate('/settings')}>
            <Settings size={16} /> Settings
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemAnim} className="stats-grid">
        {STATS.map((stat, idx) => (
          <Card key={idx} variant="elevated">
            <Card.Content style={{ padding: 'var(--sp-5)' }}>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: `${stat.color}15` }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
                <div className="stat-card-value">{stat.value}</div>
                <div className="stat-card-label">{stat.label}</div>
                <Badge variant="info" size="small" style={{ marginTop: 'var(--sp-2)' }}>
                  {stat.trend}
                </Badge>
              </div>
            </Card.Content>
          </Card>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--sp-6)', marginTop: 'var(--sp-6)' }}>
        {/* Revenue Chart */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <Card.Title>Revenue Overview</Card.Title>
              <Card.Description>Performance trends</Card.Description>
            </Card.Header>
            <Card.Content style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.length > 0 ? revenueData : [{ name: 'No data', revenue: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--orange-600)', borderRadius: 'var(--r-md)' }}
                    itemStyle={{ color: 'var(--orange-400)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--orange-500)" strokeWidth={3} fill="url(#colorRevenue)" fillOpacity={0.3} />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--orange-500)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--orange-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Top Selling Items */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <Card.Title>Top Selling Items</Card.Title>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-4)' }}>
              {topItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)' }}>
                  <AlertCircle size={32} style={{ marginBottom: 'var(--sp-2)', opacity: 0.3 }} />
                  <p>No sales data yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {topItems.slice(0, 5).map((item, idx) => (
                    <div key={idx} style={{
                      padding: 'var(--sp-3)',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--r-full)',
                          background: idx === 0 ? 'var(--orange-600)' : 'var(--border-main)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: idx === 0 ? 'white' : 'var(--text-muted)',
                          fontWeight: 700,
                          fontSize: 'var(--text-sm)'
                        }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: 'var(--text-sm)' }}>
                            {item.menuItemName}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {item.totalQuantity} sold
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--orange-500)' }}>
                        ${item.totalRevenue?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemAnim} style={{ marginTop: 'var(--sp-6)' }}>
        <Card variant="elevated">
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
            <Card.Description>Manage your restaurant operations</Card.Description>
          </Card.Header>
          <Card.Content style={{ padding: 'var(--sp-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
              <Button variant="secondary" size="medium" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/staff')}>
                <Users size={16} /> Manage Staff
              </Button>
              <Button variant="secondary" size="medium" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/menu')}>
                <ShoppingBag size={16} /> Menu Items
              </Button>
              <Button variant="secondary" size="medium" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/report')}>
                <BarChart3 size={16} /> View Reports
              </Button>
              <Button variant="secondary" size="medium" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/settings')}>
                <Settings size={16} /> System Config
              </Button>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
};
