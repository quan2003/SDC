import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiUsers, FiCalendar, FiArrowRight, FiCheckCircle, FiGlobe, FiBookOpen, FiPhone } from 'react-icons/fi';
import { certificatesApi, notificationsApi } from '../../services/api';
import NotificationAttachmentLink from '../../components/NotificationAttachmentLink';
import { parseNotificationContent } from '../../utils/notificationAttachments';


export default function HomePage() {
  const [certificates, setCertificates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      certificatesApi.getAll(),
      notificationsApi.getAll()
    ]).then(([certData, notiData]) => {
      setCertificates((certData || []).filter(c => c.status === 'active'));
      setNotifications((notiData || []).filter(n => n.status === 'active').slice(0, 3));
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const features = [
    { icon: FiAward, title: 'Chứng chỉ CNTT', desc: 'Đào tạo và cấp chứng chỉ ứng dụng CNTT cơ bản, nâng cao theo Thông tư 03/2014', color: 'var(--client-blue)' },
    { icon: FiBookOpen, title: 'Chương trình đào tạo', desc: 'Chương trình đào tạo chất lượng, giáo viên giàu kinh nghiệm, thi sát hạch nghiêm túc', color: 'var(--client-red)' },
    { icon: FiGlobe, title: 'Đăng ký trực tuyến', desc: 'Đăng ký dự thi chứng chỉ trực tuyến, nhanh chóng, tiện lợi', color: 'var(--client-blue-2)' },
    { icon: FiCalendar, title: 'Lịch thi linh hoạt', desc: 'Tổ chức thi thường xuyên, nhiều đợt trong năm', color: 'var(--warning-500)' },
  ];

  const stats = [
    { value: '10,000+', label: 'Học viên' },
    { value: '50+', label: 'Đợt thi/năm' },
    { value: '95%', label: 'Tỉ lệ đậu' },
    { value: '15+', label: 'Năm kinh nghiệm' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="client-hero" style={{ minHeight: '80vh', padding: '120px 0 80px' }}>
        <div className="client-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div className="animate-fade-in-up">
              <div className="client-kicker" style={{ marginBottom: 20 }}>
                <FiAward size={14} /> Trung tâm Phát triển Phần mềm - Đại học Đà Nẵng
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
                Đào tạo & Cấp <span className="gradient-text">Chứng chỉ CNTT</span> Uy tín
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
                Trung tâm Phát triển Phần mềm - Đại học Đà Nẵng tổ chức đào tạo và cấp chứng chỉ ứng dụng Công nghệ Thông tin theo quy định của Bộ Giáo dục & Đào tạo.
              </p>
              <div className="client-hero-actions">
                <Link to="/dang-ky-thi" className="btn btn-primary btn-lg">
                  Đăng ký ngay <FiArrowRight size={18} />
                </Link>
                <Link to="/tra-cuu" className="btn btn-ghost btn-lg">
                  Tra cứu thông tin
                </Link>
              </div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="client-hero-visual">
                <div className="client-hero-mark">
                  <img src="/Logo-SDC.xanh.png" alt="SDC Logo" />
                </div>
                {stats.map((s, i) => (
                  <div key={i} className="client-stat-chip">
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }} className="gradient-text">{s.value}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="client-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="client-container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Tại sao chọn <span className="gradient-text">SDC</span>?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>Trung tâm Phát triển Phần mềm - Đại học Đà Nẵng là đơn vị uy tín hàng đầu</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="card client-feature-card" style={{ padding: 28, textAlign: 'center', cursor: 'default' }}>
                <div className="client-feature-icon" style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                  background: `${f.color}15`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <f.icon size={24} style={{ color: f.color }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificates */}
      <section className="client-section">
        <div className="client-container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Chứng chỉ <span className="gradient-text">đào tạo</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {loading ? (
              <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                <span className="loading-spinner"></span> Đang tải chứng chỉ...
              </div>
            ) : certificates.length === 0 && (
              <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Chưa có chứng chỉ đào tạo nào được cập nhật.</div>
            )}
            {certificates.map(cert => (
              <div key={cert.id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="client-icon-surface" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiAward size={20} style={{ color: 'var(--primary-400)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{cert.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{cert.code}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1, marginBottom: 16 }}>{cert.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {(() => {
                    const isAdvanced = (cert.name || '').toLowerCase().includes('nâng cao');

                    // Đọc cài đặt admin từ localStorage
                    let adminSettings = {};
                    try {
                      adminSettings = JSON.parse(localStorage.getItem('sdc_settings_payment') || '{}');
                    } catch {
                      // Ignore malformed local settings.
                    }
                    const defaultFee = Number(adminSettings.defaultExamFee) || 0;
                    const moduleFee  = Number(adminSettings.advancedModuleFee) || 250000;
                    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

                    if (isAdvanced) {
                      return (
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--primary-400)', fontSize: '1rem' }}>
                            {fmt(moduleFee)}đ
                            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 4 }}>/mô đun</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Word · Excel · PowerPoint</div>
                        </div>
                      );
                    }

                    // Lấy các mức phí theo đối tượng
                    const fees = [cert.fee_ud, cert.fee_outside, cert.fee_freelance].filter(f => f > 0);

                    if (fees.length === 0) {
                      // Chưa cấu hình → dùng defaultExamFee từ admin settings
                      if (defaultFee > 0) {
                        return (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--warning-400)', fontSize: '1rem' }}>{fmt(defaultFee)}đ</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Lệ phí thi</div>
                          </div>
                        );
                      }
                      return <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Liên hệ để biết giá</span>;
                    }

                    const minFee = Math.min(...fees);
                    const maxFee = Math.max(...fees);
                    return (
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--warning-400)', fontSize: '1rem' }}>
                          {minFee === maxFee ? `${fmt(minFee)}đ` : `${fmt(minFee)}đ – ${fmt(maxFee)}đ`}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Tùy đối tượng dự thi</div>
                      </div>
                    );
                  })()}
                  <Link to="/dang-ky-thi" className="btn btn-primary btn-sm">Đăng ký</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="client-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="client-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Thông báo <span className="gradient-text">mới nhất</span></h2>
            <Link to="/thong-bao" className="btn btn-ghost btn-sm">Xem tất cả <FiArrowRight size={14} /></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)' }}>Đang tải thông báo...</div>
            ) : notifications.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)' }}>Hiện chưa có thông báo mới.</div>
            )}
            {notifications.map(n => {
              const parsed = parseNotificationContent(n.content);
              return (
                <div key={n.id} className="card" style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div className="client-icon-surface" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FiCalendar size={16} style={{ color: 'var(--primary-400)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{n.title}</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{parsed.text}</p>
                    <NotificationAttachmentLink attachment={parsed.attachment} compact />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 8 }}>{n.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="client-section" style={{ textAlign: 'center' }}>
        <div className="client-container">
          <div className="glass-strong client-cta-panel">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Sẵn sàng đăng ký?</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 28px', fontSize: '1.05rem' }}>
                Đăng ký dự thi chứng chỉ ứng dụng CNTT trực tuyến ngay hôm nay!
              </p>
              <div className="client-hero-actions" style={{ justifyContent: 'center' }}>
                <Link to="/dang-ky-thi" className="btn btn-primary btn-lg">
                  <FiAward size={18} /> Đăng ký dự thi
                </Link>
                <a href="tel:02363733588" className="btn btn-ghost btn-lg">
                  <FiPhone size={18} /> Gọi ngay
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
