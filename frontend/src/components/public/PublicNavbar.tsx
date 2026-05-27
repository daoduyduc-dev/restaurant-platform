import { useNavigate } from 'react-router-dom';
import { Button } from '../ui';

const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

export const PublicNavbar = () => {
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        background: 'rgba(250,247,242,0.92)',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#B45309',
            cursor: 'pointer',
          }}
          onClick={() => scrollToSection('hero')}
        >
          ServeGenius
        </div>

        <nav
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <button onClick={() => scrollToSection('about')} style={navBtn}>
            About
          </button>

          <button onClick={() => scrollToSection('features')} style={navBtn}>
            Features
          </button>

          <button onClick={() => scrollToSection('cta')} style={navBtn}>
            Reservation
          </button>

          <Button variant="ghost" onClick={() => navigate('/login')}>
            Login
          </Button>

          <Button variant="primary" onClick={() => navigate('/tables')}>
            Reserve Now
          </Button>
        </nav>
      </div>
    </header>
  );
};

const navBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 600,
  color: '#374151',
};