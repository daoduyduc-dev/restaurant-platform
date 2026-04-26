import { useRoleView } from '../../utils/useRoleView';
import { CustomerReservationView } from './CustomerReservationView';
import { ReceptionistReservationView } from './ReceptionistReservationView';

export const ReservationsPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'CUSTOMER':
      return <CustomerReservationView />;
    case 'STAFF':
    case 'ADMIN':
      return <ReceptionistReservationView />;
    default:
      return <ReceptionistReservationView />;
  }
};
