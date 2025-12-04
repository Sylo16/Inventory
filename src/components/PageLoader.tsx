import { DNA } from 'react-loader-spinner';

export default function PageLoader() {
  return (
    <div style={styles.overlay}>
      <DNA
        visible={true}
        height="80"
        width="80"
        ariaLabel="dna-loading"
        wrapperStyle={{}}
        wrapperClass="dna-wrapper"
        // To match your previous system theme (Red #ef4444), 
        // uncomment the lines below. Otherwise, it uses default Pink/Blue.
        // dnaColorOne="#ef4444"
        // dnaColorTwo="#fca5a5" 
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
    // Optional: add a slight background blur or dim if desired
    // backgroundColor: 'rgba(255, 255, 255, 0.8)', 
  },
};