import React from 'react';

interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'bento';
  count?: number;
}

export const ReusableLoading: React.FC<LoadingProps> = ({
  type = 'spinner',
  count = 3
}) => {
  if (type === 'skeleton') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', padding: '10px 0' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '60px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, rgba(0,0,0,0.02) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.02) 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading-pulse 1.5s infinite',
              width: '100%'
            }}
          />
        ))}
        <style jsx>{`
          @keyframes loading-pulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (type === 'bento') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', width: '100%' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              height: '200px',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              background: 'linear-gradient(90deg, rgba(0,0,0,0.02) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.02) 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading-pulse 1.5s infinite'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', width: '100%' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--glass-border)',
          borderTopColor: 'var(--primary-color)',
          borderRadius: '50%',
          animation: 'loading-spin 0.8s linear infinite'
        }}
      />
      <style jsx>{`
        @keyframes loading-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
export default ReusableLoading;
