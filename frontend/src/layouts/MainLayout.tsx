import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Table2,
  Calendar,
  Award,
  BarChart3,
  Users,
  LogOut,
  Settings,
  UserCircle,
  CreditCard,
  Home,
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { getPrimaryRole, type UserRole } from '../utils/roleUtils';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import i18n from '../i18n';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const buildNav = (primaryRole: UserRole, t: (key: string) => string): NavSection[] => {
  const commonNav: NavSection[] = [
    {
      section: t('sections.overview'),
      items: [
        {
          to: '/app/dashboard',
          icon: LayoutDashboard,
          label: t('nav.dashboard'),
        },
      ],
    },
  ];

  switch (primaryRole) {
    case 'CUSTOMER':
      return [
        ...commonNav,
        {
          section: t('sections.experience'),
          items: [
            { to: '/app/tables', icon: Table2, label: t('nav.tables') },
            { to: '/app/reservations', icon: Calendar, label: t('nav.myReservations') },
            { to: '/app/menu', icon: UtensilsCrossed, label: t('nav.menu') },
            { to: '/app/loyalty', icon: Award, label: t('nav.loyalty') },
          ],
        },
      ];
    case 'STAFF':
      return [
        ...commonNav,
        {
          section: t('sections.operations'),
          items: [
            { to: '/app/reservations', icon: Calendar, label: t('nav.reservations') },
            { to: '/app/tables', icon: Table2, label: t('nav.tables') },
            { to: '/app/orders', icon: ClipboardList, label: t('nav.orders') },
            { to: '/app/payment', icon: CreditCard, label: t('nav.payment') },
            { to: '/app/menu', icon: UtensilsCrossed, label: t('nav.menu') },
          ],
        },
      ];
    case 'ADMIN':
      return [
        ...commonNav,
        {
          section: t('sections.operations'),
          items: [
            { to: '/app/reservations', icon: Calendar, label: t('nav.reservations') },
            { to: '/app/tables', icon: Table2, label: t('nav.tables') },
            { to: '/app/orders', icon: ClipboardList, label: t('nav.orders') },
            { to: '/app/menu', icon: UtensilsCrossed, label: t('nav.menu') },
            { to: '/app/loyalty', icon: Award, label: t('nav.customers') },
          ],
        },
        {
          section: t('sections.admin'),
          items: [
            { to: '/app/report', icon: BarChart3, label: t('nav.reports') },
            { to: '/app/staff', icon: Users, label: t('nav.staff') },
            { to: '/app/settings', icon: Settings, label: t('nav.settings') },
          ],
        },
      ];
    default:
      return commonNav;
  }
};

export const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null) window.clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current !== null) window.clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => setSidebarExpanded(true), 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current !== null) window.clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => setSidebarExpanded(false), 200);
  };

  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const logout = useAuthStore((state) => state.logout);
  const primaryRole = getPrimaryRole(user?.roles || []);
  const navSections = useMemo(() => buildNav(primaryRole, t), [primaryRole, t]);

  const getCurrentTitle = () => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (location.pathname === item.to || location.pathname.startsWith(item.to)) {
          return item.label;
        }
      }
    }

    return t('nav.dashboard');
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', null, {
        headers: refreshToken
          ? { 'X-Refresh-Token': refreshToken }
          : undefined,
      });
    } catch {
      // Ignore logout transport errors and clear local auth state anyway.
    }

    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'US';

  return (
    <div className="app-shell">
      <motion.aside 
        className="sidebar"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{ width: sidebarExpanded ? 'var(--sidebar-width)' : '80px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <UtensilsCrossed size={18} />
          </div>
          <motion.span 
            className="sidebar-brand-text"
            animate={{ opacity: sidebarExpanded ? 1 : 0, width: sidebarExpanded ? 'auto' : 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            ServeGenius
          </motion.span>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.section}>
              <motion.div 
                className="sidebar-section-label"
                animate={{ opacity: sidebarExpanded ? 1 : 0, height: sidebarExpanded ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                {section.section}
              </motion.div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  title={sidebarExpanded ? undefined : item.label}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <motion.span
                        animate={{ opacity: sidebarExpanded ? 1 : 0, width: sidebarExpanded ? 'auto' : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                      >
                        {item.label}
                      </motion.span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/" className="sidebar-link" style={{ marginBottom: 8 }} title={sidebarExpanded ? undefined : t('nav.home')}>
            <Home size={18} />
            <motion.span
              animate={{ opacity: sidebarExpanded ? 1 : 0, width: sidebarExpanded ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              {t('nav.home')}
            </motion.span>
          </NavLink>

          <NavLink
            to="/app/profile"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            style={{ marginBottom: 8 }}
            title={sidebarExpanded ? undefined : t('common.profile')}
          >
            {({ isActive }) => (
              <>
                <UserCircle size={18} strokeWidth={isActive ? 2.5 : 2} />
                <motion.span
                  animate={{ opacity: sidebarExpanded ? 1 : 0, width: sidebarExpanded ? 'auto' : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  {t('common.profile')}
                </motion.span>
              </>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              gap: 12,
              padding: '10px 12px',
            }}
            title={sidebarExpanded ? undefined : t('common.logout')}
          >
            <LogOut size={18} />
            <motion.span
              animate={{ opacity: sidebarExpanded ? 1 : 0, width: sidebarExpanded ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              {t('common.logout')}
            </motion.span>
          </button>
        </div>
      </motion.aside>

      <div className="main-content">
        <header className="top-bar">
          <div>
            <h2
              style={{
                fontSize: 'var(--text-xl)',
                color: 'var(--orange-600)',
                margin: 0,
              }}
            >
              {getCurrentTitle()}
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <select
              value={i18n.language}
              onChange={(event) => void i18n.changeLanguage(event.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-main)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
              }}
            >
              <option value="vi">{t('common.vietnamese')}</option>
              <option value="en">{t('common.english')}</option>
            </select>

            {primaryRole === 'ADMIN' && (
              <button
                className="btn btn-ghost"
                style={{ padding: 10 }}
                onClick={() => navigate('/app/settings')}
              >
                <Settings size={18} />
              </button>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div className="avatar">{initials}</div>

              <div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                  }}
                >
                  {user?.name || 'User'}
                </div>

                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--orange-600)',
                  }}
                >
                  {primaryRole}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
