/**
 * Tools listing page streaming loading UI
 * 
 * Shown while app/tools/page.tsx loads (search params, category filter state).
 */
export default function ToolsLoading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        @keyframes tlShimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .tl-sk {
          background: linear-gradient(
            90deg,
            var(--glass-bg) 20%,
            rgba(0, 161, 155, 0.05) 50%,
            var(--glass-bg) 80%
          );
          background-size: 1200px 100%;
          animation: tlShimmer 1.5s ease-in-out infinite;
          border-radius: 10px;
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <div className="tl-sk" style={{ width: '40px', height: '14px' }} />
        <div className="tl-sk" style={{ width: '80px', height: '14px' }} />
      </div>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div className="tl-sk" style={{ width: '340px', height: '38px', marginBottom: '12px' }} />
        <div className="tl-sk" style={{ width: '500px', height: '18px' }} />
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div className="tl-sk" style={{ width: '360px', height: '46px', borderRadius: '25px' }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="tl-sk" style={{ width: '90px', height: '38px', borderRadius: '20px' }} />
        ))}
      </div>

      {/* Tool grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="tl-sk"
            style={{ height: '72px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}
          />
        ))}
      </div>
    </div>
  );
}
