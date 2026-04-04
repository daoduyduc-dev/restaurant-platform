import { useRoleView } from '../../utils/useRoleView';
import { WaiterTableView } from './WaiterTableView';
import { CustomerTableView } from './CustomerTableView';
import { ReceptionistTableView } from './ReceptionistTableView';
import { ManagerTableView } from './ManagerTableView';
import { AdminTableView } from './AdminTableView';

export const TablesPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'WAITER':       return <WaiterTableView />;
    case 'CUSTOMER':     return <CustomerTableView />;
    case 'RECEPTIONIST': return <ReceptionistTableView />;
    case 'MANAGER':      return <ManagerTableView />;
    case 'ADMIN':        return <AdminTableView />;
    case 'KITCHEN':      return <WaiterTableView />;
    default:             return <WaiterTableView />;
  }
};
