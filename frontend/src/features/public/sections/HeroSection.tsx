import { Button } from '../../../components/ui';
import { SectionContainer } from '../../../components/public/SectionContainer';
import { useNavigate } from 'react-router-dom';
import { RESTAURANT_INFO } from '../data';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div
      id="hero"
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, rgba(180,83,9,0.85), rgba(17,24,39,0.75)), url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <SectionContainer>
        <div style={{ maxWidth: 720 }}>
          <h1
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              color: 'white',
              marginBottom: 24,
            }}
          >
            {RESTAURANT_INFO.name}
          </h1>

          <p
            style={{
              fontSize: 22,
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            {RESTAURANT_INFO.tagline}
          </p>

          <div style={{ display: 'flex', gap: 16 }}>
            <Button
              variant="primary"
              size="large"
              onClick={() => navigate('/reserve')}
            >
              Reserve a Table
            </Button>

            <Button
              variant="secondary"
              size="large"
              onClick={() =>
                document.getElementById('about')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }
            >
              Learn More
            </Button>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
};
