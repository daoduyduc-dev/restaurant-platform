import { useRoleView } from '../../utils/useRoleView';
import { CustomerPaymentView } from './CustomerPaymentView';
import { StaffPaymentView } from './StaffPaymentView';

export const PaymentPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'CUSTOMER':
      return <CustomerPaymentView />;
    case 'STAFF':
    case 'ADMIN':
      return <StaffPaymentView />;
    default:
      return <StaffPaymentView />;
  }
};
