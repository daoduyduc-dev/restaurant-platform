import { useRoleView } from '../../utils/useRoleView';
import { ManagerLoyaltyView } from './ManagerLoyaltyView';
import { CustomerLoyaltyView } from './CustomerLoyaltyView';

export const LoyaltyPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'ADMIN':
    case 'MANAGER':
    case 'RECEPTIONIST':
      return <ManagerLoyaltyView />;
    case 'CUSTOMER':
    default:
      return <CustomerLoyaltyView />;
  }
};
