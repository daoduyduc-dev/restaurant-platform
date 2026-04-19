import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { UserDTO, OrderDTO } from '../../services/types';
import {
  Users, Shield, Activity, TrendingUp, CalendarX, PieChart,
  AlertTriangle, RefreshCw, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button, Card, Badge } from '../../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';

const containerAnim: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// --- DATA TYPES --- //
interface RevenueReport {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

interface OccupancyReport {
  totalTables: number;
  occupiedTables: number;
  occupancyRate: number;
}

interface NoShowReport {
  totalReservations: number;
  noShowCount: number;
  rate: number;
}

interface TopSellingItem {
  menuItemId: string;
  name: string;
  totalQuantity: number;
}

const COLORS = ['var(--blue-500)', 'var(--green-500)', 'var(--orange-500)', 'var(--purple-500)', 'var(--teal)'];

export const AdminDashboard = () => {
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyReport | null>(null);
  const [noShow, setNoShow] = useState<NoShowReport | null>(null);
  const [topSelling, setTopSelling] = useState<TopSellingItem[]>([]);
  const [alerts, setAlerts] = useState<OrderDTO[]>([]);
  const [userStats, setUserStats] = useState({ totalUsers: 0, activeUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, occRes, noShowRes, topRes, alertsRes, usersRes] = await Promise.allSettled([
        api.get('/reports/revenue'),
        api.get('/reports/occupancy'),
        api.get('/reports/no-show'),
        api.get('/reports/top-selling?limit=5'),
        api.get('/dashboard/alerts?cookThresholdMinutes=20'),
        api.get('/users')
      ]);

      if (revRes.status === 'fulfilled') setRevenue(revRes.value.data.data);
      if (occRes.status === 'fulfilled') setOccupancy(occRes.value.data.data);
      if (noShowRes.status === 'fulfilled') setNoShow(noShowRes.value.data.data);
      if (topRes.status === 'fulfilled') setTopSelling(topRes.value.data.data || []);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data.data || []);
      
      if (usersRes.status === 'fulfilled') {
        const data = usersRes.value.data.data;
        const items: UserDTO[] = Array.isArray(data) ? data : (data?.items || []);
        setUserStats({
            totalUsers: items.length,
            activeUsers: items.filter(u => u.active).length
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setTimeout(() => setLoading(false), 300); // smooth transition
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* Header */}
      <motion.div variants={itemAnim} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={28} color="var(--orange-500)" />
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>Real-time platform metrics and system health</p>
        </div>
        <Button variant="ghost" onClick={fetchData} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} style={{ marginRight: 8 }} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={itemAnim} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-4)' }}>
        {/* Revenue Card */}
        <Card>
          <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-full)', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="var(--blue-500)" />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>Today's Revenue</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)' }}>
                {revenue ? formatCurrency(revenue.todayRevenue) : '...'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                Month: {revenue ? formatCurrency(revenue.monthlyRevenue) : '...'}
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Users Card */}
        <Card>
          <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-full)', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} color="var(--green-500)" />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>Active Users</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-heading)' }}>
                {userStats.activeUsers}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                Out of {userStats.totalUsers} registered
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Occupancy Card */}
        <Card>
          <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-full)', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart size={24} color="var(--purple-500)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>Table Occupancy</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                {occupancy ? (occupancy.occupancyRate * 100).toFixed(1) : 0}%
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>({occupancy?.occupiedTables || 0}/{occupancy?.totalTables || 0})</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${occupancy ? (occupancy.occupancyRate * 100) : 0}%`, height: '100%', background: 'var(--purple-500)' }} />
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* No-show Card */}
        <Card>
          <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-full)', background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarX size={24} color="var(--orange-500)" />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>No-Show Rate</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: noShow && noShow.rate > 0.15 ? 'var(--red-500)' : 'var(--text-heading)' }}>
                {noShow ? (noShow.rate * 100).toFixed(1) : 0}%
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                {noShow?.noShowCount || 0} missed reservations
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      {/* Main Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--sp-6)' }}>
        
        {/* Chart: Top Selling Items */}
        <motion.div variants={itemAnim}>
          <Card style={{ height: '100%' }}>
            <Card.Header>
              <Card.Title>Top Selling Items</Card.Title>
              <Card.Description>Most popular menu items by quantity</Card.Description>
            </Card.Header>
            <Card.Content style={{ height: 320 }}>
              {topSelling.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSelling} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-color)" />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={100} />
                    <RechartsTooltip 
                      cursor={{ fill: 'var(--bg-tertiary)' }}
                      contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)', borderRadius: 'var(--r-md)' }}
                      itemStyle={{ color: 'var(--text-main)' }}
                    />
                    <Bar dataKey="totalQuantity" radius={[0, 4, 4, 0]} barSize={24}>
                      {topSelling.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  No sales data available
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.div>

        {/* Alerts & Notifications */}
        <motion.div variants={itemAnim}>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card.Header style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Card.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={18} color="var(--red-500)" />
                    System Alerts
                  </Card.Title>
                  <Card.Description>Requires immediate attention</Card.Description>
                </div>
                {alerts.length > 0 && <Badge variant="error" size="small">{alerts.length} New</Badge>}
              </div>
            </Card.Header>
            <Card.Content style={{ flex: 1, padding: 0, overflowY: 'auto' }}>
              {alerts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {alerts.map(order => (
                    <div key={order.id} style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 'var(--sp-4)', alignItems: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red-500)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-heading)' }}>Order #{order.id.substring(0,6)} stuck in COOKING</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Table {order.tableName} • Status: {order.status}</div>
                      </div>
                      <Badge variant="warning">{new Date(order.createdDate || order.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 12 }}>
                  <Activity size={32} style={{ opacity: 0.5 }} />
                  <p>All systems operational. No active alerts.</p>
                </div>
              )}
            </Card.Content>
            <div style={{ padding: 'var(--sp-3)', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
              <Button variant="ghost" size="small" style={{ width: '100%', color: 'var(--text-secondary)' }}>View All Logs <ChevronRight size={14} style={{ marginLeft: 4 }}/></Button>
            </div>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  );
};
