import { Button } from '../../../components/ui';
import { SectionContainer } from '../../../components/public/SectionContainer';
import { useNavigate } from 'react-router-dom';

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <SectionContainer id="cta">
      <div
        style={{
          padding: 64,
          borderRadius: 32,
          background: 'linear-gradient(135deg, #B45309, #92400E)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 42,
            color: 'white',
            marginBottom: 20,
          }}
        >
          Ready for an unforgettable dining experience?
        </h2>

        <p
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 18,
            marginBottom: 32,
          }}
        >
          Reserve your table now in just a few clicks.
        </p>

        <Button variant="secondary" size="large" onClick={() => navigate('/tables')}>
          Book Now
        </Button>
      </div>
    </SectionContainer>
  );
};