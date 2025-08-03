// src/components/PageLoader.tsx
import { Trefoil } from 'ldrs/react';
import 'ldrs/react/Trefoil.css';

export default function PageLoader() {
  return (
    <div style={styles.overlay}>
      <Trefoil
        size={80}
        stroke={4}
        strokeLength={0.15}
        bgOpacity={0.1}
        speed={1.4}
        color="#ef4444"
      />
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
};
