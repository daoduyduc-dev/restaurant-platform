import { useRoleView } from '../../utils/useRoleView';
import { AdminSettingsView } from './AdminSettingsView';
import { NoAccessView } from '../../components/NoAccessView';
import { useTranslation } from 'react-i18next';

export const SettingsPage = () => {
  const { role } = useRoleView();
  const { t } = useTranslation();

  switch (role) {
    case 'ADMIN':
      return <AdminSettingsView />;
    default:
      return <NoAccessView message={`${t('nav.settings')} chỉ dành cho quản trị viên.`} />;
  }
};
