import { SectionContainer } from '../../../components/public/SectionContainer';
import { FEATURES } from '../data';

export const WhyChooseUsSection = () => {
  return (
    <SectionContainer id="features">
      <div>
        <h2
          style={{
            fontSize: 42,
            textAlign: 'center',
            marginBottom: 56,
          }}
        >
          Why Choose Us
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                style={{
                  padding: 28,
                  background: 'white',
                  borderRadius: 24,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
                }}
              >
                <Icon size={36} color="#B45309" />

                <h3
                  style={{
                    marginTop: 20,
                    marginBottom: 14,
                    fontSize: 22,
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    color: '#6B7280',
                    lineHeight: 1.7,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
};