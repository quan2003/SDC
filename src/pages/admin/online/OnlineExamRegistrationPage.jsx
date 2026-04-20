import { useState, useMemo, useEffect } from 'react';
import { FiEdit3, FiSearch, FiCheck, FiEye, FiPrinter, FiDownload, FiX, FiTrash2, FiChevronLeft, FiChevronRight, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { sendRealEmail } from '../../../utils/mailer';
import { formatCurrency, formatDateTime, paginate, exportToExcel, formatDate } from '../../../utils/helpers';
import { registrationsApi, certificatesApi } from '../../../services/api';
import { generateReceiptHTML, printPDF } from '../../../utils/pdfGenerator';

const STATUS_MAP = {
  pending: { label: 'Chờ xử lý', cls: 'badge-warning' },
  confirmed: { label: 'Đã xác nhận', cls: 'badge-active' },
  approved: { label: 'Đã phê duyệt', cls: 'badge-active' },
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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetchData();
    certificatesApi.getAll().then(setCerts);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await registrationsApi.getAll();
      setData(res || []);
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
      const item = data.find(r => r.id === id);
      await registrationsApi.update(id, { ...item, status: 'confirmed' });
      setData(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r));
      toast.success('Đã xác nhận', 'Hồ sơ đăng ký thi đã được xác nhận');
      
      if (item && item.email) {
        sendRealEmail({
          to: item.email,
          subject: 'SDC - Hồ sơ thi đã được duyệt',
          body: `<h2>Chào ${item.fullName},</h2><p>Hồ sơ thi <b>${item.examModule || 'ứng dụng CNTT'}</b> đã được xác nhận.</p>`
        }).catch(console.warn);
      }
    } catch (e) {
      toast.error('Lỗi', 'Không thể xác nhận hồ sơ');
    }
  };

  const handleReject = async (id) => {
    try {
      const item = data.find(r => r.id === id);
      await registrationsApi.update(id, { ...item, status: 'rejected' });
      setData(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      toast.success('Đã từ chối', 'Hồ sơ đăng ký thi đã bị từ chối');
    } catch (e) {
      toast.error('Lỗi', 'Không thể từ chối hồ sơ');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const item = data.find(r => r.id === id);
      await registrationsApi.update(id, { ...item, feePaid: true });
      setData(prev => prev.map(r => r.id === id ? { ...r, feePaid: true } : r));
      toast.success('Đã xác nhận thanh toán', 'Lệ phí thi đã được ghi nhận');
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhập thanh toán');
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

  const stats = {
    total: data.length,
    pending: data.filter(r => r.status === 'pending').length,
    confirmed: data.filter(r => r.status === 'confirmed').length,
    feePaid: data.filter(r => r.feePaid).length,
    totalFee: data.filter(r => r.feePaid).reduce((s, r) => s + r.fee, 0),
  };

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
      <div className="toolbar">
        <div className="toolbar-left" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="search-bar" style={{ minWidth: 260 }}>
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
          <select className="form-select" value={filterPaid} onChange={e => { setFilterPaid(e.target.value); setCurrentPage(1); }} style={{ width: 160 }}>
            <option value="all">Tất cả lệ phí</option>
            <option value="paid">Đã đóng lệ phí</option>
            <option value="unpaid">Chưa đóng lệ phí</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> / {data.length} hồ sơ
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
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
                  <td style={{ color: 'var(--text-tertiary)' }}>{(currentPage - 1) * pageSize + i + 1}</td>
                  <td>
                    <strong>{r.fullName}</strong>
                    {r.examDate && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Thi: {r.examDate} — {r.roomName}</div>}
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{r.certName || r.certificateName}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{r.school}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.phone}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDateTime(r.submittedAt)}</td>
                  <td style={{ textAlign: 'center' }}>
                    {r.feePaid
                      ? <span className="badge badge-success">✓ {formatCurrency(r.fee)}</span>
                      : <span className="badge badge-warning">✗ Chưa đóng</span>
                    }
                  </td>
                  <td><span className={`badge ${STATUS_MAP[r.status]?.cls || 'badge-warning'}`}>{STATUS_MAP[r.status]?.label || r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-icon-sm" title="Xem chi tiết" onClick={() => setViewItem(r)}>
                        <FiEye size={13} style={{ color: 'var(--primary-400)' }} />
                      </button>
                      {r.status === 'pending' && (
                        <>
                          <button className="btn btn-ghost btn-icon-sm" title="Xác nhận" onClick={() => handleConfirm(r.id)}>
                            <FiCheck size={13} style={{ color: 'var(--success-500)' }} />
                          </button>
                          <button className="btn btn-ghost btn-icon-sm" title="Từ chối" onClick={() => handleReject(r.id)}>
                            <FiX size={13} style={{ color: 'var(--warning-400)' }} />
                          </button>
                        </>
                      )}
                      {!r.feePaid && r.status === 'confirmed' && (
                        <button className="btn btn-ghost btn-icon-sm" title="Đánh dấu đã thu lệ phí" onClick={() => handleMarkPaid(r.id)}>
                          <FiClock size={13} style={{ color: 'var(--accent-400)' }} />
                        </button>
                      )}
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

      {/* View Detail Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Chi tiết hồ sơ đăng ký thi</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className={`badge ${STATUS_MAP[viewItem.status]?.cls}`}>{STATUS_MAP[viewItem.status]?.label}</span>
                <button className="modal-close" onClick={() => setViewItem(null)}><FiX /></button>
              </div>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {viewItem.photo && (
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center' }}>
                    <img src={viewItem.photo} alt="Ảnh thẻ" style={{ width: 90, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                  </div>
                )}
                {[
                  { label: 'Họ và tên', value: viewItem.fullName },
                  { label: 'Ngày sinh', value: viewItem.dob },
                  { label: 'Giới tính', value: viewItem.gender },
                  { label: 'Dân tộc', value: viewItem.ethnicity },
                  { label: 'Điện thoại', value: viewItem.phone },
                  { label: 'Email', value: viewItem.email },
                  { label: 'CCCD/CMT', value: viewItem.cccd },
                  { label: 'Ngày cấp', value: viewItem.cccdDate },
                  { label: 'Nơi cấp', value: viewItem.cccdPlace },
                  { label: 'Nơi sinh', value: viewItem.birthPlace },
                  { label: 'Trường', value: viewItem.school },
                  { label: 'Lớp', value: viewItem.classGroup },
                  { label: 'Chứng chỉ đăng ký', value: viewItem.certName || viewItem.certificateName },
                  { label: 'Module thi', value: viewItem.examModule || 'Không có' },
                  { label: 'Lệ phí', value: formatCurrency(viewItem.fee) },
                  { label: 'Đã đóng lệ phí', value: viewItem.feePaid ? '✓ Đã đóng' : '✗ Chưa đóng' },
                  { label: 'Yêu cầu khác', value: viewItem.otherRequest || 'Không có' },
                  { label: 'Ngày đăng ký', value: formatDateTime(viewItem.submittedAt) },
                ].map((f, i) => (
                  <div key={i} style={{ fontSize: '0.88rem' }}>
                    <div style={{ color: 'var(--text-tertiary)', marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontWeight: 500 }}>{f.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewItem(null)}>Đóng</button>
              {viewItem.status === 'pending' && (
                <>
                  <button className="btn btn-danger btn-sm" onClick={() => { handleReject(viewItem.id); setViewItem(null); }}>Từ chối</button>
                  <button className="btn btn-primary" onClick={() => { handleConfirm(viewItem.id); setViewItem(null); }}><FiCheck size={14} /> Xác nhận</button>
                </>
              )}
              <button className="btn btn-ghost" onClick={async () => {
                if (!viewItem.feePaid) await handleMarkPaid(viewItem.id);
                printPDF(generateReceiptHTML(viewItem));
              }}><FiPrinter size={14} /> In phiếu thu</button>
            </div>
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
                <div className="confirm-message">Xóa hồ sơ đăng ký thi của <strong>{deleteConfirm.fullName}</strong>? Hành động này không thể hoàn tác.</div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Hủy</button>
                  <button className="btn btn-danger" onClick={handleDelete}><FiTrash2 size={14} /> Xóa</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
