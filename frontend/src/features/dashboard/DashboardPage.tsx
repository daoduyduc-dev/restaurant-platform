import { useAuthStore } from '../../store/authStore';
import { getPrimaryRole, ROLE_ROUTES } from '../../utils/roleUtils';
import { CustomerDashboard } from './CustomerDashboard';
import { WaiterDashboard } from './WaiterDashboard';
import { ReceptionistDashboard } from './ReceptionistDashboard';
import { KitchenDashboard } from './KitchenDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { AdminDashboard } from './AdminDashboard';
import type { UserRole } from '../../utils/roleUtils';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const primaryRole = user?.roles ? getPrimaryRole(user.roles) : 'CUSTOMER';

  const renderDashboard = () => {
    switch (primaryRole) {
      case 'CUSTOMER':
        return <CustomerDashboard />;
      case 'WAITER':
        return <WaiterDashboard />;
      case 'RECEPTIONIST':
        return <ReceptionistDashboard />;
      case 'KITCHEN':
        return <KitchenDashboard />;
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return <>{renderDashboard()}</>;
};
