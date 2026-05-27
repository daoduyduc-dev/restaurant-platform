import { SectionContainer } from '../../../components/public/SectionContainer';
import { RESTAURANT_INFO } from '../data';

export const AboutSection = () => {
  return (
    <SectionContainer id="about">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 42,
              color: '#111827',
              marginBottom: 20,
            }}
          >
            About Our Restaurant
          </h2>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: '#4B5563',
            }}
          >
            {RESTAURANT_INFO.description}
            {' '}
            From elegant interiors to signature culinary creations,
            every detail is designed to create unforgettable dining moments.
          </p>
        </div>

        <img
          src="https://images.unsplash.com/photo-1552566626-52f8b828add9"
          alt="restaurant"
          style={{
            width: '100%',
            borderRadius: 24,
            objectFit: 'cover',
            minHeight: 500,
          }}
        />
      </div>
    </SectionContainer>
  );
};