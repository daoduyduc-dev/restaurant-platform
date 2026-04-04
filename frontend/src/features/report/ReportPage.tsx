import { useRoleView } from '../../utils/useRoleView';
import { ManagerReportView } from './ManagerReportView';
import { NoAccessView } from '../../components/NoAccessView';

export const ReportPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'MANAGER':
    case 'ADMIN':
      return <ManagerReportView />;
    case 'WAITER':
    case 'RECEPTIONIST':
    case 'KITCHEN':
      return <NoAccessView message="Reports are currently restricted to management." />;
    default:
      return <NoAccessView />;
  }
};
