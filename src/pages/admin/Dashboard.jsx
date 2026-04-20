import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiAward, FiLayers, FiFileText, FiTrendingUp, FiDollarSign, FiCalendar, FiBarChart2, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { registrationsApi, certificatesApi, certificateClassesApi } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import { useToast } from '../../contexts/ToastContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [regs, certs, cls] = await Promise.all([
          registrationsApi.getAll(),
          certificatesApi.getAll(),
          certificateClassesApi.getAll()
        ]);
        setRegistrations(regs || []);
        setCertificates(certs || []);
        setClasses(cls || []);
      } catch (err) {
        console.error('Error loading dashboard data', err);
        toast.error('Lỗi', 'Không thể tải dữ liệu tổng quan');
      }
    }
    loadData();
  }, []);

  const recentRegistrations = registrations.slice(0, 5);
  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiBarChart2 /> Dashboard
          </h1>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 4, fontSize: '0.9rem' }}>
            Tổng quan hệ thống quản lý đào tạo
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ animationDelay: `0ms` }}>
          <div className={`stat-icon blue`}>
            <FiUsers />
          </div>
          <div className="stat-info">
            <div className="stat-label">Tổng hồ sơ (All-time)</div>
            <div className="stat-value">{registrations.length}</div>
            <div className={`stat-change up`}>
              <FiArrowUpRight size={14} /> Hồ sơ luỹ kế
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ animationDelay: `100ms` }}>
          <div className={`stat-icon purple`}>
            <FiAward />
          </div>
          <div className="stat-info">
            <div className="stat-label">Số chứng chỉ cấp phép</div>
            <div className="stat-value">{certificates.length}</div>
            <div className={`stat-change up`}>
              <FiArrowUpRight size={14} /> Chứng chỉ
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ animationDelay: `200ms` }}>
          <div className={`stat-icon green`}>
            <FiFileText />
          </div>
          <div className="stat-info">
            <div className="stat-label">Chờ xác nhận (Pending)</div>
            <div className="stat-value">{registrations.filter(r => r.status === 'pending').length}</div>
            <div className={`stat-change up`}>
              <FiArrowUpRight size={14} /> Chú ý xử lý
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ animationDelay: `300ms` }}>
          <div className={`stat-icon orange`}>
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <div className="stat-label">Hồ sơ đã thanh toán</div>
            <div className="stat-value">{registrations.filter(r => r.paid).length}</div>
            <div className={`stat-change up`}>
              <FiArrowUpRight size={14} /> Đã thu
            </div>
          </div>
        </div>
      </div>

      {/* Grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent registrations */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">
              <div className="icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary-400)' }}>
                <FiFileText />
              </div>
              Đăng ký mới gần đây
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/online-registration')}>Xem tất cả</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Chứng chỉ</th>
                  <th>Trường</th>
                  <th>Ngày đăng ký</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.length === 0 ? (
                  <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px'}}>Chưa có đăng ký nào</td></tr>
                ) : recentRegistrations.map(reg => (
                  <tr key={reg.id}>
                    <td style={{ fontWeight: 500 }}>{reg.fullName}</td>
                    <td>{reg.certificateName}</td>
                    <td>{reg.school}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{reg.submittedAt ? formatDateTime(reg.submittedAt) : ''}</td>
                    <td>
                      <span className={`badge ${reg.status === 'approved' ? 'badge-active' : 'badge-pending'}`}>
                        {reg.status === 'approved' ? 'Đã xác nhận' : 'Chờ xử lý'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Classes summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <div className="icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-400)' }}>
                <FiLayers />
              </div>
              Lớp đang hoạt động
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {classes.filter(c => c.status === 'active').map(cls => (
              <div key={cls.id} style={{
                padding: '14px 16px',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cls.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Mã: {cls.code}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{cls.currentStudents}/{cls.maxStudents}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>học viên</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <div className="icon" style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--success-400)' }}>
                <FiAward />
              </div>
              Chứng chỉ đào tạo
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {certificates.length === 0 ? (
              <div style={{color: 'var(--text-tertiary)'}}>Chưa có chứng chỉ nào</div>
            ) : certificates.slice(0, 5).map(cert => (
              <div key={cert.id} style={{
                padding: '14px 16px',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cert.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{cert.code}</div>
                </div>
                <span className={`badge ${cert.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                  {cert.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
