import { useState } from 'react';
import { FiCalendar, FiPlus, FiX, FiCheck, FiEdit2, FiTrash2, FiDollarSign } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/helpers';

const mockSessions = [
  { id: 1, code: 'DTP-2026-01', name: 'Đợt thanh toán Q1/2026', fromDate: '2026-01-01', toDate: '2026-03-31', totalContracts: 5, totalAmount: 12500000, paidAmount: 12500000, status: 'closed' },
  { id: 2, code: 'DTP-2026-02', name: 'Đợt thanh toán Q2/2026 (tháng 4)', fromDate: '2026-04-01', toDate: '2026-04-30', totalContracts: 3, totalAmount: 5950000, paidAmount: 2000000, status: 'open' },
];

const STATUS_MAP = {
  open: { label: 'Đang mở', cls: 'badge-active' },
  closed: { label: 'Đã đóng', cls: 'badge-inactive' },
  processing: { label: 'Đang xử lý', cls: 'badge-warning' },
};

export default function PaymentSessionsPage() {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', fromDate: '', toDate: '', status: 'open' });

  const openAdd = () => {
    const next = `DTP-2026-${String(sessions.length + 1).padStart(2, '0')}`;
    setEditItem(null);
    setForm({ code: next, name: '', fromDate: '', toDate: '', totalContracts: 0, totalAmount: 0, paidAmount: 0, status: 'open' });
    setModalOpen(true);
  };
  const openEdit = (s) => { setEditItem(s); setForm({ ...s }); setModalOpen(true); };
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (editItem) {
      setSessions(prev => prev.map(s => s.id === editItem.id ? { ...s, ...form } : s));
      toast.success('Cập nhật thành công', '');
    } else {
      setSessions(prev => [...prev, { ...form, id: Date.now(), totalContracts: 0, totalAmount: 0, paidAmount: 0 }]);
      toast.success('Thêm thành công', 'Đã tạo đợt thanh toán mới');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    setSessions(prev => prev.filter(s => s.id !== deleteConfirm.id));
    toast.success('Đã xóa', '');
    setDeleteConfirm(null);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiCalendar /> Quản lý đợt thanh toán</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}><FiPlus size={16} /> Tạo đợt mới</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng đợt thanh toán', value: sessions.length, color: 'var(--primary-400)' },
          { label: 'Tổng giá trị hợp đồng', value: formatCurrency(sessions.reduce((s, x) => s + x.totalAmount, 0)), color: 'var(--warning-400)' },
          { label: 'Đã thanh toán', value: formatCurrency(sessions.reduce((s, x) => s + x.paidAmount, 0)), color: 'var(--success-400)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* List as cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sessions.map(s => {
          const pct = s.totalAmount > 0 ? Math.round((s.paidAmount / s.totalAmount) * 100) : 0;
          return (
            <div key={s.id} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <code style={{ color: 'var(--primary-400)', fontWeight: 700 }}>{s.code}</code>
                    <span className={`badge ${STATUS_MAP[s.status]?.cls}`}>{STATUS_MAP[s.status]?.label}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {formatDate(s.fromDate)} — {formatDate(s.toDate)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-icon-sm" title="Sửa" onClick={() => openEdit(s)}><FiEdit2 size={14} style={{ color: 'var(--primary-400)' }} /></button>
                  <button className="btn btn-ghost btn-icon-sm" title="Xóa" onClick={() => setDeleteConfirm(s)}><FiTrash2 size={14} style={{ color: 'var(--danger-400)' }} /></button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 12, fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--text-tertiary)', marginBottom: 2 }}>Số hợp đồng</div>
                  <div style={{ fontWeight: 700 }}>{s.totalContracts}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-tertiary)', marginBottom: 2 }}>Tổng giá trị</div>
                  <div style={{ fontWeight: 700 }}>{formatCurrency(s.totalAmount)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-tertiary)', marginBottom: 2 }}>Đã thanh toán</div>
                  <div style={{ fontWeight: 700, color: 'var(--success-500)' }}>{formatCurrency(s.paidAmount)}</div>
                </div>
              </div>
              <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--success-500)', borderRadius: 999, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, textAlign: 'right' }}>{pct}% đã thanh toán</div>
            </div>
          );
        })}
        {sessions.length === 0 && (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <FiCalendar size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>Chưa có đợt thanh toán nào</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Cập nhật đợt thanh toán' : 'Tạo đợt thanh toán mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { k: 'code', label: 'Mã đợt', placeholder: 'VD: DTP-2026-03' },
                  { k: 'name', label: 'Tên đợt', placeholder: 'VD: Đợt thanh toán Q3/2026' },
                ].map(f => (
                  <div key={f.k} className="form-group">
                    <label className="form-label">{f.label} <span className="required">*</span></label>
                    <input className="form-input" value={form[f.k] || ''} onChange={e => setField(f.k, e.target.value)} placeholder={f.placeholder} />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Từ ngày</label>
                    <input className="form-input" type="date" value={form.fromDate || ''} onChange={e => setField('fromDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đến ngày</label>
                    <input className="form-input" type="date" value={form.toDate || ''} onChange={e => setField('toDate', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-select" value={form.status} onChange={e => setField('status', e.target.value)}>
                    {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}><FiCheck size={16} /> {editItem ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-dialog">
                <div className="confirm-icon danger"><FiTrash2 /></div>
                <div className="confirm-title">Xác nhận xóa</div>
                <div className="confirm-message">Xóa đợt <strong>{deleteConfirm.name}</strong>?</div>
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
