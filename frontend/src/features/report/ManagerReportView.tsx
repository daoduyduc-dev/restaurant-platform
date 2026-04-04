import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { RevenueReportDTO, OrderDTO } from '../../services/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Package, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Badge } from '../../components/ui';

export const ManagerReportView = () => {
  const [report, setReport] = useState<RevenueReportDTO | null>(null);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, oRes] = await Promise.all([
          api.get('/reports/revenue?startDate=2024-01-01&endDate=2026-12-31'),
          api.get('/orders')
        ]);
        setReport(rRes.data.data || null);
        const items = oRes.data.data?.items || oRes.data.data || [];
        setOrders(Array.isArray(items) ? items : []);
      } catch { } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner" style={{ margin: 'auto' }} />;

  const itemSales = orders.flatMap(o => o.items || []).reduce((acc, i) => {
    acc[i.menuItemName] = (acc[i.menuItemName] || 0) + i.quantity;
    return acc;
  }, {} as Record<string, number>);

  const topItems = Object.entries(itemSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const mockTraffic = [
    { time: '10am', visitors: 12 }, { time: '12pm', visitors: 45 }, { time: '2pm', visitors: 30 },
    { time: '4pm', visitors: 15 }, { time: '6pm', visitors: 60 }, { time: '8pm', visitors: 85 }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
         <div>
            <h1 style={{ color: 'var(--orange-600)' }}><Activity size={28} style={{ display:'inline', marginRight: 8, verticalAlign:'middle' }}/> Analytics & Reports</h1>
            <p>Platform performance, revenue, and operation insights</p>
         </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--sp-6)', gridTemplateColumns: 'repeat(4, 1fr)' }}>
         <Card variant="elevated">
            <Card.Content style={{ padding: 'var(--sp-5)' }}>
               <div className="stat-card">
                  <DollarSign size={24} color="var(--teal)" style={{ marginBottom: 8 }} />
                  <div className="stat-card-value">${report?.totalRevenue?.toFixed(2) || '0.00'}</div>
                  <div className="stat-card-label">Total Revenue</div>
               </div>
            </Card.Content>
         </Card>
         <Card variant="elevated">
            <Card.Content style={{ padding: 'var(--sp-5)' }}>
               <div className="stat-card">
                  <Package size={24} color="var(--orange-500)" style={{ marginBottom: 8 }} />
                  <div className="stat-card-value">{report?.totalOrders || 0}</div>
                  <div className="stat-card-label">Completed Orders</div>
               </div>
            </Card.Content>
         </Card>
         <Card variant="elevated">
            <Card.Content style={{ padding: 'var(--sp-5)' }}>
               <div className="stat-card">
                  <TrendingUp size={24} color="var(--blue)" style={{ marginBottom: 8 }} />
                  <div className="stat-card-value">${((report?.totalRevenue || 0) / (report?.totalOrders || 1)).toFixed(2)}</div>
                  <div className="stat-card-label">Avg Order Value</div>
               </div>
            </Card.Content>
         </Card>
         <Card variant="elevated">
            <Card.Content style={{ padding: 'var(--sp-5)' }}>
               <div className="stat-card">
                  <Users size={24} color="var(--rose)" style={{ marginBottom: 8 }} />
                  <div className="stat-card-value">{orders.length}</div>
                  <div className="stat-card-label">Total Traffic Placed</div>
               </div>
            </Card.Content>
         </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--sp-6)' }}>
         <Card variant="elevated">
            <Card.Header><Card.Title>Today's Traffic</Card.Title></Card.Header>
            <Card.Content style={{ height: 300, padding: 'var(--sp-4)' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTraffic}>
                     <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                     <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)' }} />
                     <Line type="monotone" dataKey="visitors" stroke="var(--orange-500)" strokeWidth={3} dot={{ r: 4, fill: 'var(--orange-500)' }} activeDot={{ r: 6 }} />
                  </LineChart>
               </ResponsiveContainer>
            </Card.Content>
         </Card>

         <Card variant="elevated">
            <Card.Header><Card.Title>Top Menu Items</Card.Title></Card.Header>
            <Card.Content style={{ padding: 'var(--sp-4)' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {topItems.length === 0 ? (
                     <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 32 }}>No sales data yet</div>
                  ) : topItems.map(([name, qty], index) => (
                     <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: index < 3 ? 'var(--orange-100)' : 'var(--gray-100)', color: index < 3 ? 'var(--orange-600)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                           {index + 1}
                        </div>
                        <div style={{ flex: 1, fontWeight: 600 }}>{name}</div>
                        <Badge variant="neutral">{qty} sold</Badge>
                     </div>
                  ))}
               </div>
            </Card.Content>
         </Card>
      </div>
    </motion.div>
  );
};
