import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { UserDTO } from '../../services/types';
import { Users, Shield, Activity, Settings, UserPlus, Search, Edit2, Lock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button, Card, Badge, Input } from '../../components/ui';
import { toast } from '../../store/toastStore';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalRoles: 0, systemUptime: '99.9%' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.data?.items) {
        const users = res.data.data.items;
        setUsers(users);
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u: UserDTO) => u.active).length,
          totalRoles: new Set(users.flatMap((u: UserDTO) => u.roles || [])).size,
          systemUptime: '99.9%'
        });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN': return 'var(--red-500)';
      case 'MANAGER': return 'var(--orange-500)';
      case 'RECEPTIONIST': return 'var(--teal)';
      case 'WAITER': return 'var(--blue-500)';
      case 'KITCHEN': return 'var(--purple-500)';
      default: return 'var(--gray-500)';
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemAnim} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-400)' }}>Admin Control Center</h1>
          <p>System administration and user management</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <Button variant="secondary" size="medium" onClick={() => navigate('/report')}>
            <Activity size={16} /> Audit Log
          </Button>
          <Button variant="primary" size="medium" onClick={() => navigate('/staff')}>
            <UserPlus size={16} /> Add User
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemAnim} className="stats-grid">
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(45, 212, 191, 0.15)' }}>
                <Users size={20} color="var(--teal)" />
              </div>
              <div className="stat-card-value">{stats.totalUsers}</div>
              <div className="stat-card-label">Total Users</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                <UserPlus size={20} color="var(--green-500)" />
              </div>
              <div className="stat-card-value">{stats.activeUsers}</div>
              <div className="stat-card-label">Active Users</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(212, 175, 55, 0.15)' }}>
                <Shield size={20} color="var(--orange-500)" />
              </div>
              <div className="stat-card-value">{stats.totalRoles}</div>
              <div className="stat-card-label">Active Roles</div>
            </div>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content style={{ padding: 'var(--sp-5)' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <Activity size={20} color="var(--purple-500)" />
              </div>
              <div className="stat-card-value">{stats.systemUptime}</div>
              <div className="stat-card-label">System Uptime</div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      {/* User Management */}
      <motion.div variants={itemAnim} style={{ marginTop: 'var(--sp-6)' }}>
        <Card variant="elevated">
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Card.Title>User Management</Card.Title>
                <Card.Description>Manage system users and permissions</Card.Description>
              </div>
              <Button variant="primary" size="small" onClick={() => navigate('/staff')}>
                <UserPlus size={14} /> Add User
              </Button>
            </div>
          </Card.Header>
          <Card.Content style={{ padding: 'var(--sp-4)' }}>
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--r-full)',
                            background: 'linear-gradient(135deg, var(--orange-500), var(--orange-600))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: 'var(--text-sm)'
                          }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--sp-1)', flexWrap: 'wrap' }}>
                          {(user.roles || []).map((role, idx) => (
                            <Badge key={idx} variant="info" size="small" style={{ background: `${getRoleColor(role)}15`, color: getRoleColor(role) }}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td>
                        <Badge variant={user.active ? 'success' : 'error'} size="small">
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                          <Button variant="ghost" size="small" onClick={() => navigate('/staff')}>
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="ghost" size="small" onClick={() => { toast.info('Lock/Unlock user functionality coming soon'); }}>
                            <Lock size={14} />
                          </Button>
                          <Button variant="ghost" size="small" style={{ color: 'var(--red-500)' }} onClick={() => { toast.info('Delete user functionality coming soon'); }}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      {/* System Configuration */}
      <motion.div variants={itemAnim} style={{ marginTop: 'var(--sp-6)', marginBottom: 'var(--sp-8)' }}>
        <Card variant="elevated">
          <Card.Header>
            <Card.Title>System Configuration</Card.Title>
            <Card.Description>Global system settings</Card.Description>
          </Card.Header>
          <Card.Content style={{ padding: 'var(--sp-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--sp-4)' }}>
              <div style={{ padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>Business Hours</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>10:00 AM - 10:00 PM</div>
                <Button variant="ghost" size="small" style={{ marginTop: 'var(--sp-2)' }} onClick={() => navigate('/settings')}>Edit</Button>
              </div>
              <div style={{ padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>No-Show Grace Period</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>20 minutes</div>
                <Button variant="ghost" size="small" style={{ marginTop: 'var(--sp-2)' }} onClick={() => navigate('/settings')}>Edit</Button>
              </div>
              <div style={{ padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>Loyalty Points Rate</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>1 point per $10 spent</div>
                <Button variant="ghost" size="small" style={{ marginTop: 'var(--sp-2)' }} onClick={() => navigate('/settings')}>Edit</Button>
              </div>
              <div style={{ padding: 'var(--sp-4)', borderRadius: 'var(--r-md)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>Notification Templates</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>5 templates configured</div>
                <Button variant="ghost" size="small" style={{ marginTop: 'var(--sp-2)' }} onClick={() => navigate('/settings')}>Manage</Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
};
