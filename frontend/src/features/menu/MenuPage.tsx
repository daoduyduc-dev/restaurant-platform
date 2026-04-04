import { useRoleView } from '../../utils/useRoleView';
import { AdminMenuCatalogView } from './AdminMenuCatalogView';
import { CustomerMenuOrderView } from './CustomerMenuOrderView';

export const MenuPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'ADMIN':
    case 'MANAGER':
      return <AdminMenuCatalogView />;
    case 'CUSTOMER':
    case 'WAITER':
    case 'RECEPTIONIST':
    default:
      return <CustomerMenuOrderView />;
  }
};
