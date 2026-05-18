import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList,
  UtensilsCrossed as MenuIcon2, Table2, Calendar,
  Award, BarChart3, Users, LogOut, Settings, Search, UserCircle, CreditCard,
} from 'lucide-react';
import { getPrimaryRole, type UserRole } from '../utils/roleUtils';
import { useMemo } from 'react';
import { NotificationBell } from '../components/NotificationBell';

interface NavSection {
  section: string;
  items: { to: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string }[];
}

const buildNav = (primaryRole: UserRole): NavSection[] => {
  const commonNav: NavSection[] = [
    { section: 'Tong quan', items: [
      { to: '/', icon: LayoutDashboard, label: 'Bang dieu khien' },
    ]},
  ];

  switch (primaryRole) {
    case 'CUSTOMER':
      return [
        ...commonNav,
        { section: 'Dat dich vu', items: [
          { to: '/tables', icon: Table2, label: 'So do ban' },
          { to: '/reservations', icon: Calendar, label: 'Dat ban cua toi' },
          { to: '/menu', icon: MenuIcon2, label: 'Thuc don' },
        ]},
        { section: 'Thanh vien', items: [
          { to: '/loyalty', icon: Award, label: 'Diem thuong' },
        ]},
      ];

    case 'STAFF':
      return [
        ...commonNav,
        { section: 'Van hanh ca lam', items: [
          { to: '/reservations', icon: Calendar, label: 'Don dat ban' },
          { to: '/tables', icon: Table2, label: 'Ban an' },
          { to: '/orders', icon: ClipboardList, label: 'Order & bep' },
          { to: '/payment', icon: CreditCard, label: 'Thanh toan' },
          { to: '/menu', icon: MenuIcon2, label: 'Tra thuc don' },
        ]},
      ];

    case 'ADMIN':
      return [
        ...commonNav,
        { section: 'Van hanh', items: [
          { to: '/reservations', icon: Calendar, label: 'Dat ban' },
          { to: '/tables', icon: Table2, label: 'Ban an' },
          { to: '/orders', icon: ClipboardList, label: 'Order' },
          { to: '/menu', icon: MenuIcon2, label: 'Thuc don' },
          { to: '/loyalty', icon: Award, label: 'Khach hang than thiet' },
        ]},
        { section: 'Quan tri', items: [
          { to: '/report', icon: BarChart3, label: 'Bao cao' },
          { to: '/staff', icon: Users, label: 'Nhan su' },
          { to: '/settings', icon: Settings, label: 'Cau hinh' },
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
  const NAV = useMemo(() => buildNav(primaryRole), [primaryRole]);

  const getCurrentTitle = () => {
    for (const sec of NAV) {
      for (const item of sec.items) {
        if (item.to === location.pathname || (item.to !== '/' && location.pathname.startsWith(item.to))) {
          return item.label;
        }
      }
    }
    return 'Bang dieu khien';
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
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '2px' }}>Dang dang nhap</div>
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
                <span>Ho so</span>
              </>
            )}
          </NavLink>
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ width:'100%', justifyContent:'flex-start', gap:'12px', color:'var(--text-muted)', padding:'8px 12px' }}
          >
            <LogOut size={18} />
            <span>Dang xuat</span>
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
              <input placeholder="Tim ban, order, khach..." />
            </div>
            <NotificationBell />
            {primaryRole === 'ADMIN' && (
              <button
                className="btn btn-ghost"
                style={{ padding:'8px', borderRadius:'var(--r-md)' }}
                onClick={() => navigate('/settings')}
                title="Cau hinh"
              >
                <Settings size={18} />
              </button>
            )}
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
