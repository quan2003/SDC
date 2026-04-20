import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { USE_MOCK } from '../../services/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const { login, logout, loading, isAuthenticated, isStaff } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      if (isStaff) {
        navigate('/admin');
      } else {
        logout();
        setError('Tài khoản của bạn nằm ngoài hệ thống hoặc chưa được cấp quyền quản trị (Yêu cầu role admin/staff).');
      }
    }
  }, [isAuthenticated, loading, isStaff, navigate, logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    try {
      await login(email.trim(), password);
      toast.success('Đăng nhập thành công', 'Chào mừng bạn quay lại!');
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
      }} />
      <div style={{
        position: 'absolute', top: '10%', left: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06), transparent)',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05), transparent)',
        filter: 'blur(80px)',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />

      <div className="animate-fade-in-scale" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/Logo-SDC.xanh.png" alt="SDC Logo" style={{ width: 90, height: 'auto', margin: '0 auto 16px', display: 'block' }} />
          <h1 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Đăng nhập hệ thống</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
            Quản lý đào tạo - Trung tâm Phát triển Phần mềm
          </p>
        </div>

        {/* Form */}
        <div className="glass-strong" style={{ borderRadius: 'var(--radius-xl)', padding: 32, boxShadow: 'var(--shadow-xl)' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '10px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger-400)',
                fontSize: '0.85rem',
                marginBottom: 20,
                animation: 'fadeInDown 300ms ease-out',
              }}>
                {error}
              </div>
            )}

            {/* Email field */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">
                <FiMail size={14} /> Email đăng nhập
              </label>
              <input
                className="form-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                autoComplete="email"
              />
            </div>

            {/* Password field */}
            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label">
                <FiLock size={14} /> Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 42 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', color: 'var(--text-tertiary)', padding: 4, border: 'none', cursor: 'pointer',
                  }}
                >
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px 24px', fontSize: '1rem' }}
            >
              {loading
                ? <><span className="loading-spinner" /> Đang xác thực...</>
                : <><FiLogIn size={18} /> Đăng nhập</>
              }
            </button>
          </form>

          {/* Security badge */}
          <div style={{
            marginTop: 24,
            padding: '10px 16px',
            background: 'rgba(34, 197, 94, 0.06)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(34, 197, 94, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <FiShield size={16} style={{ color: 'var(--success-500)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {USE_MOCK
                ? <span style={{ color: 'var(--warning-500)' }}>⚠ Chế độ demo — chưa kết nối Supabase</span>
                : <>Kết nối bảo mật qua <strong>Supabase Auth</strong> (JWT · mã hóa bcrypt)</>
              }
            </div>
          </div>

          {/* Demo hint — only in mock mode */}
          {USE_MOCK && (
            <div style={{
              marginTop: 12,
              padding: '10px 16px',
              background: 'rgba(59, 130, 246, 0.06)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Tài khoản demo:</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Admin:</strong> admin / admin123<br />
                <strong>Staff:</strong> staff1 / staff123
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
