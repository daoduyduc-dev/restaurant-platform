import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import type { ProfileResponse } from '../../services/types';
import { User, Mail, Phone, MapPin, Calendar, Shield, LogOut, Edit2, Save, X, Camera, Key, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button, Card, Input, Modal } from '../../components/ui';
import { toast } from '../../store/toastStore';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/me');
      if (res.data.data) {
        setProfile(res.data.data);
        setEditForm({
          name: res.data.data.name || '',
          phone: res.data.data.phone || '',
          address: res.data.data.address || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const res = await api.put('/profile/me', editForm);
      if (res.data.data) {
        setProfile(res.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setIsChangePasswordOpen(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (!profile) {
    return <div style={{ padding: 'var(--sp-8)' }}>Loading...</div>;
  }

  const isCustomer = profile.roles?.includes('CUSTOMER');
  const isStaff = profile.roles?.some(r => ['WAITER', 'RECEPTIONIST', 'KITCHEN', 'MANAGER', 'ADMIN'].includes(r));

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ padding: 'var(--sp-8)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div variants={itemAnim} className="page-header" style={{ marginBottom: 'var(--sp-8)' }}>
        <div>
          <h1 style={{ color: 'var(--orange-400)' }}>My Profile</h1>
          <p>Manage your personal information and account settings</p>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--sp-6)' }}>
        {/* Left Column - Profile Card */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Content style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 'var(--sp-4)' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: 'var(--r-full)',
                  background: 'linear-gradient(135deg, var(--orange-500), var(--orange-600))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <button style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--r-full)',
                  background: 'var(--orange-500)',
                  border: '3px solid var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <Camera size={16} color="white" />
                </button>
              </div>

              <h2 style={{ color: 'var(--text-heading)', marginBottom: 'var(--sp-1)' }}>{profile.name}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>{profile.email}</p>

              <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
                {(profile.roles || []).map(role => (
                  <span key={role} style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--r-md)',
                    background: role === 'CUSTOMER' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(45, 212, 191, 0.15)',
                    color: role === 'CUSTOMER' ? 'var(--orange-500)' : 'var(--teal)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600
                  }}>
                    {role}
                  </span>
                ))}
              </div>

              <div style={{
                padding: 'var(--sp-3)',
                borderRadius: 'var(--r-md)',
                background: profile.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                marginBottom: 'var(--sp-4)'
              }}>
                <span style={{
                  color: profile.active ? 'var(--green-500)' : 'var(--red-500)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600
                }}>
                  {profile.active ? '● Active' : '● Inactive'}
                </span>
              </div>

              <Button
                variant="secondary"
                size="medium"
                onClick={() => setIsEditing(!isEditing)}
                style={{ width: '100%', marginBottom: 'var(--sp-2)' }}
              >
                <Edit2 size={16} /> {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>

              <Button
                variant="ghost"
                size="medium"
                onClick={() => setIsChangePasswordOpen(true)}
                style={{ width: '100%', marginBottom: 'var(--sp-2)' }}
              >
                <Key size={16} /> Change Password
              </Button>

              <Button
                variant="ghost"
                size="medium"
                onClick={handleLogoutAllDevices}
                style={{ width: '100%', color: 'var(--red-500)' }}
              >
                <LogOut size={16} /> Logout
              </Button>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Right Column - Details */}
        <motion.div variants={itemAnim} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          {/* Personal Information */}
          <Card variant="elevated">
            <Card.Header>
              <Card.Title>Personal Information</Card.Title>
              <Card.Description>Your basic information</Card.Description>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-6)' }}>
              {isEditing ? (
                <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
                  <Input
                    label="Full Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    icon={<User size={18} />}
                  />
                  <Input
                    label="Email"
                    value={profile.email}
                    disabled
                    icon={<Mail size={18} />}
                  />
                  <Input
                    label="Phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    icon={<Phone size={18} />}
                  />
                  <Input
                    label="Address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    icon={<MapPin size={18} />}
                  />
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" size="medium" onClick={() => setIsEditing(false)}>
                      <X size={16} /> Cancel
                    </Button>
                    <Button variant="primary" size="medium" onClick={handleUpdateProfile} disabled={loading}>
                      <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
                  <InfoItem icon={<User size={18} />} label="Full Name" value={profile.name} />
                  <InfoItem icon={<Mail size={18} />} label="Email" value={profile.email} />
                  <InfoItem icon={<Phone size={18} />} label="Phone" value={profile.phone || 'Not provided'} />
                  <InfoItem icon={<MapPin size={18} />} label="Address" value={profile.address || 'Not provided'} />
                  <InfoItem
                    icon={<Calendar size={18} />}
                    label="Member Since"
                    value={new Date(profile.createdDate).toLocaleDateString()}
                  />
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Role-Specific Section */}
          {isCustomer && (
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Loyalty Information</Card.Title>
                <Card.Description>Your rewards and benefits</Card.Description>
              </Card.Header>
              <Card.Content style={{ padding: 'var(--sp-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                  <StatCard label="Total Points" value="0" icon="⭐" />
                  <StatCard label="Tier" value="Silver" icon="🏆" />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-4)' }}>
                  Order more to earn points and unlock exclusive benefits!
                </p>
              </Card.Content>
            </Card>
          )}

          {isStaff && (
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Work Information</Card.Title>
                <Card.Description>Your employment details</Card.Description>
              </Card.Header>
              <Card.Content style={{ padding: 'var(--sp-6)' }}>
                <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
                  <InfoItem icon={<Shield size={18} />} label="Position" value={profile.roles.join(', ')} />
                  <InfoItem
                    icon={<Calendar size={18} />}
                    label="Joined Date"
                    value={new Date(profile.createdDate).toLocaleDateString()}
                  />
                  <InfoItem icon={<Clock size={18} />} label="Current Shift" value="Not assigned" />
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Account Security */}
          <Card variant="elevated">
            <Card.Header>
              <Card.Title>Account Security</Card.Title>
              <Card.Description>Manage your security settings</Card.Description>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-6)' }}>
              <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                <SecurityItem
                  icon={<Key size={18} />}
                  title="Password"
                  description="Last changed: Never"
                  action={<Button variant="ghost" size="small" onClick={() => setIsChangePasswordOpen(true)}>Change</Button>}
                />
                <SecurityItem
                  icon={<LogOut size={18} />}
                  title="Active Sessions"
                  description="1 device currently logged in"
                  action={<Button variant="ghost" size="small" onClick={handleLogoutAllDevices}>Logout All</Button>}
                />
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Change Password"
      >
        <div style={{ display: 'grid', gap: 'var(--sp-4)', padding: 'var(--sp-4) 0' }}>
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
          />
          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          />
          <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end', marginTop: 'var(--sp-4)' }}>
            <Button variant="ghost" size="medium" onClick={() => setIsChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="medium" onClick={handleChangePassword} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

// Helper Components
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: 'var(--r-md)',
      background: 'rgba(212, 175, 55, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--orange-500)'
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
      <div style={{ color: 'var(--text-heading)', fontWeight: 500 }}>{value}</div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <div style={{
    padding: 'var(--sp-4)',
    borderRadius: 'var(--r-md)',
    background: 'var(--bg-secondary)',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '32px', marginBottom: 'var(--sp-2)' }}>{icon}</div>
    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: 'var(--sp-1)' }}>
      {value}
    </div>
    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{label}</div>
  </div>
);

const SecurityItem = ({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--sp-3)',
    borderRadius: 'var(--r-md)',
    background: 'var(--bg-secondary)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: 'var(--r-md)',
        background: 'rgba(212, 175, 55, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--orange-500)'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-heading)', fontWeight: 500, marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{description}</div>
      </div>
    </div>
    {action}
  </div>
);
