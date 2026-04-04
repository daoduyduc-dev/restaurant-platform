import { useRoleView } from '../../utils/useRoleView';
import { WaiterOrderView } from './WaiterOrderView';
import { KitchenOrderView } from './KitchenOrderView';
import { ManagerOrderView } from './ManagerOrderView';
import { AdminOrderView } from './AdminOrderView';
import { ReceptionistOrderView } from './ReceptionistOrderView';
import { CustomerOrderView } from './CustomerOrderView';

export const OrdersPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'WAITER':       return <WaiterOrderView />;
    case 'KITCHEN':      return <KitchenOrderView />;
    case 'MANAGER':      return <ManagerOrderView />;
    case 'ADMIN':        return <AdminOrderView />;
    case 'RECEPTIONIST': return <ReceptionistOrderView />;
    case 'CUSTOMER':     return <CustomerOrderView />;
    default:             return <WaiterOrderView />;
  }
};
