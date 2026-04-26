import { useState, useEffect, useMemo, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../services/useWebSocket';

interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useAuthStore(s => s.user);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const [allRes, unreadRes] = await Promise.all([
        api.get('/notifications?size=10'),
        api.get('/notifications/unread/count')
      ]);
      setNotifications(allRes.data.data?.notifications || []);
      setUnreadCount(unreadRes.data.data || 0);
    } catch (e) {
      console.error('Error fetching notifications API', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const notifTopics = useMemo(() => {
    if (!user) return [];
    return [
      `/topic/notifications/${user.id}`,
      ...(user.roles || []).map(r => `/topic/notifications/role/${r}`),
      '/user/queue/notifications',
    ];
  }, [user?.id, user?.roles?.join('|')]);

  useWebSocket<any>(notifTopics, () => {
    fetchNotifications();
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotif = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        className="btn btn-ghost" 
        style={{ padding: '8px', borderRadius: 'var(--r-md)', position: 'relative' }}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--rose)', color: '#fff', borderRadius: 8, padding: '2px 6px', fontSize: 11, fontWeight: 700 }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: '320px',
              maxHeight: '400px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: 'var(--sp-3)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Notifications</span>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead} 
                  style={{ background: 'none', border: 'none', color: 'var(--blue-500)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--sp-1) 0' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 'var(--sp-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: 'var(--sp-3)', 
                      borderBottom: '1px solid var(--border-color)', 
                      background: n.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                      display: 'flex',
                      gap: 'var(--sp-2)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong style={{ fontSize: 13, color: 'var(--text-heading)' }}>{n.title}</strong>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{n.message}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4 }}>
                      {!n.isRead && (
                        <button onClick={(e) => markAsRead(e, n.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--blue-500)' }} title="Mark Read">
                          <Check size={14}/>
                        </button>
                      )}
                      <button onClick={(e) => deleteNotif(e, n.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }} title="Remove">
                        <X size={14}/>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
