import { useState, useEffect, useCallback } from 'react';
import { FiFileText, FiPlus, FiX, FiCheck, FiEdit2, FiTrash2, FiEye, FiPrinter } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { printPDF } from '../../../utils/pdfGenerator';
import { contractsApi } from '../../../services/api';


const STATUS_MAP = {
  pending: { label: 'Chờ ký', cls: 'badge-warning' },
  signed: { label: 'Đã ký', cls: 'badge-active' },
  liquidated: { label: 'Đã thanh lý', cls: 'badge-success' },
  cancelled: { label: 'Đã hủy', cls: 'badge-inactive' },
};

export default function ContractsPage() {
  const toast = useToast();
  const [contracts, setContracts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    contractsApi.getAll().then(res => setContracts(res || []));
  }, []);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [form, setForm] = useState({
    contractNo: '', instructorId: '', type: 'Giảng dạy',
    className: '', lessons: 0, ratePerLesson: 100000,
    totalAmount: 0, signDate: '', status: 'pending',
  });

  const instructors = [];
  const classes = [];

  useEffect(() => {
    setForm(f => ({ ...f, totalAmount: f.lessons * f.ratePerLesson }));
  }, [form.lessons, form.ratePerLesson]);

  const filtered = contracts.filter(c => {
    const matchSearch = !search || c.contractNo.toLowerCase().includes(search.toLowerCase()) || c.instructorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    const nextNo = `HĐ-2026-${String(contracts.length + 1).padStart(3, '0')}`;
    setEditItem(null);
    setForm({ contractNo: nextNo, instructorId: '', type: 'Giảng dạy', className: '', lessons: 0, ratePerLesson: 100000, totalAmount: 0, signDate: new Date().toISOString().slice(0, 10), status: 'pending' });
    setModalOpen(true);
  };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setModalOpen(true); };

  const handleSave = () => {
    const instructor = instructors.find(i => String(i.id) === String(form.instructorId));
    const payload = { ...form, instructorName: instructor ? instructor.fullName : form.instructorName, totalAmount: form.lessons * form.ratePerLesson };
    if (editItem) {
      setContracts(prev => prev.map(c => c.id === editItem.id ? { ...c, ...payload } : c));
      toast.success('Cập nhật thành công', 'Đã cập nhật hợp đồng');
    } else {
      setContracts(prev => [...prev, { ...payload, id: Date.now() }]);
      toast.success('Thêm thành công', 'Đã tạo hợp đồng mới');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    setContracts(prev => prev.filter(c => c.id !== deleteConfirm.id));
    toast.success('Đã xóa', 'Đã xóa hợp đồng');
    setDeleteConfirm(null);
  };

  const handlePrintContract = (c) => {
    const html = `
      <div style="font-family: 'Times New Roman', serif; padding: 40px;">
        <h2 style="text-align: center;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br><small style="font-weight: normal;">Độc lập - Tự do - Hạnh phúc</small></h2>
        <div style="text-align: center; border-bottom: 2px solid #000; width: 30%; margin: 10px auto 30px;"></div>
        <h1 style="text-align: center;">HỢP ĐỒNG GIAO KHOÁN CHUYÊN MÔN</h1>
        <p style="text-align: center; font-style: italic;">Số: ${c.contractNo}</p>
        <div style="margin-top: 30px; line-height: 1.6;">
          <p>Hôm nay, ngày ${c.signDate}, tại Trung tâm Phát triển Phần mềm - Đại học Đà Nẵng, chúng tôi gồm có:</p>
          <p><strong>BÊN A: Trung tâm Phát triển Phần mềm</strong></p>
          <p>Đại diện: ............................................... Chức vụ: Giám đốc</p>
          <p><strong>BÊN B: ${c.instructorName}</strong></p>
          <p>Sau khi thỏa thuận, hai bên đồng ý ký kết hợp đồng ${c.type.toLowerCase()} với các điều khoản sau:</p>
          <p><strong>Điều 1. Nội dung công việc:</strong> Bên A giao cho Bên B thực hiện ${c.type.toLowerCase()} cho lớp/đợt: <strong>${c.className}</strong>.</p>
          <p><strong>Điều 2. Thời gian & khối lượng:</strong> Tổng số khối lượng thực hiện là <strong>${c.lessons} tiết/buổi</strong>.</p>
          <p><strong>Điều 3. Giá trị hợp đồng:</strong></p>
          <ul>
            <li>Đơn giá quy đổi: ${formatCurrency(c.ratePerLesson)} / tiết(buổi)</li>
            <li>Tổng giá trị thanh toán: <strong>${formatCurrency(c.totalAmount)}</strong></li>
          </ul>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 50px; text-align: center;">
          <div><strong>ĐẠI DIỆN BÊN A</strong></div>
          <div><strong>ĐẠI DIỆN BÊN B</strong><br><br><br><br><br>${c.instructorName}</div>
        </div>
      </div>
    `;
    printPDF(html);
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiFileText /> Quản lý hợp đồng thanh toán</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}><FiPlus size={16} /> Tạo hợp đồng</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng hợp đồng', value: contracts.length, color: 'var(--primary-400)' },
          { label: 'Chờ ký', value: contracts.filter(c => c.status === 'pending').length, color: 'var(--warning-400)' },
          { label: 'Đã ký', value: contracts.filter(c => c.status === 'signed').length, color: 'var(--success-400)' },
          { label: 'Tổng giá trị', value: formatCurrency(contracts.reduce((s, c) => s + (c.totalAmount || 0), 0)), color: 'var(--accent-400)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-bar" style={{ minWidth: 280 }}>
            <input className="form-input" placeholder="Tìm số hợp đồng, tên giảng viên..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 14 }} />
          </div>
          <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Tổng: <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> hợp đồng</span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>STT</th>
                <th>Số hợp đồng</th>
                <th>Giảng viên</th>
                <th>Loại hợp đồng</th>
                <th>Lớp / Đối tượng</th>
                <th>Số tiết</th>
                <th>Đơn giá</th>
                <th>Tổng tiền</th>
                <th>Ngày ký</th>
                <th>Trạng thái</th>
                <th style={{ width: 120, textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Không có dữ liệu</td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-tertiary)' }}>{i + 1}</td>
                  <td><code style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{c.contractNo}</code></td>
                  <td><strong>{c.instructorName}</strong></td>
                  <td><span style={{ color: 'var(--accent-400)' }}>{c.type}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.className}</td>
                  <td style={{ textAlign: 'center' }}>{c.lessons}</td>
                  <td>{formatCurrency(c.ratePerLesson)}</td>
                  <td><strong style={{ color: 'var(--success-500)' }}>{formatCurrency(c.totalAmount)}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(c.signDate)}</td>
                  <td><span className={`badge ${STATUS_MAP[c.status]?.cls}`}>{STATUS_MAP[c.status]?.label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-icon-sm" title="Sửa" onClick={() => openEdit(c)}><FiEdit2 size={14} style={{ color: 'var(--primary-400)' }} /></button>
                      <button className="btn btn-ghost btn-icon-sm" title="In hợp đồng" onClick={() => handlePrintContract(c)}><FiPrinter size={14} style={{ color: 'var(--accent-400)' }} /></button>
                      <button className="btn btn-ghost btn-icon-sm" title="Xóa" onClick={() => setDeleteConfirm(c)}><FiTrash2 size={14} style={{ color: 'var(--danger-400)' }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Cập nhật hợp đồng' : 'Tạo hợp đồng mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Số hợp đồng <span className="required">*</span></label>
                  <input className="form-input" value={form.contractNo} onChange={e => setField('contractNo', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Loại hợp đồng</label>
                  <select className="form-select" value={form.type} onChange={e => setField('type', e.target.value)}>
                    <option>Giảng dạy</option><option>Coi thi</option><option>Chấm thi</option><option>Khác</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Giảng viên <span className="required">*</span></label>
                  <select className="form-select" value={form.instructorId} onChange={e => setField('instructorId', e.target.value)}>
                    <option value="">-- Chọn giảng viên --</option>
                    {instructors.map(i => <option key={i.id} value={i.id}>{i.fullName} ({i.code})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Lớp / Đối tượng hợp đồng</label>
                  <input className="form-input" placeholder="Tên lớp hoặc mô tả đối tượng..." value={form.className} onChange={e => setField('className', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số tiết / buổi</label>
                  <input className="form-input" type="number" min={0} value={form.lessons} onChange={e => setField('lessons', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn giá (VNĐ)</label>
                  <input className="form-input" type="number" min={0} value={form.ratePerLesson} onChange={e => setField('ratePerLesson', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tổng giá trị</label>
                  <input className="form-input" value={formatCurrency(form.lessons * form.ratePerLesson)} readOnly style={{ background: 'var(--bg-glass)', fontWeight: 700, color: 'var(--success-500)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày ký</label>
                  <input className="form-input" type="date" value={form.signDate} onChange={e => setField('signDate', e.target.value)} />
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
              <button className="btn btn-primary" onClick={handleSave}><FiCheck size={16} /> {editItem ? 'Cập nhật' : 'Tạo hợp đồng'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-dialog">
                <div className="confirm-icon danger"><FiTrash2 /></div>
                <div className="confirm-title">Xác nhận xóa</div>
                <div className="confirm-message">Xóa hợp đồng <strong>{deleteConfirm.contractNo}</strong>?</div>
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
