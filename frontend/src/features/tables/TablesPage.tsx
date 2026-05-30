import { useRoleView } from '../../utils/useRoleView';
import { CustomerTableView } from './CustomerTableView';
import { AdminTableView } from './AdminTableView';
import { StaffTableView } from './StaffTableView';

export const TablesPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'STAFF':        return <StaffTableView />;
    case 'CUSTOMER':     return <CustomerTableView />;
    case 'ADMIN':        return <AdminTableView />;
    default:             return <StaffTableView />;
  }
};
