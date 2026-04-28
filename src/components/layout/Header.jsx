import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiBell, FiUser, FiLogOut, FiChevronDown, FiSearch, FiMoon, FiSun } from 'react-icons/fi';

export default function Header() {
  const { user, profile, displayName, role, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <header className="admin-header" style={{
      height: 'var(--header-height)',
      background: 'var(--bg-header)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Search */}
      <div className="search-bar admin-search" style={{ flex: 1, maxWidth: 400 }}>
        <FiSearch className="search-icon" />
        <input className="form-input" placeholder="Tìm kiếm..." style={{ paddingLeft: 42, background: 'var(--bg-glass)' }} />
      </div>

      {/* Right side */}
      <div className="admin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Notifications */}
        <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
          <FiBell size={18} />
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--danger-500)',
          }} />
        </button>

        {/* User dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="admin-user-button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: dropdownOpen ? 'var(--bg-glass)' : 'transparent',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast)',
              border: '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '0.8rem', fontWeight: 700,
            }}>
              {displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="admin-user-info" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{displayName || 'User'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                {role === 'admin' ? 'Quản trị viên' : role === 'staff' ? 'Nhân viên' : 'Viewer'}
              </div>
            </div>
            <FiChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu" style={{ minWidth: 200 }}>
              <button className="dropdown-item" onClick={() => { setProfileModalOpen(true); setDropdownOpen(false); }}>
                <FiUser size={15} /> Thông tin cá nhân
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={logout}>
                <FiLogOut size={15} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

      {/* Profile Modal */}
      {profileModalOpen && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 450, padding: 32, position: 'relative', animation: 'scaleIn 0.2s ease-out' }}>
            <button
               onClick={() => setProfileModalOpen(false)}
               style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiUser /> Thông tin cá nhân
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Họ và tên</label>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{displayName}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Email đăng nhập</label>
                <div style={{ fontSize: '0.95rem' }}>{user?.email || 'Chưa có email'}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Số điện thoại</label>
                <div style={{ fontSize: '0.95rem' }}>{profile?.phone || 'Chưa cập nhật'}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Vai trò phân quyền</label>
                <div style={{ display: 'inline-block', marginTop: 4 }}>
                  <span className="badge badge-primary">{role === 'admin' ? 'Quản trị viên toàn quyền' : role === 'staff' ? 'Nhân viên hệ thống' : 'Người dùng (Bị giới hạn)'}</span>
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Trạng thái tài khoản</label>
                <div style={{ display: 'inline-block', marginTop: 4 }}>
                  <span className={`badge ${profile?.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                    {profile?.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa / Vô hiệu hóa'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setProfileModalOpen(false)}>Đóng lại</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
