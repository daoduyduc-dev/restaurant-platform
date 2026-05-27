import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';

import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';

import { DashboardPage } from './features/dashboard/DashboardPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { SettingsPage } from './features/settings/SettingsPage';
import { MenuPage } from './features/menu/MenuPage';
import { TablesPage } from './features/tables/TablesPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { ReservationsPage } from './features/reservations/ReservationsPage';
import { LoyaltyPage } from './features/loyalty/LoyaltyPage';
import { PaymentPage } from './features/payment/PaymentPage';
import { ReportPage } from './features/report/ReportPage';
import { StaffPage } from './features/staff/StaffPage';
import { NotificationsPage } from './features/notifications/NotificationsPage';

import { PublicRestaurantDashboard } from './features/public/PublicRestaurantDashboard';
import { PublicReservationPage } from './features/public/PublicReservationPage';

import { NotFoundPage } from './NotFoundPage';

import { useAuthStore } from './store/authStore';
import { hasAnyRole, type UserRole } from './utils/roleUtils';

import { ToastContainer } from './components/ui/Toast';
import api from './services/api';
import i18n, { getStoredLanguage, setStoredLanguage } from './i18n';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasAnyRole(user.roles, allowedRoles)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

const GuestOnlyRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuthStore();

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    const savedLanguage = getStoredLanguage();
    if (savedLanguage) {
      void i18n.changeLanguage(savedLanguage);
    }

    const syncLanguage = async () => {
      try {
        const response = await api.get('/settings/public');
        const configuredLanguage = response.data.data?.language;
        if (configuredLanguage && !window.localStorage.getItem('restaurant-platform.language')) {
          setStoredLanguage(configuredLanguage);
          await i18n.changeLanguage(configuredLanguage);
        }
      } catch {
        // Keep local/default language when public settings are unavailable.
      }
    };

    void syncLanguage();
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />

      <Routes>
        {/* PUBLIC */}
        <Route
          path="/"
          element={<PublicRestaurantDashboard />}
        />

        <Route
          path="/reserve"
          element={<PublicReservationPage />}
        />

        <Route
          path="/menu"
          element={<MenuPage />}
        />

        {/* AUTH */}
        <Route
          element={
            <GuestOnlyRoute>
              <AuthLayout />
            </GuestOnlyRoute>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* APP */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/app/dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="profile"
            element={<ProfilePage />}
          />

          <Route
            path="settings"
            element={<SettingsPage />}
          />

          <Route
            path="menu"
            element={<MenuPage />}
          />

          <Route
            path="tables"
            element={<TablesPage />}
          />

          <Route
            path="orders"
            element={<OrdersPage />}
          />

          <Route
            path="reservations"
            element={<ReservationsPage />}
          />

          <Route
            path="loyalty"
            element={<LoyaltyPage />}
          />

          <Route
            path="payment"
            element={<PaymentPage />}
          />

          <Route
            path="report"
            element={<ReportPage />}
          />

          <Route
            path="notifications"
            element={<NotificationsPage />}
          />

          <Route
            path="staff"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <StaffPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* FALLBACK */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
