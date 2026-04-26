import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LoginPage } from './features/auth/LoginPage';
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
import { NotFoundPage } from './NotFoundPage';
import { useAuthStore } from './store/authStore';
import { hasAnyRole, type UserRole } from './utils/roleUtils';
import { ToastContainer } from './components/ui/Toast';

const ProtectedRoute = ({ children, allowedRoles }: { 
  children: React.ReactNode; 
  allowedRoles?: UserRole[];
}) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !hasAnyRole(user.roles, allowedRoles)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* All role-adaptive pages — each page handles its own role rendering */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="loyalty" element={<LoyaltyPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          
          {/* Staff management - ADMIN only */}
          <Route path="staff" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StaffPage />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
