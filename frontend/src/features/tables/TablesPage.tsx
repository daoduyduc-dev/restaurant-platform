import { useRoleView } from '../../utils/useRoleView';
import { WaiterTableView } from './WaiterTableView';
import { CustomerTableView } from './CustomerTableView';
import { ManagerTableView } from './ManagerTableView';
import { AdminTableView } from './AdminTableView';

export const TablesPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'STAFF':        return <WaiterTableView />;
    case 'CUSTOMER':     return <CustomerTableView />;
    case 'ADMIN':        return <AdminTableView />;
    default:             return <WaiterTableView />;
  }
};
