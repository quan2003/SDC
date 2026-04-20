import { useState, useEffect } from 'react';
import { notificationsApi } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { FiBell, FiCalendar } from 'react-icons/fi';

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.getAll()
      .then(data => setNotices((data || []).filter(n => n.status === 'active')))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="client-section" style={{ paddingTop: 40 }}>
      <div className="client-container" style={{ maxWidth: 800 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
            <FiBell style={{ color: 'var(--primary-400)' }} /> Thông báo
          </h1>
        </div>
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
            <span className="loading-spinner" style={{ marginRight: 8 }} />
            Đang tải thông báo...
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!loading && notices.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
              Hiện chưa có thông báo nào.
            </div>
          )}
          {notices.map(n => (
            <div key={n.id} className="card" style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  {{ exam: 'Thi', class: 'Lớp', guide: 'Hướng dẫn', general: 'Chung' }[n.type] || n.type}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiCalendar size={12} /> {formatDate(n.date)}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{n.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
