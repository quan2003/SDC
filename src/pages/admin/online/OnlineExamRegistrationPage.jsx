import { useState, useMemo, useEffect } from 'react';
import { FiEdit3, FiSearch, FiCheck, FiEye, FiPrinter, FiDownload, FiX, FiTrash2, FiChevronLeft, FiChevronRight, FiClock, FiAlertCircle, FiEdit2, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { sendRealEmail } from '../../../utils/mailer';
import { formatCurrency, formatDateTime, paginate, exportToExcel, formatDate } from '../../../utils/helpers';
import { registrationsApi, certificatesApi } from '../../../services/api';
import { generateReceiptHTML, generateExamCardHTML, generateRegistrationFormHTML, printPDF, exportPDF } from '../../../utils/pdfGenerator';
import PageLoader from '../../../components/PageLoader';
import EmailModal from '../../../components/EmailModal';

const STATUS_MAP = {
  pending: { label: 'Chờ xử lý', cls: 'badge-warning' },
  approved: { label: 'Đã xác nhận', cls: 'badge-active' },
  rejected: { label: 'Từ chối', cls: 'badge-inactive' },
};

export default function OnlineExamRegistrationPage() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [data, setData] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCert, setFilterCert] = useState('all');
  const [filterPaid, setFilterPaid] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewItem, setViewItem] = useState(null);
  const [previewType, setPreviewType] = useState('card'); // 'card' or 'form'
  const [editModal, setEditModal] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [emailModalData, setEmailModalData] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetchData();
    certificatesApi.getAll().then(setCerts);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await registrationsApi.getAll();
      // Loại trừ hồ sơ đăng ký học để chỉ hiện đăng ký thi
      // Helper kiểm tra type kể cả fallback qua otherRequest JSON
      const isCourseReg = (r) => {
        if (r.type === 'course' || r.type === 'course_registration') return true;
        try {
          const or = typeof r.other_request === 'string' ? JSON.parse(r.other_request) : r.other_request;
          return or?.type === 'course' || or?.source === 'online_portal' && or?.subjectId;
        } catch { return false; }
      };
      setData((res || []).filter(r => !isCourseReg(r)));
    } catch (e) {
      toast.error('Lỗi', 'Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => data.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterCert !== 'all' && String(r.certificateId) !== filterCert) return false;
    if (filterPaid === 'paid' && !r.feePaid) return false;
    if (filterPaid === 'unpaid' && r.feePaid) return false;
    if (search && ![r.fullName, r.phone, r.cccd, r.email].some(v => v?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }), [data, search, filterStatus, filterCert, filterPaid]);

  const paged = useMemo(() => paginate(filtered, currentPage, pageSize), [filtered, currentPage]);

  const handleConfirm = async (id) => {
    try {
      const res = await registrationsApi.updateStatus(id, 'approved');
      if (res) {
        setData(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
        toast.success('Đã xác nhận', 'Hồ sơ đã được duyệt thành công');
      }
    } catch (e) {
      toast.error('Lỗi', 'Không thể xác nhận hồ sơ');
    }
  };

  const handleReject = async (id) => {
    try {
      await registrationsApi.updateStatus(id, 'rejected');
      setData(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      toast.success('Đã từ chối', 'Hồ sơ đăng ký thi đã bị từ chối');
    } catch (e) {
      toast.error('Lỗi', 'Không thể từ chối hồ sơ');
    }
  };

  const handleTogglePayment = async (item) => {
    try {
      const newValue = !item.feePaid;
      await registrationsApi.updatePaymentStatus(item.id, newValue);
      setData(prev => prev.map(r => r.id === item.id ? { ...r, feePaid: newValue } : r));
      toast.success('Cập nhật', `Đã chuyển sang ${newValue ? 'Đã đóng lệ phí' : 'Chưa đóng lệ phí'}`);
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật trạng thái thanh toán');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const nextStatusMap = {
        'pending': 'approved',
        'approved': 'pending',
        'rejected': 'pending'
      };
      const newStatus = nextStatusMap[item.status] || 'pending';
      const res = await registrationsApi.updateStatus(item.id, newStatus);
      if (res) {
        setData(prev => prev.map(r => r.id === item.id ? { ...r, status: newStatus } : r));
        toast.success('Cập nhật', `Hồ sơ đã chuyển sang: ${STATUS_MAP[newStatus].label}`);
      }
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      await registrationsApi.update(editModal.id, editModal);
      setData(prev => prev.map(r => r.id === editModal.id ? editModal : r));
      toast.success('Thành công', 'Đã cập nhật thông tin hồ sơ');
      setEditModal(null);
    } catch (e) {
      toast.error('Lỗi', 'Không thể lưu thay đổi');
    }
  };

  const handleConfirmPayment = async () => {
    if (!payModal) return;
    try {
      const res = await registrationsApi.updatePaymentStatus(payModal.id, true);
      if (res) {
        setData(prev => prev.map(r => r.id === payModal.id ? { ...r, feePaid: true } : r));
        toast.success('Tài chính', `Đã ghi nhận nộp tiền cho: ${payModal.fullName}`);
      }
      setPayModal(null);
    } catch (e) {
      toast.error('Lỗi', 'Không thể xác nhận thanh toán');
    }
  };

  const handleDelete = async () => {
    try {
      if (!deleteConfirm) return;
      await registrationsApi.delete(deleteConfirm.id);
      setData(prev => prev.filter(r => r.id !== deleteConfirm.id));
      toast.success('Đã xóa', '');
      setDeleteConfirm(null);
    } catch (e) {
      toast.error('Lỗi', 'Không thể xóa hồ sơ');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    const pagedIds = paged.data.map(r => r.id);
    if (selectedIds.length === pagedIds.length && pagedIds.length > 0) setSelectedIds([]);
    else setSelectedIds(pagedIds);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} hồ sơ đã chọn?`)) return;
    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => registrationsApi.delete(id)));
      setData(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      toast.success('Thành công', `Đã xóa ${selectedIds.length} hồ sơ`);
    } catch (e) {
      toast.error('Lỗi', 'Không thể xóa một số hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: data.length,
    pending: data.filter(r => r.status === 'pending').length,
    confirmed: data.filter(r => r.status === 'approved').length,
    feePaid: data.filter(r => r.feePaid).length,
    totalFee: data.filter(r => r.feePaid).reduce((s, r) => s + r.fee, 0),
  };

  const renderOtherRequest = (val) => {
    if (!val) return 'Không có';
    if (typeof val === 'string' && !val.trim().startsWith('{')) return val;
    
    try {
      const obj = typeof val === 'string' ? JSON.parse(val) : val;
      const userMsg = obj.other_request || obj.request || obj.message;
      
      const labels = {
        dob: 'Ngày sinh',
        gender: 'Giới tính',
        ethnicity: 'Dân tộc',
        examRoomId: 'Phòng thi',
        examSessionId: 'Đợt thi',
        source: 'Nguồn',
        birthPlace: 'Nơi sinh',
        rawOption: 'Tùy chọn'
      };

      const systemKeys = ['type', 'subjectId', 'subjectName', 'fee', 'registeredAt', 'tuitionPaid', 'feePaid', 'activityClassId', 'cccdDate', 'cccdPlace', 'photo'];
      const filtered = Object.entries(obj).filter(([k]) => !systemKeys.includes(k) && obj[k] !== undefined && obj[k] !== '');
      
      const parts = [];
      if (userMsg) parts.push(`Nội dung: ${userMsg}`);
      filtered.forEach(([k, v]) => {
        if (k === 'other_request' || k === 'request' || k === 'message') return;
        parts.push(`${labels[k] || k}: ${v}`);
      });

      return parts.length > 0 ? parts.join(' | ') : 'Không có';
    } catch {
      return String(val);
    }
  };

  if (loading) return <PageLoader loading />;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiEdit3 /> Quản lý đăng ký thi online</h1>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => {
             exportToExcel(filtered, 'Danh_sach_online');
             toast.success('Xuất file thành công', '');
          }}><FiDownload size={16} /> Xuất Excel</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng hồ sơ', value: stats.total, color: 'var(--primary-400)' },
          { label: 'Chờ xử lý', value: stats.pending, color: 'var(--warning-400)' },
          { label: 'Đã xác nhận', value: stats.confirmed, color: 'var(--success-400)' },
          { label: 'Đã đóng lệ phí', value: stats.feePaid, color: 'var(--accent-400)' },
          { label: 'Tổng lệ phí thu', value: formatCurrency(stats.totalFee), color: 'var(--success-500)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="toolbar" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, alignItems: 'center' }}>
          <div className="search-bar" style={{ minWidth: 260, flex: 1, maxWidth: 300 }}>
            <FiSearch className="search-icon" />
            <input className="form-input" placeholder="Họ tên, SĐT, CCCD, email..." value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: 38 }} />
          </div>
          <select className="form-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} style={{ width: 150 }}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="form-select" value={filterCert} onChange={e => { setFilterCert(e.target.value); setCurrentPage(1); }} style={{ width: 200 }}>
            <option value="all">Tất cả chứng chỉ</option>
            {certs.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>

          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: 8, paddingLeft: 12, borderLeft: '1px solid var(--border-color)' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setEmailModalData(data.filter(r => selectedIds.includes(r.id)))}>
                 <FiCheckCircle size={14} /> Gửi Email ({selectedIds.length})
              </button>
              {isAdmin && (
                <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
                  <FiTrash2 size={14} /> Xóa đã chọn
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIds([])}>Hủy chọn</button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.length === paged.data.length && paged.data.length > 0} onChange={toggleAll} style={{ accentColor: 'var(--primary-500)' }} /></th>
                <th style={{ width: 44 }}>STT</th>
                <th>Họ và tên</th>
                <th>Chứng chỉ đăng ký</th>
                <th>Trường</th>
                <th>Điện thoại</th>
                <th>Ngày đăng ký</th>
                <th style={{ textAlign: 'center' }}>Lệ phí</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center', width: 160 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.data.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 48, color: 'var(--text-tertiary)' }}>Không có hồ sơ phù hợp</td></tr>
              ) : paged.data.map((r, i) => (
                <tr key={r.id}>
                  <td><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} style={{ accentColor: 'var(--primary-500)' }} /></td>
                  <td style={{ color: 'var(--text-tertiary)' }}>{(currentPage - 1) * pageSize + i + 1}</td>
                  <td>
                    <strong>{r.fullName}</strong>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{r.certificateName}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.school}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.phone}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDateTime(r.submittedAt)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className={`badge ${r.feePaid ? 'badge-active' : 'badge-warning'}`} onClick={() => handleTogglePayment(r)} style={{ cursor: 'pointer', border: 'none' }}>
                      {r.feePaid ? `✓ ${formatCurrency(r.fee)}` : '○ Chờ thu'}
                    </button>
                  </td>
                  <td>
                    <button className={`badge ${STATUS_MAP[r.status]?.cls || 'badge-warning'}`} onClick={() => handleToggleStatus(r)} style={{ cursor: 'pointer', border: 'none' }}>
                      {STATUS_MAP[r.status]?.label || r.status}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-icon-sm" title="Xem chi tiết & In" onClick={() => setViewItem(r)}>
                        <FiEye size={13} style={{ color: 'var(--info-400)' }} />
                      </button>
                      <button className="btn btn-ghost btn-icon-sm" title="Chỉnh sửa" onClick={() => setEditModal({...r})}>
                        <FiEdit2 size={13} style={{ color: 'var(--primary-400)' }} />
                      </button>
                      {isAdmin && (
                        <button className="btn btn-ghost btn-icon-sm" title="Xóa" onClick={() => setDeleteConfirm(r)}>
                          <FiTrash2 size={13} style={{ color: 'var(--danger-400)' }} />
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

      {/* Pagination */}
      {paged.totalPages > 1 && (
        <div style={{ padding: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><FiChevronLeft /></button>
          {Array.from({ length: paged.totalPages }, (_, i) => (
            <button key={i} className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="pagination-btn" disabled={currentPage === paged.totalPages} onClick={() => setCurrentPage(p => p + 1)}><FiChevronRight /></button>
        </div>
      )}

      {/* View Detail Modal với chức năng Xem Thẻ & Đơn (Dành riêng cho Đăng ký thi) */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Hồ sơ đăng ký: {viewItem.fullName}</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className={`tab ${previewType === 'card' ? 'active' : ''}`} onClick={() => setPreviewType('card')}>Thẻ dự thi</button>
                <button className={`tab ${previewType === 'form' ? 'active' : ''}`} onClick={() => setPreviewType('form')}>Đơn đăng ký</button>
              </div>
              <button className="modal-close" onClick={() => setViewItem(null)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ background: '#f1f5f9', padding: 20 }}>
              <div id="pdf-content" style={{ background: 'white', margin: '0 auto', padding: '10mm', width: '210mm', minHeight: '297mm', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
                <div dangerouslySetInnerHTML={{ __html: previewType === 'card' ? generateExamCardHTML(viewItem) : generateRegistrationFormHTML(viewItem) }} />
              </div>
              
              {/* Thêm phần hiển thị chi tiết bên dưới bản xem trước */}
              <div className="card" style={{ marginTop: 24, padding: 20 }}>
                <h4 style={{ marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>Thông tin bổ sung</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Mã hồ sơ</div>
                    <div style={{ fontWeight: 600 }}>{viewItem.code}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Yêu cầu khác</div>
                    <div style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{renderOtherRequest(viewItem.otherRequest)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Ngày nộp</div>
                    <div style={{ fontWeight: 600 }}>{formatDateTime(viewItem.submittedAt)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
               <button className="btn btn-ghost" onClick={() => setViewItem(null)}>Đóng</button>
               <button className="btn btn-outline" onClick={() => {
                const html = previewType === 'card' ? generateExamCardHTML(viewItem) : generateRegistrationFormHTML(viewItem);
                printPDF(html);
              }}><FiPrinter /> In ngay</button>
              <button className="btn btn-primary" onClick={async () => {
                const html = previewType === 'card' ? generateExamCardHTML(viewItem) : generateRegistrationFormHTML(viewItem);
                const filename = previewType === 'card' ? `The_du_thi_${viewItem.fullName}.pdf` : `Don_dang_ky_${viewItem.fullName}.pdf`;
                await exportPDF(html, filename);
                toast.success('Thành công', 'Đã tải xuống PDF');
              }}><FiDownload /> Tải bản mềm</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Chỉnh sửa hồ sơ: {editModal.fullName}</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}><FiX /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input className="form-input" value={editModal.fullName} onChange={e => setEditModal({...editModal, fullName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số CCCD</label>
                    <input className="form-input" value={editModal.cccd} onChange={e => setEditModal({...editModal, cccd: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Điện thoại</label>
                    <input className="form-input" value={editModal.phone} onChange={e => setEditModal({...editModal, phone: e.target.value})} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary"><FiCheck /> Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 430 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-dialog">
                <div className="confirm-icon danger"><FiTrash2 /></div>
                <div className="confirm-title">Xác nhận xóa</div>
                <div className="confirm-message">Xóa hồ sơ đăng ký thi của <strong>{deleteConfirm.fullName}</strong>?</div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                  <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Hủy</button>
                  <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Email Modal */}
      {emailModalData && (
        <EmailModal 
          isOpen={!!emailModalData} 
          onClose={() => setEmailModalData(null)} 
          recipients={emailModalData}
          extraData={{ 
            context: 'exam',
            className: emailModalData.length === 1 ? emailModalData[0].certificateName : 'Đợt thi',
            amount: emailModalData.length === 1 ? emailModalData[0].fee : undefined
          }}
        />
      )}
    </div>
  );
}
