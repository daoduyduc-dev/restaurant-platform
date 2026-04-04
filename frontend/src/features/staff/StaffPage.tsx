import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { UserDTO, ApiResponse } from '../../services/types';
import { Search, Plus, Mail, Phone, Shield, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Modal, Badge, Card } from '../../components/ui';
import { toast } from '../../store/toastStore';



const ROLE_COLORS: Record<string, { bg:string; color:string }> = {
  ADMIN: { bg:'rgba(10,20,40,0.06)', color:'var(--bg-main)' },
  MANAGER: { bg:'rgba(139,92,246,0.08)', color:'#8B5CF6' },
  WAITER: { bg:'var(--teal-bg)', color:'var(--teal)' },
  RECEPTIONIST: { bg:'var(--amber-bg)', color:'var(--amber)' },
  CUSTOMER: { bg:'var(--orange-100)', color:'var(--orange-600)' },
};

export const StaffPage = () => {
  const [staff, setStaff] = useState<UserDTO[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name:'', email:'', phone:'', role:'WAITER', password:'password123' });
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<UserDTO | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const fetchStaff = () => {
    api.get('/users')
      .then((res: ApiResponse<UserDTO[]>) => {
        const data = res.data.data;
        if (Array.isArray(data)) setStaff(data);
      })
      .catch((error: Error) => {
        console.error('Failed to fetch staff:', error);
      });
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roles: [formData.role]
      });
      toast.success('Staff added!');
      setIsModalOpen(false);
      setFormData({ name:'', email:'', phone:'', role:'WAITER', password:'password123' });
      fetchStaff();
    } catch {
      toast.error('Failed to add staff');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate or delete ${name}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success(`${name} removed`);
      fetchStaff();
    } catch {
      toast.error('Failed to remove staff');
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff || !selectedRole) return;
    setPermissionsLoading(true);
    try {
      await api.put(`/users/${selectedStaff.id}`, {
        ...selectedStaff,
        roles: [selectedRole],
      });
      toast.success(`${selectedStaff.name}'s role updated to ${selectedRole}`);
      setPermissionsModalOpen(false);
      setSelectedStaff(null);
      setSelectedRole('');
      fetchStaff();
    } catch (error) {
      toast.error('Failed to update user role');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const filtered = search
    ? staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
    : staff;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Staff Management</h1>
          <p>Manage your team and permissions.</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <Input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
            style={{ width: '240px' }}
          />
          <Button variant="primary" size="medium" onClick={() => setIsModalOpen(true)}><Plus size={16} /> Add Staff</Button>
        </div>
      </div>

      <Card variant="elevated">
        <Card.Content style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th style={{ width:'120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const roleKey = s.roles?.[0] || 'WAITER';
                const roleStyle = ROLE_COLORS[roleKey] || { bg:'var(--gray-100)', color:'var(--gray-600)' };
                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ opacity: s.active ? 1 : 0.55 }}
                  >
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <div className="avatar avatar-lg" style={{ fontSize:'var(--text-sm)' }}>
                          {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight:600 }}>{s.name}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={roleKey === 'ADMIN' ? 'error' : roleKey === 'MANAGER' ? 'info' : 'success'} size="small" style={{ textTransform:'uppercase', letterSpacing:'0.03em' }}>
                        {roleKey}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'var(--text-sm)', color:'var(--gray-600)' }}>
                        <Mail size={14} color="var(--gray-400)" /> {s.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'var(--text-sm)', color:'var(--gray-600)' }}>
                        <Phone size={14} color="var(--gray-400)" /> {s.phone || '—'}
                      </div>
                    </td>
                    <td>
                      <Badge variant={s.active ? 'success' : 'neutral'} size="small" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {s.active && <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--teal)', display:'inline-block' }} />}
                        {s.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'4px' }}>
                        <Button variant="ghost" size="small" title="Permissions" style={{ padding: '6px' }} onClick={() => { setSelectedStaff(s); setPermissionsModalOpen(true); }}>
                          <Shield size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          title="Remove Staff"
                          onClick={() => handleDelete(s.id, s.name)}
                          style={{ color: 'var(--rose)', padding: '6px' }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </Card.Content>
      </Card>

      <Modal title="Add New Staff" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="medium">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Gordon Ramsay"
          />
          <Input
            label="Email (Login ID)"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="gordon@servegenius.com"
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="09xxxxxxx"
          />
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-heading)' }}>Role</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
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
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="WAITER">Waiter</option>
              <option value="RECEPTIONIST">Receptionist</option>
            </select>
          </div>
          <Input
            label="Default Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <Button type="submit" variant="primary" size="medium" disabled={loading} style={{ marginTop: 'var(--sp-2)', width: '100%' }}>
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </form>
      </Modal>

      {/* Permissions Modal */}
      <Modal title="Manage Permissions" isOpen={permissionsModalOpen} onClose={() => { setPermissionsModalOpen(false); setSelectedStaff(null); setSelectedRole(''); }} size="medium">
        {selectedStaff && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
              <div className="avatar avatar-lg" style={{ fontSize: 'var(--text-sm)' }}>
                {selectedStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{selectedStaff.name}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{selectedStaff.email}</div>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-heading)' }}>Current Role</label>
              <Badge variant={selectedStaff.roles?.[0] === 'ADMIN' ? 'error' : selectedStaff.roles?.[0] === 'MANAGER' ? 'info' : 'success'} size="small">
                {selectedStaff.roles?.[0] || 'WAITER'}
              </Badge>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-heading)' }}>Change Role</label>
              <select
                value={selectedRole || selectedStaff.roles?.[0] || 'WAITER'}
                onChange={(e) => setSelectedRole(e.target.value)}
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
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="WAITER">Waiter</option>
                <option value="RECEPTIONIST">Receptionist</option>
              </select>
            </div>
            <Button variant="primary" size="medium" onClick={handleSavePermissions} disabled={permissionsLoading} style={{ width: '100%' }}>
              {permissionsLoading ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
