import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useWebSocket } from '../../services/useWebSocket';
import { toast } from '../../store/toastStore';

interface NotificationItem {
  id?: string;
  type?: string;
  message?: string;
  orderId?: string;
  timestamp?: string;
}

export const NotificationsPage = () => {
  const user = useAuthStore(s => s.user);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // ensure we don't keep huge list
    if (items.length > 200) setItems(items.slice(0, 200));
  }, [items]);

  const topics: string[] = [];
  if (user?.id) topics.push(`/topic/notifications/${user.id}`);
  if (user?.roles) {
    user.roles.forEach(r => topics.push(`/topic/notifications/role/${r}`));
  }
  // subscribe to personal queue (STOMP user destination)
  if (user) topics.push(`/user/queue/notifications`);

  useWebSocket<NotificationItem>(topics, (msg) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item = { id, ...msg };
    setItems(prev => [item, ...prev].slice(0, 200));
    // push toast for immediate attention
    if (item.message) {
      toast.info(item.message);
    }
  });

  return (
    <div style={{ padding: 24 }}>
      <h1>Notifications</h1>
      <div style={{ marginTop: 12 }}>
        {items.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>No notifications</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map(i => (
              <div key={i.id} style={{ padding: 12, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
                <div style={{ fontWeight: 700 }}>{i.type || 'Notification'}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{i.message}</div>
                <div style={{ marginTop: 6, fontSize: '12px', color: 'var(--text-muted)' }}>{i.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
