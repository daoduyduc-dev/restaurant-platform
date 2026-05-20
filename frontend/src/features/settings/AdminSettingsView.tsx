import { useEffect, useState, type ReactNode } from 'react';
import { Settings, Clock, Bell, Shield, Palette, Database, Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button, Card, Input } from '../../components/ui';
import { toast } from '../../store/toastStore';
import api from '../../services/api';
import type { SettingsDTO } from '../../services/types';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const DEFAULT_SETTINGS: SettingsDTO = {
  restaurantName: 'ServeGenius Restaurant',
  email: 'contact@servegenius.com',
  phone: '+84 901 234 567',
  address: '123 Nguyen Hue, District 1, Ho Chi Minh City',
  openingTime: '10:00',
  closingTime: '22:00',
  noShowGracePeriod: 20,
  defaultReservationDuration: 90,
  loyaltyPointsPerDollar: 1,
  autoAssignWaiter: true,
  emailNotifications: true,
  smsNotifications: false,
  darkMode: false,
  language: 'en',
};

const SYSTEM_INFO = {
  version: '2.0.0',
  database: 'PostgreSQL 15',
  backend: 'Spring Boot 4.0.3',
  frontend: 'React 19 + TypeScript',
  lastBackup: '2026-04-03 02:00 AM',
};

export const AdminSettingsView = () => {
  const [settings, setSettings] = useState<SettingsDTO>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings({ ...DEFAULT_SETTINGS, ...response.data.data });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/settings', settings);
      setSettings({ ...DEFAULT_SETTINGS, ...response.data.data });
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.info('Settings reset to defaults. Click Save Changes to persist.');
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}><div className="spinner" /></div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ paddingTop: 'var(--sp-4)' }}>
      <motion.div variants={itemAnim} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-400)' }}>System Settings</h1>
          <p>Configure your restaurant management system</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <Button variant="ghost" size="medium" onClick={handleReset}>
            <RotateCcw size={16} /> Reset
          </Button>
          <Button variant="primary" size="medium" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-6)' }}>
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <SectionHeader icon={<Settings size={20} />} title="General Settings" description="Basic restaurant information" tint="rgba(212, 175, 55, 0.1)" color="var(--orange-500)" />
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <Input label="Restaurant Name" value={settings.restaurantName} onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })} />
              <Input label="Email" type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
              <Input label="Phone" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
              <Input label="Address" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <SectionHeader icon={<Clock size={20} />} title="Business Hours" description="Operating hours and reservation settings" tint="rgba(13, 148, 136, 0.1)" color="var(--teal)" />
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                <Input label="Opening Time" type="time" value={settings.openingTime} onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })} />
                <Input label="Closing Time" type="time" value={settings.closingTime} onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })} />
              </div>
              <Input
                label="No-Show Grace Period (minutes)"
                type="number"
                value={String(settings.noShowGracePeriod)}
                onChange={(e) => setSettings({ ...settings, noShowGracePeriod: Number.parseInt(e.target.value, 10) || 0 })}
              />
              <Input
                label="Default Reservation Duration (minutes)"
                type="number"
                value={String(settings.defaultReservationDuration)}
                onChange={(e) => setSettings({ ...settings, defaultReservationDuration: Number.parseInt(e.target.value, 10) || 0 })}
              />
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <SectionHeader icon={<Bell size={20} />} title="Notifications" description="Email and SMS notification settings" tint="rgba(139, 92, 246, 0.1)" color="var(--purple-500)" />
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <ToggleSetting label="Email Notifications" description="Send email confirmations and reminders" checked={settings.emailNotifications} onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })} />
              <ToggleSetting label="SMS Notifications" description="Send SMS alerts for urgent updates" checked={settings.smsNotifications} onChange={(checked) => setSettings({ ...settings, smsNotifications: checked })} />
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <SectionHeader icon={<Shield size={20} />} title="Loyalty & Rewards" description="Points system configuration" tint="rgba(251, 191, 36, 0.1)" color="var(--amber)" />
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <Input
                label="Points per $10 Spent"
                type="number"
                value={String(settings.loyaltyPointsPerDollar)}
                onChange={(e) => setSettings({ ...settings, loyaltyPointsPerDollar: Number.parseInt(e.target.value, 10) || 0 })}
              />
              <ToggleSetting label="Auto-Assign Waiter" description="Automatically assign waiters to tables" checked={settings.autoAssignWaiter} onChange={(checked) => setSettings({ ...settings, autoAssignWaiter: checked })} />
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <SectionHeader icon={<Palette size={20} />} title="Appearance" description="UI and language preferences" tint="rgba(236, 72, 153, 0.1)" color="var(--pink-500)" />
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <ToggleSetting label="Dark Mode" description="Switch to dark theme" checked={settings.darkMode} onChange={(checked) => setSettings({ ...settings, darkMode: checked })} />
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 'var(--sp-2)' }}>
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--sp-3)',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-main)',
                    fontSize: 'var(--text-base)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="en">English</option>
                  <option value="vi">Tieng Viet</option>
                </select>
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <SectionHeader icon={<Database size={20} />} title="System Information" description="Version and database status" tint="rgba(59, 130, 246, 0.1)" color="var(--blue-500)" />
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                <InfoRow label="Version" value={SYSTEM_INFO.version} />
                <InfoRow label="Database" value={SYSTEM_INFO.database} />
                <InfoRow label="Backend" value={SYSTEM_INFO.backend} />
                <InfoRow label="Frontend" value={SYSTEM_INFO.frontend} />
                <InfoRow label="Last Backup" value={SYSTEM_INFO.lastBackup} />
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

const SectionHeader = ({ icon, title, description, tint, color }: {
  icon: ReactNode;
  title: string;
  description: string;
  tint: string;
  color: string;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: 'var(--r-md)',
      background: tint,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color
    }}>
      {icon}
    </div>
    <div>
      <Card.Title>{title}</Card.Title>
      <Card.Description>{description}</Card.Description>
    </div>
  </div>
);

const ToggleSetting = ({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--sp-3)',
    borderRadius: 'var(--r-md)',
    background: 'var(--bg-secondary)'
  }}>
    <div>
      <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{description}</div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: '48px',
        height: '24px',
        borderRadius: '12px',
        background: checked ? 'var(--orange-500)' : 'var(--gray-300)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: '2px',
        left: checked ? '26px' : '2px',
        transition: 'left var(--dur-fast) var(--ease-out)',
        boxShadow: 'var(--shadow-sm)'
      }} />
    </button>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    padding: 'var(--sp-2) 0',
    borderBottom: '1px solid var(--border-main)'
  }}>
    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{label}</span>
    <span style={{ color: 'var(--text-heading)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{value}</span>
  </div>
);
