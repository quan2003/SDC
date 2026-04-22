import { useState, useEffect, useMemo } from 'react';
import { FiFileText, FiDownload, FiPrinter } from 'react-icons/fi';
import { registrationsApi, certificatesApi, subjectsApi } from '../../../services/api';
import { formatDate, formatCurrency } from '../../../utils/helpers';
import { printPDF } from '../../../utils/pdfGenerator';

export default function RegistrationStatsPage() {
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      registrationsApi.getAll(),
      certificatesApi.getAll(),
      subjectsApi.getAll()
    ]).then(([regs, certs, subs]) => {
      setAllData(regs || []);
      setCertificates(certs || []);
      setSubjects(subs || []);
    }).finally(() => setLoading(false));
  }, []);

  const { examRegs, courseRegs } = useMemo(() => {
    let filtered = allData;
    if (dateRange.start) filtered = filtered.filter(r => new Date(r.submittedAt) >= new Date(dateRange.start));
    if (dateRange.end) {
      const end = new Date(dateRange.end); end.setHours(23, 59, 59);
      filtered = filtered.filter(r => new Date(r.submittedAt) <= end);
    }
    return {
      examRegs: filtered.filter(r => r.type !== 'course' && r.type !== 'course_registration'),
      courseRegs: filtered.filter(r => r.type === 'course' || r.type === 'course_registration'),
    };
  }, [allData, dateRange]);

  // Nhóm đăng ký thi theo Chứng chỉ
  const examByCert = useMemo(() => {
    return certificates.map(c => {
      const match = examRegs.filter(r => String(r.certificateId) === String(c.id));
      return { name: c.name, total: match.length, approved: match.filter(r => r.status === 'approved').length, feePaid: match.filter(r => r.feePaid || r.paid).length };
    }).filter(c => c.total > 0);
  }, [examRegs, certificates]);

  // Nhóm đăng ký học theo Môn học (subjectName trong other_request)
  const courseBySubject = useMemo(() => {
    const grouped = {};
    courseRegs.forEach(r => {
      const name = r.certificateName || 'Không xác định';
      if (!grouped[name]) grouped[name] = { name, total: 0, approved: 0, paid: 0 };
      grouped[name].total++;
      if (r.status === 'approved') grouped[name].approved++;
      if (r.paid || r.tuitionPaid) grouped[name].paid++;
    });
    return Object.values(grouped);
  }, [courseRegs]);

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiFileText /> Thống kê đăng ký</h1>
        <div className="page-actions" style={{ gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.85rem' }}>
            <span>Từ:</span>
            <input type="date" className="form-input" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} style={{ width: 150 }} />
            <span>Đến:</span>
            <input type="date" className="form-input" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} style={{ width: 150 }} />
            <button className="btn btn-ghost btn-sm" onClick={() => setDateRange({ start: '', end: '' })}>Xóa lọc</button>
          </div>
        </div>
      </div>

      {/* Tổng quan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Tổng hồ sơ', value: examRegs.length + courseRegs.length, color: 'var(--primary-500)' },
          { label: 'Đăng ký thi', value: examRegs.length, color: 'var(--info-500)' },
          { label: 'Đăng ký học', value: courseRegs.length, color: 'var(--success-500)' },
          { label: 'Tổng doanh thu', value: formatCurrency([...examRegs, ...courseRegs].filter(r => r.paid || r.feePaid || r.tuitionPaid).reduce((s, r) => s + (r.fee || 0), 0)), color: 'var(--warning-500)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Đăng ký thi */}
        <div className="card">
          <h3 style={{ marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid var(--info-200)', color: 'var(--info-600)', display: 'flex', alignItems: 'center', gap: 8 }}>
            📋 Đăng ký thi — theo chứng chỉ
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Chứng chỉ</th>
                <th style={{ textAlign: 'center' }}>Tổng hồ sơ</th>
                <th style={{ textAlign: 'center' }}>Đã duyệt</th>
                <th style={{ textAlign: 'center' }}>Đã nộp LP</th>
              </tr>
            </thead>
            <tbody>
              {examByCert.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>Không có dữ liệu</td></tr>
              ) : examByCert.map((c, i) => (
                <tr key={i}>
                  <td><strong>{c.name}</strong></td>
                  <td style={{ textAlign: 'center' }}>{c.total}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-success">{c.approved}</span></td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-active">{c.feePaid}</span></td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, background: 'var(--bg-glass)' }}>
                <td>TỔNG</td>
                <td style={{ textAlign: 'center' }}>{examByCert.reduce((s, c) => s + c.total, 0)}</td>
                <td style={{ textAlign: 'center' }}>{examByCert.reduce((s, c) => s + c.approved, 0)}</td>
                <td style={{ textAlign: 'center' }}>{examByCert.reduce((s, c) => s + c.feePaid, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Đăng ký học */}
        <div className="card">
          <h3 style={{ marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid var(--success-200)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', gap: 8 }}>
            📚 Đăng ký học — theo môn học
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Môn học</th>
                <th style={{ textAlign: 'center' }}>Tổng HV</th>
                <th style={{ textAlign: 'center' }}>Đã duyệt</th>
                <th style={{ textAlign: 'center' }}>Đã nộp HP</th>
              </tr>
            </thead>
            <tbody>
              {courseBySubject.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>Không có dữ liệu</td></tr>
              ) : courseBySubject.map((s, i) => (
                <tr key={i}>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ textAlign: 'center' }}>{s.total}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-success">{s.approved}</span></td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-active">{s.paid}</span></td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, background: 'var(--bg-glass)' }}>
                <td>TỔNG</td>
                <td style={{ textAlign: 'center' }}>{courseBySubject.reduce((s, c) => s + c.total, 0)}</td>
                <td style={{ textAlign: 'center' }}>{courseBySubject.reduce((s, c) => s + c.approved, 0)}</td>
                <td style={{ textAlign: 'center' }}>{courseBySubject.reduce((s, c) => s + c.paid, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
