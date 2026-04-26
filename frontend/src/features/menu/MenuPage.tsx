import { useRoleView } from '../../utils/useRoleView';
import { AdminMenuCatalogView } from './AdminMenuCatalogView';
import { CustomerMenuOrderView } from './CustomerMenuOrderView';
import { StaffMenuView } from './StaffMenuView';

export const MenuPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'ADMIN':
      return <AdminMenuCatalogView />;
    case 'STAFF':
      return <StaffMenuView />;
    case 'CUSTOMER':
    default:
      return <CustomerMenuOrderView />;
  }
};
