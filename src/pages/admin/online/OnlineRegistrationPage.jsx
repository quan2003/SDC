import { useState, useMemo, useEffect } from 'react';
import { FiGlobe, FiSearch, FiCheck, FiEye, FiPrinter, FiDownload, FiEdit2, FiX, FiChevronLeft, FiChevronRight, FiFileText, FiTrash2, FiMail, FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { registrationsApi, certificatesApi } from '../../../services/api';
import { paginate, formatDateTime, formatCurrency } from '../../../utils/helpers';
import { generateExamCardHTML, generateRegistrationFormHTML, printPDF, exportPDF } from '../../../utils/pdfGenerator';
import { sendRealEmail } from '../../../utils/mailer';
import EmailModal from '../../../components/EmailModal';

export default function OnlineRegistrationPage() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewType, setPreviewType] = useState('card');
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
  const [payModal, setPayModal] = useState(null); // item being payment-confirmed
  const [emailModalData, setEmailModalData] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paidFilter, setPaidFilter] = useState('all');
  const [certFilter, setCertFilter] = useState('all');
  const [certificates, setCertificates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    fetchData();
    certificatesApi.getAll().then(setCertificates);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await registrationsApi.getAll();
      setData(res || []);
    } catch (e) {
      console.error(e);
      toast.error('Lỗi hệ thống', 'Không thể tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = (item.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (item.phone || '').includes(search) ||
                          (item.cccd || '').includes(search);
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchCert = certFilter === 'all' || String(item.certificateId) === certFilter;
      const matchPaid = paidFilter === 'all' || (paidFilter === 'paid' ? item.paid : !item.paid);
      return matchSearch && matchStatus && matchCert && matchPaid;
    });
  }, [data, search, statusFilter, certFilter, paidFilter]);

  const paged = useMemo(() => paginate(filteredData, currentPage, pageSize), [filteredData, currentPage]);

  // ── CONFIRM STATUS (approve/pending) ──────────────────────────────────────
  const handleConfirm = async (item) => {
    try {
      await registrationsApi.updateStatus(item.id, 'approved');
      toast.success('Thành công', `Đã xác nhận hồ sơ của ${item.fullName}`);
      setData(prev => prev.map(r => r.id === item.id ? { ...r, status: 'approved' } : r));

      if (item.email) {
        sendRealEmail({
          to: item.email,
          subject: 'SDC - Hồ sơ đăng ký đã được xác nhận',
          body: `<div style="font-family:sans-serif;line-height:1.5;color:#333;">
                  <h2>Chào ${item.fullName},</h2>
                  <p>Hồ sơ đăng ký khóa học <strong>${item.certificateName || '—'}</strong> của bạn đã được duyệt thành công.</p>
                  <p>Trạng thái thanh toán: <strong>${item.paid ? 'Đã đóng lệ phí' : 'Chưa đóng lệ phí'}</strong></p>
                  <p>Cảm ơn bạn đã tin tưởng trung tâm SDC.</p>
                </div>`
        }).catch(console.warn);
      }
    } catch (e) {
      toast.error('Lỗi', 'Không thể duyệt hồ sơ này');
    }
  };

  // ── TOGGLE PAYMENT STATUS ─────────────────────────────────────────────────
  const handleTogglePayment = async (item) => {
    const newPaid = !item.paid;

    if (newPaid) {
      // Show confirmation modal before marking as paid
      setPayModal(item);
      return;
    }

    // Un-mark paid directly (with confirm)
    if (!window.confirm(`Hủy xác nhận thanh toán của ${item.fullName}?`)) return;
    try {
      await registrationsApi.updatePaymentStatus(item.id, false);
      setData(prev => prev.map(r => r.id === item.id ? { ...r, paid: false, paidAt: null } : r));
      toast.success('Đã cập nhật', 'Đã hủy trạng thái thanh toán');
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật thanh toán: ' + e.message);
    }
  };

  const handleConfirmPayment = async () => {
    if (!payModal) return;
    try {
      const updated = await registrationsApi.updatePaymentStatus(payModal.id, true);
      const paidAt = updated?.paid_at || new Date().toISOString();
      setData(prev => prev.map(r => r.id === payModal.id ? { ...r, paid: true, paidAt } : r));
      toast.success('Xác nhận thanh toán thành công', `Đã ghi nhận học phí của ${payModal.fullName}`);

      if (payModal.email) {
        sendRealEmail({
          to: payModal.email,
          subject: 'SDC - Xác nhận thanh toán học phí',
          body: `<div style="font-family:sans-serif;line-height:1.5;color:#333;">
                  <h2>Chào ${payModal.fullName},</h2>
                  <p>Chúng tôi xác nhận đã nhận được học phí <strong>${formatCurrency(payModal.fee)}</strong> cho khóa học <strong>${payModal.certificateName}</strong>.</p>
                  <p>Cảm ơn bạn!</p>
                </div>`
        }).catch(console.warn);
      }
    } catch (e) {
      toast.error('Lỗi', 'Không thể xác nhận thanh toán: ' + e.message);
    } finally {
      setPayModal(null);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDeleteClick = (item) => setDeleteModal({ show: true, item });

  const handleConfirmDelete = async () => {
    const item = deleteModal.item;
    if (!item) return;
    try {
      setDeleteModal({ show: false, item: null });
      setLoading(true);
      await registrationsApi.delete(item.id);
      toast.success('Thành công', `Đã xóa hồ sơ của ${item.fullName}`);
      setData(prev => prev.filter(r => r.id !== item.id));
    } catch (e) {
      toast.error('Lỗi hệ thống', e.message || 'Không thể xóa hồ sơ này');
    } finally {
      setLoading(false);
    }
  };

  // ── EDIT ──────────────────────────────────────────────────────────────────
  const openEdit = (item) => { setEditModal(item); setFormData({ ...item }); };

  const handleSaveEdit = async () => {
    try {
      await registrationsApi.update(editModal.id, formData);
      toast.success('Thành công', 'Cập nhật hồ sơ thành công');
      setEditModal(null);
      fetchData();
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật hồ sơ');
    }
  };

  // ── PREVIEW / PDF ─────────────────────────────────────────────────────────
  const openPreview = (item, type) => { setPreviewItem(item); setPreviewType(type); };

  const handlePrint = () => {
    const html = previewType === 'card'
      ? generateExamCardHTML(previewItem)
      : generateRegistrationFormHTML(previewItem);
    printPDF(html);
  };

  const handleExportPDF = async () => {
    const html = previewType === 'card'
      ? generateExamCardHTML(previewItem)
      : generateRegistrationFormHTML(previewItem);
    const filename = previewType === 'card'
      ? `The_du_thi_${previewItem.fullName}.pdf`
      : `Don_dang_ky_${previewItem.fullName}.pdf`;
    await exportPDF(html, filename);
    toast.success('Xuất PDF thành công', filename);
  };

  // ── STATS ─────────────────────────────────────────────────────────────────
  const pendingCount = data.filter(r => r.status === 'pending').length;
  const approvedCount = data.filter(r => r.status === 'approved').length;
  const paidCount = data.filter(r => r.paid).length;
  const totalRevenue = data.filter(r => r.paid).reduce((s, r) => s + (r.fee || 0), 0);

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiGlobe /> Quản lý đăng ký học online</h1>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon blue"><FiFileText /></div>
          <div className="stat-info">
            <div className="stat-label">Tổng đăng ký</div>
            <div className="stat-value">{data.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiFileText /></div>
          <div className="stat-info">
            <div className="stat-label">Chờ xử lý</div>
            <div className="stat-value">{pendingCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiCheck /></div>
          <div className="stat-info">
            <div className="stat-label">Đã xác nhận</div>
            <div className="stat-value">{approvedCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FiDollarSign /></div>
          <div className="stat-info">
            <div className="stat-label">Đã thu ({paidCount} hồ sơ)</div>
            <div className="stat-value" style={{ fontSize: '1.1rem' }}>{formatCurrency(totalRevenue)}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-bar" style={{ minWidth: 300 }}>
            <FiSearch className="search-icon" />
            <input
              className="form-input"
              placeholder="Họ tên, SĐT, CCCD..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: 42 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ width: 150 }}>
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="approved">Đã xác nhận</option>
            </select>

            <select className="form-select" value={paidFilter} onChange={e => { setPaidFilter(e.target.value); setCurrentPage(1); }} style={{ width: 160 }}>
              <option value="all">Tất cả học phí</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
            </select>

            <select className="form-select" value={certFilter} onChange={e => { setCertFilter(e.target.value); setCurrentPage(1); }} style={{ width: 200 }}>
              <option value="all">Tất cả chứng chỉ</option>
              {certificates.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            Hiển thị: <strong>{filteredData.length}</strong> hồ sơ
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="loading-spinner"></span> Đang tải...
          </div>
        )}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>STT</th>
                <th>Họ tên</th>
                <th>Chứng chỉ</th>
                <th>Trường</th>
                <th>Điện thoại</th>
                <th>Ngày đăng ký</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Học phí</th>
                <th style={{ textAlign: 'center', width: 180 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.data.length === 0 ?
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Không tìm thấy hồ sơ phù hợp</td></tr>
              : paged.data.map((r, idx) => (
                <tr key={r.id}>
                  <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td><strong>{r.fullName}</strong></td>
                  <td style={{ fontSize: '0.82rem' }}>{r.certificateName}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.school}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.phone}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDateTime(r.submittedAt)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${r.status === 'approved' ? 'badge-active' : 'badge-pending'}`}>
                      {r.status === 'approved' ? 'Đã xác nhận' : 'Chờ xử lý'}
                    </span>
                  </td>

                  {/* ── PAYMENT STATUS CELL ── */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      title={r.paid ? 'Nhấn để hủy thanh toán' : 'Nhấn để xác nhận đã thu tiền'}
                      onClick={() => handleTogglePayment(r)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.15s',
                        background: r.paid ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.08)',
                        color: r.paid ? 'var(--success-600)' : 'var(--danger-500)',
                      }}
                    >
                      {r.paid
                        ? <><FiCheckCircle size={13} /> Đã thanh toán</>
                        : <><FiClock size={13} /> Chưa thanh toán</>
                      }
                    </button>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-icon-sm" onClick={() => setEmailModalData(r)} title="Gửi Email">
                        <FiMail size={13} style={{ color: 'var(--info-500)' }} />
                      </button>
                      <button className="btn btn-ghost btn-icon-sm" onClick={() => openEdit(r)} title="Sửa">
                        <FiEdit2 size={13} style={{ color: 'var(--primary-400)' }} />
                      </button>
                      <button className="btn btn-ghost btn-icon-sm" onClick={() => openPreview(r, 'form')} title="Xem đơn">
                        <FiEye size={13} style={{ color: 'var(--info-500)' }} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon-sm"
                        onClick={() => handleConfirm(r)}
                        disabled={r.status === 'approved'}
                        title="Xác nhận hồ sơ"
                      >
                        <FiCheck size={13} style={{ color: r.status === 'approved' ? 'var(--text-tertiary)' : 'var(--success-500)' }} />
                      </button>
                      {isAdmin && (
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => handleDeleteClick(r)} title="Xóa">
                          <FiTrash2 size={13} style={{ color: 'var(--error-500)' }} />
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
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
            <FiChevronLeft />
          </button>
          {[...Array(paged.totalPages)].map((_, i) => (
            <button key={i} className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button className="pagination-btn" disabled={currentPage === paged.totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
            <FiChevronRight />
          </button>
        </div>
      )}

      {/* ══ PAYMENT CONFIRMATION MODAL ══════════════════════════════════════ */}
      {payModal && (
        <div className="modal-overlay" onClick={() => setPayModal(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title"><FiDollarSign /> Xác nhận thu học phí</h3>
              <button className="modal-close" onClick={() => setPayModal(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Student info */}
                <div style={{ padding: '16px 20px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8 }}>{payModal.fullName}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <div>CCCD: <strong>{payModal.cccd}</strong></div>
                    <div>SĐT: <strong>{payModal.phone}</strong></div>
                    <div style={{ gridColumn: 'span 2' }}>Chứng chỉ: <strong>{payModal.certificateName}</strong></div>
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(34,197,94,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Số tiền học phí</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success-600)' }}>
                    {formatCurrency(payModal.fee)}
                  </div>
                </div>

                {/* QR */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 200, background: 'white', padding: 8, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <img
                      src={`https://img.vietqr.io/image/970418-5601274934-compact.png?amount=${payModal.fee}&addInfo=SDC ${payModal.cccd} ${payModal.fullName}&accountName=TT PT PHAN MEM DAI HOC DA NANG`}
                      alt="QR thanh toán"
                      style={{ width: '100%', display: 'block' }}
                    />
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center', margin: 0 }}>
                  Nhấn <strong>Xác nhận đã thu</strong> sau khi kiểm tra học viên đã chuyển khoản thành công.
                </p>
              </div>
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

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Chỉnh sửa hồ sơ: {editModal.fullName}</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Họ tên</label>
                  <input className="form-input" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input className="form-input" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} placeholder="dd/mm/yyyy" />
                </div>
                <div className="form-group">
                  <label className="form-label">Số CCCD</label>
                  <input className="form-input" value={formData.cccd} onChange={e => setFormData({ ...formData, cccd: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nơi cấp CCCD</label>
                  <input className="form-input" value={formData.cccdPlace} onChange={e => setFormData({ ...formData, cccdPlace: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày cấp CCCD</label>
                  <input className="form-input" value={formData.cccdDate} onChange={e => setFormData({ ...formData, cccdDate: e.target.value })} placeholder="dd/mm/yyyy" />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Trường</label>
                  <input className="form-input" value={formData.school} onChange={e => setFormData({ ...formData, school: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Lớp</label>
                  <input className="form-input" value={formData.classGroup} onChange={e => setFormData({ ...formData, classGroup: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
          <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Xem trước hồ sơ</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className={`tab ${previewType === 'card' ? 'active' : ''}`} onClick={() => setPreviewType('card')}>Thẻ dự thi</button>
                <button className={`tab ${previewType === 'form' ? 'active' : ''}`} onClick={() => setPreviewType('form')}>Đơn đăng ký</button>
              </div>
              <button className="modal-close" onClick={() => setPreviewItem(null)}><FiX /></button>
            </div>
            <div className="modal-body" style={{ background: '#f1f5f9', padding: 20 }}>
              <div id="pdf-content" style={{ background: 'white', margin: '0 auto', padding: '10mm', width: '210mm', minHeight: '297mm', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
                <div dangerouslySetInnerHTML={{ __html: previewType === 'card' ? generateExamCardHTML(previewItem) : generateRegistrationFormHTML(previewItem) }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPreviewItem(null)}>Đóng</button>
              <button className="btn btn-outline" onClick={handlePrint}><FiPrinter /> In ngay</button>
              <button className="btn btn-primary" onClick={handleExportPDF}><FiDownload /> Tải xuống PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: 400, padding: '24px 32px', textAlign: 'center', background: 'white', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FiTrash2 size={30} style={{ color: 'var(--error-500)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Xác nhận xóa</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa hồ sơ của sinh viên <strong style={{ color: 'var(--text-primary)' }}>{deleteModal.item?.fullName}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteModal({ show: false, item: null })}>Hủy bỏ</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleConfirmDelete}>Xóa ngay</button>
            </div>
          </div>
        </div>
      )}

      <EmailModal
        isOpen={emailModalData !== null}
        onClose={() => setEmailModalData(null)}
        recipients={Array.isArray(emailModalData) ? emailModalData : (emailModalData ? [emailModalData] : [])}
        extraData={{
          className: Array.isArray(emailModalData) ? 'Khóa học CNTT' : emailModalData?.certificateName || 'Khóa học CNTT'
        }}
      />
    </div>
  );
}
