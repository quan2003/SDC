import { useState, useMemo, useEffect } from 'react';
import { FiEdit2, FiSearch, FiCheck, FiEye, FiX, FiChevronLeft, FiChevronRight, FiTrash2, FiClock, FiCheckCircle, FiDollarSign, FiGlobe, FiLayers } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { registrationsApi, certificatesApi, certificateClassesApi } from '../../../services/api';
import { paginate, formatDateTime, formatCurrency } from '../../../utils/helpers';
import PageLoader from '../../../components/PageLoader';
import EmailModal from '../../../components/EmailModal';

export default function OnlineRegistrationPage() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
  const [payModal, setPayModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paidFilter, setPaidFilter] = useState('all');
  const [certFilter, setCertFilter] = useState('all');
  const [certificates, setCertificates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [emailModalData, setEmailModalData] = useState(null);
  const pageSize = 12;

  useEffect(() => {
    fetchData();
    certificatesApi.getAll().then(setCertificates);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await registrationsApi.getAll();
      // Chỉ lấy hồ sơ đăng ký học
      // Helper kiểm tra type kể cả fallback qua otherRequest JSON (bản ghi cũ có type=null)
      const isCourseReg = (r) => {
        if (r.type === 'course' || r.type === 'course_registration') return true;
        try {
          const or = typeof r.other_request === 'string' ? JSON.parse(r.other_request) : r.other_request;
          return or?.type === 'course' || (or?.source === 'online_portal' && or?.subjectId);
        } catch { return false; }
      };
      setData((res || []).filter(r => isCourseReg(r)));
    } catch (e) {
      toast.error('Lỗi', 'Không thể tải danh sách đăng ký học');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = String(item.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                          String(item.phone || '').includes(search) ||
                          String(item.cccd || '').includes(search);
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchCert = certFilter === 'all' || String(item.certificateId) === certFilter;
      const matchPaid = paidFilter === 'all' || (paidFilter === 'paid' ? item.paid : !item.paid);
      return matchSearch && matchStatus && matchCert && matchPaid;
    });
  }, [data, search, statusFilter, certFilter, paidFilter]);

  const paged = useMemo(() => paginate(filteredData, currentPage, pageSize), [filteredData, currentPage]);

  const handleConfirm = async (item) => {
    try {
      await registrationsApi.updateStatus(item.id, 'approved');
      toast.success('Đã xác nhận', `Đã duyệt hồ sơ của ${item.fullName}`);
      setData(prev => prev.map(r => r.id === item.id ? { ...r, status: 'approved' } : r));
    } catch (e) {
      toast.error('Lỗi', 'Không thể duyệt hồ sơ');
    }
  };

  const handleTogglePayment = async (item) => {
    if (!item.paid) {
      setPayModal(item);
      return;
    }
    if (!window.confirm('Hủy xác nhận thanh toán này?')) return;
    try {
      await registrationsApi.updatePaymentStatus(item.id, false);
      setData(prev => prev.map(r => r.id === item.id ? { ...r, paid: false } : r));
      toast.success('Cập nhật', 'Đã hủy trạng thái thanh toán');
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật');
    }
  };

  const handleConfirmPay = async () => {
    if (!payModal) return;
    try {
      await registrationsApi.updatePaymentStatus(payModal.id, true);
      setData(prev => prev.map(r => r.id === payModal.id ? { ...r, paid: true } : r));
      toast.success('Tài chính', `Đã xác nhận học phí cho ${payModal.fullName}`);
      setPayModal(null);
    } catch (e) {
      toast.error('Lỗi', 'Không thể xác nhận thanh toán');
    }
  };



  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await registrationsApi.update(editModal.id, formData);
      toast.success('Thành công', 'Đã cập nhật thông tin');
      setEditModal(null);
      fetchData();
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật hồ sơ');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const nextStatus = item.status === 'approved' ? 'pending' : 'approved';
      await registrationsApi.updateStatus(item.id, nextStatus);
      setData(prev => prev.map(r => r.id === item.id ? { ...r, status: nextStatus } : r));
      toast.success('Cập nhật', `Đã chuyển sang ${nextStatus === 'approved' ? 'Đã xác nhận' : 'Chờ xử lý'}`);
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const stats = {
    total: data.length,
    pending: data.filter(r => r.status === 'pending').length,
    confirmed: data.filter(r => r.status === 'approved').length,
    paid: data.filter(r => r.paid).length,
    totalRevenue: data.filter(r => r.paid).reduce((sum, r) => sum + r.fee, 0)
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
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} hồ sơ đã chọn?`)) return;
    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => registrationsApi.delete(id)));
      setData(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      toast.success('Thành công', `Đã xóa ${selectedIds.length} hồ sơ.`);
    } catch (e) {
      toast.error('Lỗi', 'Không thể xóa một số hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    const item = deleteModal.item;
    if (!item) return;
    try {
        await registrationsApi.delete(item.id);
        setData(prev => prev.filter(r => r.id !== item.id));
        toast.success('Đã xóa', `Đã xóa hồ sơ của ${item.fullName}`);
        setDeleteModal({ show: false, item: null });
    } catch (e) {
        toast.error('Lỗi', 'Không thể xóa hồ sơ này');
    }
  };

  const renderOtherRequest = (val) => {
    if (!val) return '—';
    if (typeof val === 'string' && !val.trim().startsWith('{')) return val;
    
    try {
      const obj = typeof val === 'string' ? JSON.parse(val) : val;
      const userMsg = obj.other_request || obj.request || obj.message || obj.note;
      
      if (userMsg && userMsg.trim()) {
        return userMsg;
      }
      return '—';
    } catch { 
      return String(val); 
    }
  };

  if (loading) return <PageLoader loading />;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiGlobe /> Quản lý đăng ký học online</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng đăng ký', value: stats.total, color: 'var(--primary-500)' },
          { label: 'Chờ xử lý', value: stats.pending, color: 'var(--warning-500)' },
          { label: 'Đã xác nhận', value: stats.confirmed, color: 'var(--success-500)' },
          { label: 'Doanh thu học phí', value: formatCurrency(stats.totalRevenue), color: 'var(--success-600)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="toolbar card" style={{ padding: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: 300 }}>
            <FiSearch className="search-icon" />
            <input className="form-input" placeholder="Họ tên, SĐT, CCCD..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: 36 }} />
          </div>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="approved">Đã xác nhận</option>
          </select>
          <select className="form-input" value={certFilter} onChange={e => setCertFilter(e.target.value)} style={{ width: 220 }}>
            <option value="all">Tất cả môn học</option>
            {certificates.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
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
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.length === paged.data.length && paged.data.length > 0} onChange={toggleAll} style={{ accentColor: 'var(--primary-500)' }} /></th>
              <th style={{ width: 50 }}>STT</th>
              <th>Họ tên</th>
              <th>Môn học đăng ký</th>
              <th>Điện thoại</th>
              <th>Ngày đăng ký</th>
              <th style={{ textAlign: 'center' }}>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Học phí</th>
              <th style={{ textAlign: 'center', width: 120 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.data.map((r, i) => (
              <tr key={r.id}>
                <td><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} style={{ accentColor: 'var(--primary-500)' }} /></td>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td><strong>{r.fullName}</strong></td>
                <td>{r.certificateName}</td>
                <td>{r.phone}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{formatDateTime(r.submittedAt)}</td>
                <td style={{ textAlign: 'center' }}>
                  <button className={`badge ${r.status === 'approved' ? 'badge-active' : 'badge-warning'}`} onClick={() => handleToggleStatus(r)} style={{ cursor: 'pointer', border: 'none' }}>
                    {r.status === 'approved' ? 'Đã xác nhận' : 'Chờ xử lý'}
                  </button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className={`badge ${r.paid ? 'badge-active' : 'badge-warning'}`} onClick={() => handleTogglePayment(r)} style={{ cursor: 'pointer', border: 'none' }}>
                    {r.paid ? `✓ ${formatCurrency(r.fee)}` : 'Chưa thanh toán'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>

                    <button className="btn btn-ghost btn-icon-sm" onClick={() => { setEditModal(r); setFormData({...r}); }} title="Sửa"><FiEdit2 size={13} style={{ color: 'var(--primary-400)' }} /></button>
                    <button className="btn btn-ghost btn-icon-sm" onClick={() => setPreviewItem(r)} title="Xem chi tiết"><FiEye size={13} style={{ color: 'var(--info-500)' }} /></button>
                    {isAdmin && <button className="btn btn-ghost btn-icon-sm" onClick={() => setDeleteModal({ show: true, item: r })} title="Xóa"><FiTrash2 size={13} style={{ color: 'var(--danger-400)' }} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



      {/* Preview Modal */}
      {previewItem && (
        <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Chi tiết đăng ký học: {previewItem.fullName}</h3>
              <button className="modal-close" onClick={() => setPreviewItem(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  { label: 'Họ và tên', value: previewItem.fullName },
                  { label: 'Ngày sinh', value: previewItem.dob },
                  { label: 'Nơi sinh', value: previewItem.birthPlace },
                  { label: 'Điện thoại', value: previewItem.phone },
                  { label: 'Email', value: previewItem.email },
                  { label: 'CCCD', value: previewItem.cccd },
                  { label: 'Môn học', value: previewItem.certificateName },
                  { label: 'Học phí', value: formatCurrency(previewItem.fee) },
                  { label: 'Trạng thái', value: previewItem.status === 'approved' ? 'Đã xác nhận' : 'Chờ xử lý' },
                  { label: 'Thanh toán', value: previewItem.paid ? 'Đã nộp tiền' : 'Chưa nộp tiền' },
                  { label: 'Yêu cầu khác', value: renderOtherRequest(previewItem.otherRequest) },
                ].map((f, i) => (
                  <div key={i} style={{ gridColumn: f.label === 'Yêu cầu khác' ? 'span 2' : 'auto' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontWeight: 600, color: f.label === 'Yêu cầu khác' ? 'var(--primary-600)' : 'inherit' }}>{f.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPreviewItem(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Simple info) */}
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
                  <div className="form-group"><label className="form-label">Họ tên</label><input className="form-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">Số điện thoại</label><input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">Số CCCD</label><input className="form-input" value={formData.cccd} onChange={e => setFormData({...formData, cccd: e.target.value})} required /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Confirm */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Xác nhận thu học phí</h3>
              <button className="modal-close" onClick={() => setPayModal(null)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <FiDollarSign size={48} style={{ color: 'var(--success-500)', marginBottom: 16 }} />
              <p>Xác nhận học viên <strong>{payModal.fullName}</strong> đã hoàn thành nộp học phí số tiền:</p>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success-600)', margin: '12px 0' }}>{formatCurrency(payModal.fee)}</div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setPayModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleConfirmPay}>Đồng ý xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, item: null })}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeleteModal({ show: false, item: null })}><FiX /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 0' }}>
               <FiTrash2 size={40} style={{ color: 'var(--danger-500)', marginBottom: 16 }} />
               <p>Bạn có chắc chắn muốn xóa hồ sơ của <strong>{deleteModal.item?.fullName}</strong>?</p>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 8 }}>Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteModal({ show: false, item: null })}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDeleteItem}>Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}

      {emailModalData && (
        <EmailModal 
          isOpen={!!emailModalData} 
          onClose={() => setEmailModalData(null)} 
          recipients={emailModalData}
          extraData={{ 
            className: emailModalData.length === 1 ? emailModalData[0].certificateName : 'Khóa học',
            amount: emailModalData.length === 1 ? emailModalData[0].fee : undefined
          }}
        />
      )}
    </div>
  );
}
