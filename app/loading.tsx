/**
 * Root-level streaming loading UI
 * 
 * Next.js App Router automatically shows this while the root page
 * or any non-nested route is loading. Enables React Streaming.
 */
export default function RootLoading() {
  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '10px 24px 60px',
      }}
    >
      <style>{`
        @keyframes rootShimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .root-sk {
          background: linear-gradient(
            90deg,
            var(--glass-bg) 20%,
            rgba(0, 161, 155, 0.05) 50%,
            var(--glass-bg) 80%
          );
          background-size: 1200px 100%;
          animation: rootShimmer 1.5s ease-in-out infinite;
          border-radius: 10px;
        }
      `}</style>

      {/* Hero section skeleton */}
      <section style={{ textAlign: 'center', padding: '60px 0 40px' }}>
        <div className="root-sk" style={{ width: '160px', height: '28px', margin: '0 auto 20px', borderRadius: '50px' }} />
        <div className="root-sk" style={{ width: '70%', height: '56px', margin: '0 auto 16px', borderRadius: '12px' }} />
        <div className="root-sk" style={{ width: '55%', height: '56px', margin: '0 auto 24px', borderRadius: '12px' }} />
        <div className="root-sk" style={{ width: '45%', height: '18px', margin: '0 auto 35px', borderRadius: '8px' }} />
        <div className="root-sk" style={{ width: '100%', maxWidth: '600px', height: '58px', margin: '0 auto', borderRadius: '16px' }} />
      </section>

      {/* Stats grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '50px' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="root-sk"
            style={{ height: '80px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}
          />
        ))}
      </div>

      {/* Section heading + tool grid skeleton */}
      <div className="root-sk" style={{ width: '200px', height: '24px', marginBottom: '20px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px', marginBottom: '50px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="root-sk"
            style={{ height: '70px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}
          />
        ))}
      </div>

      {/* Category bento skeleton */}
      <div className="root-sk" style={{ width: '220px', height: '24px', marginBottom: '20px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="root-sk"
            style={{ height: '200px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}
          />
        ))}
      </div>
    </div>
  );
}
