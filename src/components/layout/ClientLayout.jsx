import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiPhone, FiMail, FiMapPin, FiFacebook, FiGlobe } from 'react-icons/fi';

const navItems = [
  { path: '/', label: 'Trang chủ', exact: true },
  { path: '/gioi-thieu', label: 'Giới thiệu' },
  { path: '/thong-bao', label: 'Thông báo' },
  { path: '/tra-cuu', label: 'Tra cứu' },
  { path: '/dang-ky-hoc', label: 'Đăng ký học' },
  { path: '/lien-he', label: 'Liên hệ' },
];

export default function ClientLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid var(--border-color)',
        padding: '8px 0',
        fontSize: '0.78rem',
        color: 'var(--text-tertiary)',
      }}>
        <div className="client-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiPhone size={12} /> +0236 2240 741</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMail size={12} /> contact@sdc.udn.vn</span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div className="client-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src="/Logo-SDC.xanh.png" alt="SDC Logo" style={{ width: 42, height: 'auto', objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Trung tâm Phát triển Phần mềm</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Đại học Đà Nẵng</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                style={({ isActive }) => ({
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--primary-400)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                })}
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/dang-ky-thi" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>
              Đăng ký thi ngay
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="btn btn-ghost btn-icon mobile-nav-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
            style={{ display: 'none' }}
          >
            {mobileMenu ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenu && (
          <div style={{
            padding: '12px 20px 20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setMobileMenu(false)}
                style={({ isActive }) => ({
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--primary-400)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: '48px 0 24px',
      }}>
        <div className="client-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <img src="/Logo-SDC.xanh.png" alt="SDC Logo" style={{ width: 40, height: 'auto', objectFit: 'contain' }} />
                <div style={{ fontWeight: 700 }}>Trung tâm Phát triển Phần mềm</div>
              </div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                Trung tâm Phát triển Phần mềm - Đại học Đà Nẵng. Đào tạo và cấp chứng chỉ ứng dụng Công nghệ Thông tin, Ngoại ngữ theo quy định của Bộ GD&ĐT.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: 16, fontSize: '0.9rem' }}>Liên kết nhanh</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {navItems.map(item => (
                  <Link key={item.path} to={item.path} style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', transition: 'color var(--transition-fast)' }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: 16, fontSize: '0.9rem' }}>Liên hệ</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <FiMapPin size={18} style={{ color: 'var(--primary-400)', marginTop: 2, flexShrink: 0 }} />
                  Tầng 5 Khu C, 41 Lê Duẩn - Hải Châu - Đà Nẵng
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FiPhone size={14} /> +0236 2240 741
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FiMail size={14} /> contact@sdc.udn.vn
                </li>
              </ul>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: 20,
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-tertiary)',
          }}>
            © 2026 Trung tâm Phát triển Phần mềm - Đại học Đà Nẵng. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
