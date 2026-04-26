import { useAuthStore } from '../../store/authStore';
import { getPrimaryRole, ROLE_ROUTES } from '../../utils/roleUtils';
import { CustomerDashboard } from './CustomerDashboard';
import { WaiterDashboard } from './WaiterDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { AdminDashboard } from './AdminDashboard';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const primaryRole = user?.roles ? getPrimaryRole(user.roles) : 'CUSTOMER';

  const renderDashboard = () => {
    switch (primaryRole) {
      case 'CUSTOMER':
        return <CustomerDashboard />;
      case 'STAFF':
        return <WaiterDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return <>{renderDashboard()}</>;
};
