import { useState, useEffect } from 'react';
import { FiFileText, FiUpload, FiFilter, FiDownload, FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiMail, FiCheckCircle } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDate, formatCurrency, exportToExcel } from '../../../utils/helpers';
import { registrationsApi, certificatesApi, certificateClassesApi, examSessionsApi, examRoomsApi } from '../../../services/api';
import EmailModal from '../../../components/EmailModal';
import PageLoader from '../../../components/PageLoader';

const STATUS_MAP = {
  pending: { label: 'Chờ duyệt', cls: 'badge-warning' },
  approved: { label: 'Đã duyệt', cls: 'badge-active' },
  rejected: { label: 'Từ chối', cls: 'badge-inactive' },
};

export default function ExamRegistrationPage() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [certs, setCerts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    Promise.all([
      registrationsApi.getAll(),
      certificatesApi.getAll(),
      certificateClassesApi.getAll(),
      examSessionsApi.getAll(),
      examRoomsApi.getAll()
    ]).then(([regs, certsRes, clsRes, sessRes, roomsRes]) => {
      setStudents((regs || []).filter(r => r.type !== 'course' && r.type !== 'course_registration'));
      setCerts(certsRes || []);
      setClasses(clsRes || []);
      setSessions(sessRes || []);
      setRooms(roomsRes || []);
    }).finally(() => setLoading(false));
  }, []);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterCert, setFilterCert] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [emailModalData, setEmailModalData] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) setSelectedIds([]);
    else setSelectedIds(filtered.map(s => s.id));
  };

  const handleAutoAssign = async () => {
    const examRegs = filtered.filter(s => 
      (!filterSession || String(s.examSessionId) === String(filterSession)) 
      && s.examSessionId 
      && !s.examRoomId 
      && s.status === 'approved'
    );
    
    if(examRegs.length === 0) return toast.info('Không có', 'Không có hồ sơ hợp lệ (đã duyệt & chưa xếp phòng) để tự động xếp.');
    
    const assignedCounts = {};
    students.forEach(s => {
        if(s.examRoomId) assignedCounts[s.examRoomId] = (assignedCounts[s.examRoomId] || 0) + 1;
    });
    
    const sessionsToProcess = filterSession ? [filterSession] : [...new Set(examRegs.map(r => String(r.examSessionId)))];
    const toUpdate = [];
    let skippedCount = 0;
    
    for (let sid of sessionsToProcess) {
      const sessionRegs = examRegs.filter(s => String(s.examSessionId) === String(sid));
      const validRooms = rooms.filter(r => String(r.session_id) === String(sid));
      
      for(let s of sessionRegs) {
         if (!s.feePaid) {
            skippedCount++;
            continue;
         }
         for(let r of validRooms) {
            let cap = 40;
            try { cap = JSON.parse(r.supervisor || '{}').capacity || 40; } catch {}
            const cur = assignedCounts[r.id] || 0;
            if(cur < cap) {
                assignedCounts[r.id] = cur + 1;
                toUpdate.push({...s, examRoomId: String(r.id)});
                break;
            }
         }
      }
    }
    
    if(toUpdate.length > 0) {
      for(let s of toUpdate) {
          await registrationsApi.update(s.id, { ...s, examRoomId: s.examRoomId });
      }
      setStudents(prev => prev.map(s => toUpdate.find(u => u.id === s.id) ? { ...s, examRoomId: toUpdate.find(u => u.id === s.id).examRoomId } : s));
      let msg = `Đã xếp phòng cho ${toUpdate.length} hồ sơ.`;
      if (skippedCount > 0) msg += ` (Đã bỏ qua ${skippedCount} hồ sơ chưa nộp lệ phí)`;
      toast.success('Xếp phòng xong', msg);
    } else {
      if (skippedCount > 0) {
        toast.warning('Cảnh báo', `Không có hồ sơ nào được xếp phòng do ${skippedCount} hồ sơ chưa nộp lệ phí.`);
      } else {
        toast.warning('Hết chỗ', 'Các phòng thi trong đợt này đã đầy, vui lòng thêm phòng thi!');
      }
    }
  };

  const filtered = students.filter(s => {
    if (filterStatus && s.status !== filterStatus) return false;
    if (filterSession && String(s.examSessionId) !== filterSession) return false;
    if (search && ![s.fullName, s.code, s.cccd, s.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const updateStatus = async (id, st) => {
    try {
      const student = students.find(s => s.id === id);
      await registrationsApi.update(id, { ...student, status: st });
      setStudents(prev => prev.map(s => s.id === id ? { ...s, status: st } : s));
      toast.success('Cập nhật', `Đã ${st === 'approved' ? 'duyệt' : 'từ chối'} hồ sơ`);
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

  const handleConfirmPayment = async () => {
    if (!payModal) return;
    try {
      await registrationsApi.update(payModal.id, { ...payModal, feePaid: true });
      setStudents(prev => prev.map(s => s.id === payModal.id ? { ...s, feePaid: true } : s));
      toast.success('Thanh toán', `Đã ghi nhận nộp lệ phí thi cho ${payModal.fullName}`);
      setPayModal(null);
    } catch (e) {
      toast.error('Lỗi', 'Không thể xác nhận thanh toán');
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

  if (loading) return <PageLoader loading />;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiFileText /> Danh sách đăng ký thi</h1>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={handleExport}><FiDownload size={16} /> Xuất Excel</button>
          
          <button className="btn btn-primary" onClick={handleAutoAssign}>
            Tự động xếp phòng
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
          { label: 'Đã duyệt', value: students.filter(s => s.status === 'approved').length, color: 'var(--success-400)' },
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
          <select className="form-select" value={filterSession} onChange={e => setFilterSession(e.target.value)} style={{ width: 180 }}>
            <option value="">Tất cả đợt thi</option>
            {sessions.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
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
                <th>Đợt thi</th>
                <th>Phòng thi / Giờ thi</th>
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
                  <td>
                    <select 
                      className="form-select" 
                      style={{ padding: '2px 8px', fontSize: '0.78rem', height: 'auto', minWidth: 120 }}
                      value={s.examSessionId || ''}
                      onChange={async (e) => {
                        const sid = e.target.value ? Number(e.target.value) : null;
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
                    <select 
                      className="form-select" 
                      style={{ padding: '2px 8px', fontSize: '0.78rem', height: 'auto', minWidth: 120 }}
                      value={s.examRoomId || ''}
                      onChange={async (e) => {
                        const rid = e.target.value || null;
                        try {
                          await registrationsApi.update(s.id, { ...s, examRoomId: rid });
                          setStudents(prev => prev.map(item => item.id === s.id ? { ...item, examRoomId: rid } : item));
                          toast.success('Đã xếp phòng', s.fullName);
                        } catch (err) {
                          toast.error('Lỗi', 'Không thể xếp phòng');
                        }
                      }}
                    >
                      <option value="">-- Chưa xếp --</option>
                      {rooms.filter(r => String(r.session_id) === String(s.examSessionId)).map(room => {
                        let name = 'Phòng';
                        try { name = JSON.parse(room.supervisor || '{}').roomName || 'Phòng'; } catch {}
                        return (
                          <option key={room.id} value={String(room.id)}>{name} ({room.shift})</option>
                        );
                      })}
                    </select>
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
                      onClick={() => s.feePaid ? togglePayment(s.id, 'feePaid') : setPayModal(s)}
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
                          <button className="btn btn-ghost btn-icon-sm" title="Duyệt" onClick={() => updateStatus(s.id, 'approved')}>
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

      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: '30px 40px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: 24, border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 12 }}>{payModal.fullName}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div>CCCD: <strong>{payModal.cccd}</strong></div>
                  <div>SĐT: <strong>{payModal.phone}</strong></div>
                  <div style={{ gridColumn: 'span 2' }}>Chứng chỉ: <strong>{payModal.certificateName}</strong></div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(34,197,94,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Số tiền học phí</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success-600)' }}>
                  {formatCurrency(payModal.fee || certs.find(c => String(c.id) === String(payModal.certificateId))?.fee || 0)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <div style={{ width: 220, background: 'white', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <img
                    src={`https://img.vietqr.io/image/970418-5601274934-compact.png?amount=${payModal.fee || certs.find(c => String(c.id) === String(payModal.certificateId))?.fee || 0}&addInfo=${encodeURIComponent(`SDC - ${payModal.fullName} - LPTCB ${sessions.find(s => String(s.id) === String(payModal.examSessionId))?.name || ''}`)}&accountName=TT PT PHAN MEM DAI HOC DA NANG`}
                    alt="QR thanh toán"
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center', margin: 0 }}>
                Nhấn <strong>Xác nhận đã thu</strong> sau khi kiểm tra học viên đã chuyển khoản thành công.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPayModal(null)}>Hủy</button>
              <button className="btn btn-primary" style={{ background: 'var(--success-500)' }} onClick={handleConfirmPayment}>
                <FiCheckCircle size={16} /> Xác nhận đã thu tiền
              </button>
            </div>
          </div>
        </div>
      )}

      <EmailModal 
        isOpen={emailModalData !== null} 
        onClose={() => setEmailModalData(null)} 
        recipients={Array.isArray(emailModalData) ? emailModalData : (emailModalData ? [emailModalData] : [])} 
        extraData={{ 
          context: 'exam',
          className: Array.isArray(emailModalData) ? 'Kỳ thi cấp chứng chỉ' : emailModalData?.certName || 'Kỳ thi cấp chứng chỉ'
        }}
      />
    </div>
  );
}
