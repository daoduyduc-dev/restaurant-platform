import { useRoleView } from '../../utils/useRoleView';
import { WaiterOrderView } from './WaiterOrderView';
import { ManagerOrderView } from './ManagerOrderView';
import { AdminOrderView } from './AdminOrderView';
import { CustomerOrderView } from './CustomerOrderView';

export const OrdersPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'STAFF':        return <WaiterOrderView />;
    case 'ADMIN':        return <AdminOrderView />;
    case 'CUSTOMER':     return <CustomerOrderView />;
    default:             return <WaiterOrderView />;
  }
};
