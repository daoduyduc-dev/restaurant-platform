import { useAuthStore } from '../../store/authStore';
import { getPrimaryRole } from '../../utils/roleUtils';
import { CustomerDashboard } from './CustomerDashboard';
import { StaffDashboard } from './StaffDashboard';
import { AdminDashboard } from './AdminDashboard';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const primaryRole = user?.roles ? getPrimaryRole(user.roles) : 'CUSTOMER';

  const renderDashboard = () => {
    switch (primaryRole) {
      case 'CUSTOMER':
        return <CustomerDashboard />;
      case 'STAFF':
        return <StaffDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return <>{renderDashboard()}</>;
};
