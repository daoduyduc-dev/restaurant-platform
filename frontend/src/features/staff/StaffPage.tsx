import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { UserDTO } from '../../services/types';
import { Search, Plus, Mail, Phone, Shield, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Modal, Badge, Card } from '../../components/ui';
import { toast } from '../../store/toastStore';

type StaffRole = 'ADMIN' | 'STAFF';

const ROLE_OPTIONS: Array<{ value: StaffRole; label: string }> = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'STAFF', label: 'Staff' },
];

const ROLE_COLORS: Record<StaffRole, { variant: 'error' | 'success' }> = {
  ADMIN: { variant: 'error' },
  STAFF: { variant: 'success' },
};

const STAFF_ROLES = new Set<StaffRole>(['ADMIN', 'STAFF']);

const normalizeRole = (role?: string): StaffRole => role === 'ADMIN' ? 'ADMIN' : 'STAFF';

export const StaffPage = () => {
  const [staff, setStaff] = useState<UserDTO[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'STAFF' as StaffRole, password: 'password123' });
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<UserDTO | null>(null);
  const [selectedRole, setSelectedRole] = useState<StaffRole>('STAFF');
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const fetchStaff = () => {
    api.get('/users')
      .then((res) => {
        const data = res.data.data;
        if (Array.isArray(data)) {
          setStaff(data.filter((user: UserDTO) => user.roles?.some((role) => STAFF_ROLES.has(normalizeRole(role)))));
        }
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
        phone: formData.phone,
        password: formData.password,
        roles: [formData.role],
      });
      toast.success('Staff added!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', role: 'STAFF', password: 'password123' });
      fetchStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add staff');
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

  const handleOpenPermissions = (user: UserDTO) => {
    setSelectedStaff(user);
    setSelectedRole(normalizeRole(user.roles?.[0]));
    setPermissionsModalOpen(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;
    setPermissionsLoading(true);
    try {
      await api.put(`/users/${selectedStaff.id}`, {
        roles: [selectedRole],
      });
      toast.success(`${selectedStaff.name}'s role updated to ${selectedRole}`);
      setPermissionsModalOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const filtered = search
    ? staff.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()))
    : staff;

  return (
    <div className="animate-in" style={{ paddingTop: 'var(--sp-4)' }}>
      <div className="page-header">
        <div>
          <h1>Staff Management</h1>
          <p>Manage your team and permissions.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
            style={{ width: '240px', paddingLeft: '36px' }}
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
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const role = normalizeRole(user.roles?.[0]);
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ opacity: user.active ? 1 : 0.55 }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar avatar-lg" style={{ fontSize: 'var(--text-sm)' }}>
                          {user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={ROLE_COLORS[role].variant} size="small" style={{ textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {role}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                        <Mail size={14} color="var(--gray-400)" /> {user.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                        <Phone size={14} color="var(--gray-400)" /> {user.phone || '—'}
                      </div>
                    </td>
                    <td>
                      <Badge variant={user.active ? 'success' : 'neutral'} size="small" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {user.active && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />}
                        {user.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Button variant="ghost" size="small" title="Permissions" style={{ padding: '6px' }} onClick={() => handleOpenPermissions(user)}>
                          <Shield size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          title="Remove Staff"
                          onClick={() => handleDelete(user.id, user.name)}
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

      <Modal
        title="Add New Staff"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="medium"
      >
        <form
          onSubmit={handleCreate}
          style={{
            display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)'
          }}
        >
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Gordon Ramsay"
          />
          <Input
            label="Email (Login ID)"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="gordon@servegenius.com"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="09xxxxxxx"
            />
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-heading)' }}>Role</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-main)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-sans)',
                  height: '42px'
                }}
              >
                {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>
          <Input
            label="Default Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Button
            type="submit"
            variant="primary"
            size="medium"
            disabled={loading}
            style={{ width: '100%', marginTop: 'var(--sp-2)' }}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </form>
      </Modal>

      <Modal
        title="Manage Permissions"
        isOpen={permissionsModalOpen}
        onClose={() => {
          setPermissionsModalOpen(false);
          setSelectedStaff(null);
          setSelectedRole('STAFF');
        }}
        size="medium"
      >
        {selectedStaff && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
              <div className="avatar avatar-lg" style={{ fontSize: 'var(--text-sm)' }}>
                {selectedStaff.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{selectedStaff.name}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{selectedStaff.email}</div>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-heading)' }}>Current Role</label>
              <Badge variant={ROLE_COLORS[normalizeRole(selectedStaff.roles?.[0])].variant} size="small">
                {normalizeRole(selectedStaff.roles?.[0])}
              </Badge>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--sp-1)', color: 'var(--text-heading)' }}>Change Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as StaffRole)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-main)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-sans)',
                  height: '42px'
                }}
              >
                {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <Button
              variant="primary"
              size="medium"
              onClick={handleSavePermissions}
              disabled={permissionsLoading}
              style={{ width: '100%', marginTop: 'var(--sp-2)' }}
            >
              {permissionsLoading ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
