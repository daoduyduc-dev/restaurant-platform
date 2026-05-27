import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  id?: string;
};

export const SectionContainer = ({ children, id }: Props) => {
  return (
    <section
      id={id}
      style={{
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '96px 24px',
      }}
    >
      {children}
    </section>
  );
};