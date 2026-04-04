import { useRoleView } from '../../utils/useRoleView';
import { AdminSettingsView } from './AdminSettingsView';
import { NoAccessView } from '../../components/NoAccessView';

export const SettingsPage = () => {
  const { role } = useRoleView();

  switch (role) {
    case 'ADMIN':
    case 'MANAGER':
      return <AdminSettingsView />; // Settings currently holds both Admin and Manager views. Could filter inside if needed.
    default:
      return <NoAccessView message="System settings are restricted to administrators and venue managers." />;
  }
};
