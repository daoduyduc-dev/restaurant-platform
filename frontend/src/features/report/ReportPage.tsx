import { useRoleView } from '../../utils/useRoleView';
import { AdminReportView } from './AdminReportView';
import { NoAccessView } from '../../components/NoAccessView';


export const ReportPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'ADMIN':
      return <AdminReportView />;
    case 'STAFF':
      return <NoAccessView message="Reports are currently restricted to management." />;
    default:
      return <NoAccessView />;
  }
};
