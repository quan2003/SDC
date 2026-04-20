import { useState, useEffect } from 'react';
import { FiFileText, FiUpload, FiFilter, FiDownload, FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiMail } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate, formatCurrency, exportToExcel } from '../../../utils/helpers';
import { registrationsApi, certificatesApi, certificateClassesApi, examSessionsApi } from '../../../services/api';
import EmailModal from '../../../components/EmailModal';

const STATUS_MAP = {
  pending: { label: 'Chờ duyệt', cls: 'badge-warning' },
  confirmed: { label: 'Đã duyệt', cls: 'badge-active' },
  rejected: { label: 'Từ chối', cls: 'badge-inactive' },
};

export default function ExamRegistrationPage() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [certs, setCerts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    registrationsApi.getAll().then(res => setStudents(res || []));
    certificatesApi.getAll().then(res => setCerts(res || []));
    certificateClassesApi.getAll().then(res => setClasses(res || []));
    examSessionsApi.getAll().then(res => setSessions(res || []));
  }, []);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterCert, setFilterCert] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [emailModalData, setEmailModalData] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) setSelectedIds([]);
    else setSelectedIds(filtered.map(s => s.id));
  };

  const filtered = students.filter(s => {
    if (filterStatus && s.status !== filterStatus) return false;
    if (filterClass && String(s.classId) !== filterClass) return false;
    if (filterCert && String(s.certId) !== filterCert) return false;
    if (filterSession && String(s.examSessionId) !== filterSession) return false;
    if (search && ![s.fullName, s.code, s.cccd, s.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const updateStatus = async (id, st) => {
    try {
      const student = students.find(s => s.id === id);
      await registrationsApi.update(id, { ...student, status: st });
      setStudents(prev => prev.map(s => s.id === id ? { ...s, status: st } : s));
      toast.success('Cập nhật', `Đã ${st === 'confirmed' ? 'duyệt' : 'từ chối'} hồ sơ`);
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật trạng thái hồ sơ');
    }
  };

  const togglePayment = async (id, field) => {
    try {
      const student = students.find(s => s.id === id);
      const newValue = !student[field];
      await registrationsApi.update(id, { ...student, [field]: newValue });
      setStudents(prev => prev.map(s => {
        if (s.id === id) {
          toast.success('Thanh toán', `Đã cập nhật trạng thái ${field === 'tuitionPaid' ? 'Học phí' : 'Lệ phí'} cho ${s.fullName}`);
          return { ...s, [field]: newValue };
        }
        return s;
      }));
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật thanh toán');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await registrationsApi.delete(deleteConfirm.id);
      setStudents(prev => prev.filter(s => s.id !== deleteConfirm.id));
      toast.success('Đã xóa', '');
      setDeleteConfirm(null);
    } catch (e) {
      toast.error('Lỗi', 'Không thể xóa hồ sơ này');
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('Không có dữ liệu', 'Danh sách hiện tại đang trống, không thể xuất Excel.');
      return;
    }
    const success = exportToExcel(filtered, 'Danh_Sach_Ky_Thi');
    if (success) toast.success('Xuất file thành công', '');
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiFileText /> Danh sách đăng ký thi</h1>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={handleExport}><FiDownload size={16} /> Xuất Excel</button>
          
          <button className="btn btn-primary" onClick={() => document.getElementById('upload-ds').click()}>
            <FiUpload size={16} /> Upload DS
          </button>
          <input 
            type="file" 
            id="upload-ds" 
            style={{ display: 'none' }} 
            accept=".xlsx,.csv" 
            onChange={(e) => {
               if(e.target.files.length > 0) {
                 toast.info('Thông báo', 'Tính năng xử lý file Excel đang được cấu hình. Vui lòng nhập liệu thủ công hoặc chuyển sang trang đăng ký Online.');
                 e.target.value = null; 
               }
            }} 
          />
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng hồ sơ', value: students.length, color: 'var(--primary-400)' },
          { label: 'Chờ duyệt', value: students.filter(s => s.status === 'pending').length, color: 'var(--warning-400)' },
          { label: 'Đã duyệt', value: students.filter(s => s.status === 'confirmed').length, color: 'var(--success-400)' },
          { label: 'Đã đóng lệ phí', value: students.filter(s => s.feePaid).length, color: 'var(--accent-400)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="toolbar">
        <div className="toolbar-left" style={{ gap: 10, flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Tìm tên, mã, CCCD, SĐT..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ width: 240 }} />
          <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 180 }}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="form-select" value={filterCert} onChange={e => setFilterCert(e.target.value)} style={{ width: 180 }}>
            <option value="">Tất cả chứng chỉ</option>
            {certs.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <select className="form-select" value={filterSession} onChange={e => setFilterSession(e.target.value)} style={{ width: 180 }}>
            <option value="">Tất cả đợt thi</option>
            {sessions.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
          </select>
          <select className="form-select" value={filterClass} onChange={e => setFilterClass(e.target.value)} style={{ width: 200 }}>
            <option value="">Tất cả lớp</option>
            {classes.map(c => <option key={c.id} value={String(c.id)}>{c.code}</option>)}
          </select>
        </div>
        <div className="toolbar-right">
          {isAdmin && selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setEmailModalData(students.filter(s => selectedIds.includes(s.id)))}>
                <FiMail size={12} style={{ color: 'var(--info-500)' }} /> Gửi Email {selectedIds.length} người
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => {
                setStudents(prev => prev.filter(s => !selectedIds.includes(s.id)));
                setSelectedIds([]);
                toast.success('Đã xóa list được chọn', '');
              }}>
                <FiTrash2 size={12} /> Xóa {selectedIds.length} mục
              </button>
            </div>
          )}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginLeft: 12 }}>
            Hiển thị: <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> / {students.length}
          </span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ accentColor: 'var(--primary-500)' }} /></th>
                <th style={{ width: 44 }}>STT</th>
                <th>Mã HV</th>
                <th>Họ và tên</th>
                <th>Ngày sinh</th>
                <th>CCCD</th>
                <th>Điện thoại</th>
                <th>Lớp</th>
                <th>Chứng chỉ</th>
                <th>Đợt thi</th>
                <th>Học phí</th>
                <th>Lệ phí</th>
                <th>Trạng thái</th>
                <th style={{ width: 120, textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Không có dữ liệu</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id} className={selectedIds.includes(s.id) ? 'selected' : ''}>
                  <td><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} style={{ accentColor: 'var(--primary-500)' }} /></td>
                  <td style={{ color: 'var(--text-tertiary)' }}>{i + 1}</td>
                  <td><code style={{ color: 'var(--primary-400)' }}>{s.code}</code></td>
                  <td><strong>{s.fullName}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(s.dob)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.cccd}</td>
                  <td>{s.phone}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.className}</td>
                  <td style={{ fontSize: '0.82rem' }}>{s.certName}</td>
                  <td>
                    <select 
                      className="form-select" 
                      style={{ padding: '2px 8px', fontSize: '0.78rem', height: 'auto', minWidth: 120 }}
                      value={s.examSessionId || ''}
                      onChange={async (e) => {
                        const sid = e.target.value;
                        try {
                          await registrationsApi.update(s.id, { ...s, examSessionId: sid });
                          setStudents(prev => prev.map(item => item.id === s.id ? { ...item, examSessionId: sid } : item));
                          toast.success('Đã xếp đợt thi', s.fullName);
                        } catch (err) {
                          toast.error('Lỗi', 'Không thể xếp đợt thi');
                        }
                      }}
                    >
                      <option value="">-- Chưa xếp --</option>
                      {sessions.map(sess => (
                        <option key={sess.id} value={sess.id}>{sess.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button 
                      className="btn btn-ghost btn-sm"
                      style={{ 
                        color: s.tuitionPaid ? 'var(--success-600)' : 'var(--danger-400)',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        padding: '4px 8px',
                        background: s.tuitionPaid ? 'var(--success-50)' : 'var(--danger-50)'
                      }}
                      onClick={() => togglePayment(s.id, 'tuitionPaid')}
                    >
                      {s.tuitionPaid ? '✓ Đã đóng' : '✗ Chưa đóng'}
                    </button>
                  </td>
                  <td>
                    <button 
                      className="btn btn-ghost btn-sm"
                      style={{ 
                        color: s.feePaid ? 'var(--success-600)' : 'var(--info-600)',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        padding: '4px 8px',
                        background: s.feePaid ? 'var(--success-50)' : 'var(--info-50)'
                      }}
                      onClick={() => togglePayment(s.id, 'feePaid')}
                    >
                      {s.feePaid ? '✓ Đã đóng' : '○ Chờ thu'}
                    </button>
                  </td>
                  <td><span className={`badge ${STATUS_MAP[s.status]?.cls}`}>{STATUS_MAP[s.status]?.label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-icon-sm" title="Gửi Email" onClick={() => setEmailModalData(s)}>
                        <FiMail size={14} style={{ color: 'var(--info-400)' }} />
                      </button>
                      {s.status === 'pending' && (
                        <>
                          <button className="btn btn-ghost btn-icon-sm" title="Duyệt" onClick={() => updateStatus(s.id, 'confirmed')}>
                            <FiCheck size={14} style={{ color: 'var(--success-500)' }} />
                          </button>
                          <button className="btn btn-ghost btn-icon-sm" title="Từ chối" onClick={() => updateStatus(s.id, 'rejected')}>
                            <FiX size={14} style={{ color: 'var(--warning-400)' }} />
                          </button>
                        </>
                      )}
                      {isAdmin && (
                        <button className="btn btn-ghost btn-icon-sm" title="Xóa" onClick={() => setDeleteConfirm(s)}>
                          <FiTrash2 size={14} style={{ color: 'var(--danger-400)' }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-dialog">
                <div className="confirm-icon danger"><FiTrash2 /></div>
                <div className="confirm-title">Xác nhận xóa</div>
                <div className="confirm-message">Xóa hồ sơ <strong>{deleteConfirm.fullName}</strong>?</div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Hủy</button>
                  <button className="btn btn-danger" onClick={handleDelete}><FiTrash2 size={14} /> Xóa</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <EmailModal 
        isOpen={emailModalData !== null} 
        onClose={() => setEmailModalData(null)} 
        recipients={Array.isArray(emailModalData) ? emailModalData : (emailModalData ? [emailModalData] : [])} 
        extraData={{ 
          className: Array.isArray(emailModalData) ? 'Kỳ thi cấp chứng chỉ' : emailModalData?.certName || 'Kỳ thi cấp chứng chỉ'
        }}
      />
    </div>
  );
}
