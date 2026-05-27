import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { TablesPage } from '../tables/TablesPage';

export const PublicReservationPage = () => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF7F2',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(250,247,242,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: '#111827',
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={18} />
            {t('public.backToRestaurant')}
          </Link>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: '#B45309',
              fontWeight: 700,
            }}
          >
            <CalendarCheck size={20} />
            {t('public.tableReservation')}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={i18n.language}
              onChange={(event) => void i18n.changeLanguage(event.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                background: '#fff',
              }}
            >
              <option value="vi">VI</option>
              <option value="en">EN</option>
            </select>

            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                color: '#B45309',
                fontWeight: 600,
              }}
            >
              {t('public.login')}
            </Link>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        <TablesPage />
      </main>
    </div>
  );
};
