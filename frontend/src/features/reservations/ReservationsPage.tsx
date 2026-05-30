import { useRoleView } from '../../utils/useRoleView';
import { CustomerReservationView } from './CustomerReservationView';
import { StaffReservationView } from './StaffReservationView';


export const ReservationsPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'CUSTOMER':
      return <CustomerReservationView />;
    case 'STAFF':
    case 'ADMIN':
      return <StaffReservationView />;
    default:
      return <StaffReservationView />;
  }
};
