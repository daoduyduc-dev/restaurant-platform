import { useState } from 'react';
import { Settings, Clock, Bell, Shield, Palette, Database, Mail, Globe, Save, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button, Card, Input } from '../../components/ui';
import { toast } from '../../store/toastStore';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const AdminSettingsView = () => {
  const [settings, setSettings] = useState({
    restaurantName: 'ServeGenius Restaurant',
    email: 'contact@servegenius.com',
    phone: '+84 901 234 567',
    address: '123 Nguyen Hue, District 1, Ho Chi Minh City',
    openingTime: '10:00',
    closingTime: '22:00',
    noShowGracePeriod: '20',
    defaultReservationDuration: '90',
    loyaltyPointsPerDollar: '1',
    autoAssignWaiter: true,
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: 'en'
  });

  const handleSave = () => {
    // TODO: Implement API call to save settings
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    // Reset to defaults
    setSettings({
      restaurantName: 'ServeGenius Restaurant',
      email: 'contact@servegenius.com',
      phone: '+84 901 234 567',
      address: '123 Nguyen Hue, District 1, Ho Chi Minh City',
      openingTime: '10:00',
      closingTime: '22:00',
      noShowGracePeriod: '20',
      defaultReservationDuration: '90',
      loyaltyPointsPerDollar: '1',
      autoAssignWaiter: true,
      emailNotifications: true,
      smsNotifications: false,
      darkMode: false,
      language: 'en'
    });
    toast.info('Settings reset');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemAnim} className="page-header">
        <div>
          <h1 style={{ color: 'var(--orange-400)' }}>System Settings</h1>
          <p>Configure your restaurant management system</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <Button variant="ghost" size="medium" onClick={handleReset}>
            <RotateCcw size={16} /> Reset
          </Button>
          <Button variant="primary" size="medium" onClick={handleSave}>
            <Save size={16} /> Save Changes
          </Button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-6)' }}>
        {/* General Settings */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
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
                  <Settings size={20} />
                </div>
                <div>
                  <Card.Title>General Settings</Card.Title>
                  <Card.Description>Basic restaurant information</Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <Input
                label="Restaurant Name"
                value={settings.restaurantName}
                onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
              <Input
                label="Phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
              <Input
                label="Address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </Card.Content>
          </Card>
        </motion.div>

        {/* Business Hours */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(13, 148, 136, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--teal)'
                }}>
                  <Clock size={20} />
                </div>
                <div>
                  <Card.Title>Business Hours</Card.Title>
                  <Card.Description>Operating hours and reservation settings</Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
                <Input
                  label="Opening Time"
                  type="time"
                  value={settings.openingTime}
                  onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                />
                <Input
                  label="Closing Time"
                  type="time"
                  value={settings.closingTime}
                  onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                />
              </div>
              <Input
                label="No-Show Grace Period (minutes)"
                type="number"
                value={settings.noShowGracePeriod}
                onChange={(e) => setSettings({ ...settings, noShowGracePeriod: e.target.value })}
              />
              <Input
                label="Default Reservation Duration (minutes)"
                type="number"
                value={settings.defaultReservationDuration}
                onChange={(e) => setSettings({ ...settings, defaultReservationDuration: e.target.value })}
              />
            </Card.Content>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--purple-500)'
                }}>
                  <Bell size={20} />
                </div>
                <div>
                  <Card.Title>Notifications</Card.Title>
                  <Card.Description>Email and SMS notification settings</Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <ToggleSetting
                label="Email Notifications"
                description="Send email confirmations and reminders"
                checked={settings.emailNotifications}
                onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
              <ToggleSetting
                label="SMS Notifications"
                description="Send SMS alerts for urgent updates"
                checked={settings.smsNotifications}
                onChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
              />
            </Card.Content>
          </Card>
        </motion.div>

        {/* Loyalty & Rewards */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(251, 191, 36, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--amber)'
                }}>
                  <Shield size={20} />
                </div>
                <div>
                  <Card.Title>Loyalty & Rewards</Card.Title>
                  <Card.Description>Points system configuration</Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <Input
                label="Points per $10 Spent"
                type="number"
                value={settings.loyaltyPointsPerDollar}
                onChange={(e) => setSettings({ ...settings, loyaltyPointsPerDollar: e.target.value })}
              />
              <ToggleSetting
                label="Auto-Assign Waiter"
                description="Automatically assign waiters to tables"
                checked={settings.autoAssignWaiter}
                onChange={(checked) => setSettings({ ...settings, autoAssignWaiter: checked })}
              />
            </Card.Content>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(236, 72, 153, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--pink-500)'
                }}>
                  <Palette size={20} />
                </div>
                <div>
                  <Card.Title>Appearance</Card.Title>
                  <Card.Description>UI and language preferences</Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
              <ToggleSetting
                label="Dark Mode"
                description="Switch to dark theme"
                checked={settings.darkMode}
                onChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
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
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* System Info */}
        <motion.div variants={itemAnim}>
          <Card variant="elevated">
            <Card.Header>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--blue-500)'
                }}>
                  <Database size={20} />
                </div>
                <div>
                  <Card.Title>System Information</Card.Title>
                  <Card.Description>Version and database status</Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content style={{ padding: 'var(--sp-5)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                <InfoRow label="Version" value="2.0.0" />
                <InfoRow label="Database" value="PostgreSQL 15" />
                <InfoRow label="Backend" value="Spring Boot 4.0.3" />
                <InfoRow label="Frontend" value="React 19 + TypeScript" />
                <InfoRow label="Last Backup" value="2026-04-03 02:00 AM" />
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Helper Components
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
