/**
 * PageLoader - Hiển thị skeleton loading khi trang đang tải dữ liệu
 * Dùng: <PageLoader loading={loading}> ... nội dung ... </PageLoader>
 * Hoặc standalone: <PageLoader loading={loading} fullPage />
 */
export default function PageLoader({ loading, children, rows = 6, fullPage = false }) {
  if (!loading) return children ?? null;

  if (fullPage) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 320, gap: 16, color: 'var(--text-tertiary)'
      }}>
        <div style={{
          width: 48, height: 48, border: '4px solid var(--border-color)',
          borderTop: '4px solid var(--primary-500)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '0.9rem' }}>Đang tải dữ liệu...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Skeleton rows
  return (
    <div style={{ padding: 8 }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-bar {
          height: 14px;
          border-radius: 6px;
          background: linear-gradient(90deg, var(--border-color) 25%, var(--bg-glass) 50%, var(--border-color) 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
      `}</style>

      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="skeleton-bar" style={{ width: 200, height: 22 }} />
        <div className="skeleton-bar" style={{ width: 110, height: 34, borderRadius: 8 }} />
      </div>

      {/* Toolbar skeleton */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="skeleton-bar" style={{ width: 260, height: 38, borderRadius: 8 }} />
        <div className="skeleton-bar" style={{ width: 140, height: 38, borderRadius: 8 }} />
      </div>

      {/* Table skeleton */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 1fr 1fr 1fr 100px', gap: 16, padding: '12px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-glass)' }}>
          {[44, '100%', '80%', '60%', '70%', 60].map((w, i) => (
            <div key={i} className="skeleton-bar" style={{ width: typeof w === 'string' ? w : w, height: 12 }} />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: 'grid', gridTemplateColumns: '44px 1fr 1fr 1fr 1fr 100px',
              gap: 16, padding: '14px 16px',
              borderBottom: rowIdx < rows - 1 ? '1px solid var(--border-color)' : 'none',
              opacity: 1 - rowIdx * 0.12
            }}
          >
            {[24, '85%', '70%', '55%', '65%', 70].map((w, i) => (
              <div key={i} className="skeleton-bar" style={{ width: typeof w === 'string' ? w : w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
