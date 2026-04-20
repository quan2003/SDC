import { useState, useEffect } from 'react';
import { FiDollarSign, FiFilter, FiDownload, FiCheck, FiX, FiPrinter } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { formatDate, formatCurrency, exportToExcel } from '../../../utils/helpers';
import { printPDF, generateReceiptHTML } from '../../../utils/pdfGenerator';
import { registrationsApi, certificatesApi, certificateClassesApi, examSessionsApi } from '../../../services/api';

export default function ExamPaidListPage() {
  const toast = useToast();
  const [filterCert, setFilterCert] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterPaid, setFilterPaid] = useState('');
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState([]);
  const [certs, setCerts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    Promise.all([
      registrationsApi.getAll(),
      certificatesApi.getAll(),
      certificateClassesApi.getAll(),
      examSessionsApi.getAll()
    ]).then(([resStudents, resCerts, resClasses, resSessions]) => {
      setStudents(resStudents || []);
      setCerts(resCerts || []);
      setClasses(resClasses || []);
      setSessions(resSessions || []);
    });
  }, []);

  const studentsWithSession = students.map(s => {
    const session = sessions.find(sess => String(sess.id) === String(s.examSessionId));
    return { ...s, examSessionName: session ? session.name : '...' };
  });

  const filtered = students.filter(s => {
    if (filterCert && String(s.certId) !== filterCert) return false;
    if (filterClass && String(s.classId) !== filterClass) return false;
    if (filterPaid === 'paid' && !s.feePaid) return false;
    if (filterPaid === 'unpaid' && s.feePaid) return false;
    if (search && ![s.fullName, s.code, s.cccd].some(v => v?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('Không có dữ liệu', 'Danh sách hiện tại đang trống, không thể xuất Excel.');
      return;
    }
    const success = exportToExcel(filtered, 'DanhSach_DaDongLePhi');
    if (success) toast.success('Xuất file thành công', '');
  };

  const handlePrint = () => {
    if (filtered.length === 0) {
      toast.error('Không có dữ liệu', 'Không có thí sinh nào để in danh sách.');
      return;
    }
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center;">DANH SÁCH THÍ SINH ĐÃ ĐÓNG LỆ PHÍ</h2>
        <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã HV</th>
              <th>Họ và tên</th>
              <th>Ngày sinh</th>
              <th>CCCD</th>
              <th>Lớp</th>
              <th>Chứng chỉ</th>
              <th>Lệ phí</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((s, i) => `
              <tr>
                <td align="center">${i + 1}</td>
                <td>${s.code}</td>
                <td>${s.fullName}</td>
                <td>${formatDate(s.dob)}</td>
                <td>${s.cccd}</td>
                <td>${s.className}</td>
                <td>${s.certName}</td>
                <td align="right">${formatCurrency(s.fee)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    printPDF(html);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiDollarSign /> DS đã đóng lệ phí thi</h1>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={handlePrint}><FiPrinter size={16} /> In DS</button>
          <button className="btn btn-ghost" onClick={handleExport}><FiDownload size={16} /> Xuất Excel</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng thí sinh', value: students.length, color: 'var(--primary-400)' },
          { label: 'Đã đóng lệ phí', value: students.filter(s => s.feePaid).length, color: 'var(--success-400)' },
          { label: 'Chưa đóng', value: students.filter(s => !s.feePaid).length, color: 'var(--danger-400)' },
          { label: 'Tổng thu', value: formatCurrency(students.filter(s => s.feePaid).reduce((sum, s) => sum + s.fee, 0)), color: 'var(--accent-400)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="toolbar">
        <div className="toolbar-left" style={{ gap: 10, flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Tìm tên, mã HV, CCCD..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 230 }} />
          <select className="form-select" value={filterPaid} onChange={e => setFilterPaid(e.target.value)} style={{ width: 160 }}>
            <option value="">Tất cả trạng thái</option>
            <option value="paid">Đã đóng lệ phí</option>
            <option value="unpaid">Chưa đóng lệ phí</option>
          </select>
          <select className="form-select" value={filterCert} onChange={e => setFilterCert(e.target.value)} style={{ width: 200 }}>
            <option value="">Tất cả chứng chỉ</option>
            {certs.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <select className="form-select" value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ width: 200 }}>
            <option value="">Tất cả lớp</option>
            {classes.map(c => <option key={c.id} value={String(c.id)}>{c.code}</option>)}
          </select>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> / {students.length}
          </span>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>STT</th>
                <th>Mã HV</th>
                <th>Họ và tên</th>
                <th>Ngày sinh</th>
                <th>CCCD</th>
                <th>Lớp</th>
                <th>Chứng chỉ</th>
                <th>Lệ phí</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Phiếu thu</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Không có dữ liệu</td></tr>
              ) : filtered.map((s, i) => {
                const session = sessions.find(sess => String(sess.id) === String(s.examSessionId));
                const studentData = { ...s, examSessionName: session ? session.name : '...' };
                return (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-tertiary)' }}>{i + 1}</td>
                  <td><code style={{ color: 'var(--primary-400)' }}>{s.code}</code></td>
                  <td><strong>{s.fullName}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(s.dob)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.cccd}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.className}</td>
                  <td style={{ fontSize: '0.82rem' }}>{s.certName}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(s.fee)}</td>
                  <td>
                    {s.feePaid ? (
                      <span className="badge badge-success"><FiCheck size={11} /> Đã đóng</span>
                    ) : (
                      <span className="badge badge-warning"><FiX size={11} /> Chưa đóng</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-ghost btn-icon-sm" title="In phiếu thu" onClick={async () => {
                      if (!s.feePaid) {
                        try {
                          await registrationsApi.update(s.id, { ...s, feePaid: true });
                          setStudents(prev => prev.map(item => item.id === s.id ? { ...item, feePaid: true } : item));
                        } catch (e) {
                          toast.error('Lỗi', 'Không thể cập nhật thanh toán');
                        }
                      }
                      const html = generateReceiptHTML(studentData);
                      printPDF(html);
                    }}>
                      <FiPrinter size={13} style={{ color: 'var(--primary-400)' }} />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
