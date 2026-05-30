import { useRoleView } from '../../utils/useRoleView';
import { StaffLoyaltyView } from './StaffLoyaltyView';
import { CustomerLoyaltyView } from './CustomerLoyaltyView';


export const LoyaltyPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'ADMIN':
    case 'STAFF':
      return <StaffLoyaltyView />;
    case 'CUSTOMER':
    default:
      return <CustomerLoyaltyView />;
  }
};
