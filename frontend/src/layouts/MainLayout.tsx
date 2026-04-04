import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, CreditCard,
  UtensilsCrossed as MenuIcon2, PieChart, Calendar,
  Award, BarChart3, Users, LogOut, Settings, Bell, Search, UserCircle,
  ChefHat
} from 'lucide-react';
import { getPrimaryRole, type UserRole } from '../utils/roleUtils';
import { useWebSocket } from '../services/useWebSocket';
import { useState, useMemo } from 'react';

interface NavSection {
  section: string;
  items: { to: string; icon: any; label: string }[];
}

const buildNav = (primaryRole: UserRole): NavSection[] => {
  const commonNav: NavSection[] = [
    { section: 'Main', items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ]},
  ];

  switch (primaryRole) {
    case 'CUSTOMER':
      return [
        ...commonNav,
        { section: 'Dining', items: [
          { to: '/tables', icon: PieChart, label: 'Table Map' },
          { to: '/reservations', icon: Calendar, label: 'My Reservations' },
          { to: '/menu', icon: MenuIcon2, label: 'Browse Menu' },
          { to: '/payment', icon: CreditCard, label: 'Payment' },
        ]},
        { section: 'Rewards', items: [
          { to: '/loyalty', icon: Award, label: 'Loyalty Rewards' },
          { to: '/report', icon: BarChart3, label: 'My History' },
        ]},
      ];

    case 'WAITER':
      return [
        ...commonNav,
        { section: 'Service', items: [
          { to: '/orders', icon: ClipboardList, label: 'Orders' },
          { to: '/tables', icon: PieChart, label: 'Table Map' },
          { to: '/payment', icon: CreditCard, label: 'Payments' },
        ]},
        { section: 'Reference', items: [
          { to: '/reservations', icon: Calendar, label: 'Reservations' },
          { to: '/report', icon: BarChart3, label: 'My Stats' },
        ]},
      ];

    case 'KITCHEN':
      return [
        ...commonNav,
        { section: 'Kitchen', items: [
          { to: '/orders', icon: ChefHat, label: 'Kitchen Display' },
        ]},
      ];

    case 'RECEPTIONIST':
      return [
        ...commonNav,
        { section: 'Front Desk', items: [
          { to: '/reservations', icon: Calendar, label: 'Reservations' },
          { to: '/tables', icon: PieChart, label: 'Table Map' },
          { to: '/orders', icon: ClipboardList, label: 'Orders' },
          { to: '/payment', icon: CreditCard, label: 'Payments' },
        ]},
        { section: 'Reference', items: [
          { to: '/report', icon: BarChart3, label: 'Reports' },
        ]},
      ];

    case 'MANAGER':
      return [
        ...commonNav,
        { section: 'Operations', items: [
          { to: '/orders', icon: ClipboardList, label: 'Orders' },
          { to: '/tables', icon: PieChart, label: 'Tables' },
          { to: '/reservations', icon: Calendar, label: 'Reservations' },
          { to: '/payment', icon: CreditCard, label: 'Payments' },
          { to: '/menu', icon: MenuIcon2, label: 'Menu' },
        ]},
        { section: 'Analytics', items: [
          { to: '/report', icon: BarChart3, label: 'Reports' },
          { to: '/staff', icon: Users, label: 'Staff' },
          { to: '/loyalty', icon: Award, label: 'Loyalty' },
          { to: '/settings', icon: Settings, label: 'Settings' },
        ]},
      ];

    case 'ADMIN':
      return [
        ...commonNav,
        { section: 'Administration', items: [
          { to: '/staff', icon: Users, label: 'User Management' },
          { to: '/menu', icon: MenuIcon2, label: 'Menu' },
          { to: '/tables', icon: PieChart, label: 'Tables' },
        ]},
        { section: 'Operations', items: [
          { to: '/orders', icon: ClipboardList, label: 'Orders' },
          { to: '/reservations', icon: Calendar, label: 'Reservations' },
          { to: '/payment', icon: CreditCard, label: 'Payments' },
        ]},
        { section: 'System', items: [
          { to: '/report', icon: BarChart3, label: 'Reports' },
          { to: '/settings', icon: Settings, label: 'Settings' },
        ]},
      ];

    default:
      return commonNav;
  }
};

export const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const roles = user?.roles || [];
  const primaryRole = getPrimaryRole(roles);
  const [notifCount, setNotifCount] = useState(0);

  const NAV = useMemo(() => buildNav(primaryRole), [primaryRole]);

  // subscribe to notifications
  const notifTopics = useMemo(() => {
    const topics: string[] = [];
    if (user?.id) topics.push(`/topic/notifications/${user.id}`);
    if (user?.roles) user.roles.forEach(r => topics.push(`/topic/notifications/role/${r}`));
    if (user) topics.push(`/user/queue/notifications`);
    return topics;
  }, [user?.id, user?.roles]);

  useWebSocket<any>(notifTopics, () => {
    setNotifCount(c => c + 1);
  });

  const getCurrentTitle = () => {
    for (const sec of NAV) {
      for (const item of sec.items) {
        if (item.to === location.pathname || (item.to !== '/' && location.pathname.startsWith(item.to))) {
          return item.label;
        }
      }
    }
    return 'Dashboard';
  };

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <MenuIcon2 size={18} />
          </div>
          <span className="sidebar-brand-text">ServeGenius</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(sec => (
            <div key={sec.section}>
              <div className="sidebar-section-label">{sec.section}</div>
              {sec.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive: active }) => `sidebar-link${active ? ' active' : ''}`}
                >
                  {({ isActive: active }) => (
                    <>
                      <item.icon size={18} strokeWidth={active ? 2.5 : 2} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: '8px 12px', marginBottom: '8px', borderRadius: 'var(--r-md)', background: 'rgba(212, 175, 55, 0.1)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '2px' }}>Logged in as</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--orange-500)' }}>{primaryRole}</div>
          </div>
          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            style={{ marginBottom: '8px' }}
          >
            {({ isActive }) => (
              <>
                <UserCircle size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>Profile</span>
              </>
            )}
          </NavLink>
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ width:'100%', justifyContent:'flex-start', gap:'12px', color:'var(--text-muted)', padding:'8px 12px' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-bar">
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <h2 style={{ fontSize:'var(--text-xl)', fontFamily:'var(--font-serif)', color:'var(--orange-600)', letterSpacing:'0.01em' }}>
              {getCurrentTitle()}
            </h2>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div className="search-bar" style={{ width:'280px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input placeholder="Search..." />
            </div>
            <button 
              className="btn btn-ghost" 
              style={{ padding:'8px', borderRadius:'var(--r-md)', position: 'relative' }}
              onClick={() => { setNotifCount(0); navigate('/notifications'); }}
              title="Notifications"
            >
              <Bell size={18} />
              {notifCount > 0 && (
                <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--rose)', color: '#fff', borderRadius: 8, padding: '2px 6px', fontSize: 11, fontWeight: 700 }}>
                  {notifCount}
                </div>
              )}
            </button>
            <button 
              className="btn btn-ghost" 
              style={{ padding:'8px', borderRadius:'var(--r-md)' }}
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <div style={{ width:'1px', height:'24px', background:'var(--border-main)', margin:'0 4px' }} />
            <div style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}>
              <div className="avatar">{initials}</div>
              <div>
                <div style={{ fontSize:'var(--text-sm)', fontWeight:600, lineHeight:1.2, color:'var(--text-heading)' }}>{user?.name || 'User'}</div>
                <div style={{ fontSize:'var(--text-xs)', color:'var(--orange-600)' }}>{primaryRole}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
