import { useState, useEffect } from 'react';
import { FiClipboard, FiBook, FiUsers, FiDollarSign, FiCalendar, FiChevronRight, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { courseClassesApi, subjectsApi, instructorsApi, classroomsApi } from '../../../services/api';

const STATUS_MAP = {
  upcoming: { label: 'Chưa bắt đầu', cls: 'badge-warning' },
  active: { label: 'Đang dạy', cls: 'badge-active' },
  completed: { label: 'Hoàn thành', cls: 'badge-success' },
};

export default function CourseClassesPage() {
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({});

  const [catalogs, setCatalogs] = useState({ subjects: [], instructors: [], rooms: [] });

  useEffect(() => {
    Promise.all([
      courseClassesApi.getAll(),
      subjectsApi.getAll(),
      instructorsApi.getAll(),
      classroomsApi.getAll()
    ]).then(([classesRes, subjects, instructors, rooms]) => {
      setClasses(classesRes || []);
      setCatalogs({ subjects: subjects || [], instructors: instructors || [], rooms: rooms || [] });
    });
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ code: '', name: '', subjectId: '', instructorId: '', roomId: '', totalSessions: 10, completedSessions: 0, totalStudents: 0, ratePerSession: 100000, startDate: '', status: 'upcoming' });
    setModalOpen(true);
  };
  const openEdit = (c) => { setEditItem(c); setForm({ ...c }); setModalOpen(true); };
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const subject = catalogs.subjects.find(s => String(s.id) === String(form.subjectId));
    const instructor = catalogs.instructors.find(i => String(i.id) === String(form.instructorId));
    const room = catalogs.rooms.find(r => String(r.id) === String(form.roomId));
    const payload = {
      ...form,
      subjectName: subject?.name || 'Môn học khác',
      instructorName: instructor?.fullName || 'Chưa phân công',
      roomName: room?.name || 'Chưa xếp phòng',
      totalPayment: (form.totalSessions || 0) * (form.ratePerSession || 0),
    };
    
    try {
      if (editItem) {
        await courseClassesApi.update(editItem.id, payload);
        toast.success('Cập nhật thành công');
      } else {
        await courseClassesApi.create(payload);
        toast.success('Thêm thành công');
      }
      const res = await courseClassesApi.getAll();
      setClasses(res || []);
      setModalOpen(false);
    } catch (e) {
      toast.error('Lỗi lưu dữ liệu', e.message);
    }
  };

  const handleDelete = async () => {
    try {
      await courseClassesApi.delete(deleteConfirm.id);
      setClasses(prev => prev.filter(c => c.id !== deleteConfirm.id));
      if (selected?.id === deleteConfirm.id) setSelected(null);
      toast.success('Đã xóa lớp học phần');
      setDeleteConfirm(null);
    } catch (e) {
      toast.error('Lỗi khi xóa', e.message);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiClipboard /> Quản lý lớp học phần</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}><FiPlus size={16} /> Thêm lớp học phần</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng lớp HP', value: classes.length, color: 'var(--primary-400)' },
          { label: 'Đang dạy', value: classes.filter(c => c.status === 'active').length, color: 'var(--success-400)' },
          { label: 'Tổng tiết dạy', value: classes.reduce((s, c) => s + c.completedSessions, 0), color: 'var(--accent-400)' },
          { label: 'Tổng thanh toán GV', value: formatCurrency(classes.reduce((s, c) => s + (c.completedSessions * c.ratePerSession), 0)), color: 'var(--warning-400)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 24 }}>
        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', minWidth: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>STT</th>
                  <th>Mã lớp</th>
                  <th>Tên lớp HP</th>
                  <th>Giảng viên</th>
                  <th>Phòng</th>
                  <th style={{ textAlign: 'center' }}>Tiến độ</th>
                  <th style={{ textAlign: 'right' }}>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'center', width: 100 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c, i) => {
                  const pct = c.totalSessions > 0 ? Math.round((c.completedSessions / c.totalSessions) * 100) : 0;
                  return (
                    <tr key={c.id} onClick={() => setSelected(c === selected ? null : c)} style={{ cursor: 'pointer', background: selected?.id === c.id ? 'rgba(59,130,246,0.05)' : '' }}>
                      <td style={{ color: 'var(--text-tertiary)' }}>{i + 1}</td>
                      <td><code style={{ color: 'var(--primary-400)', fontSize: '0.78rem' }}>{c.code}</code></td>
                      <td><strong style={{ fontSize: '0.9rem' }}>{c.name}</strong></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.instructorName}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.roomName}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 5, background: 'var(--border-color)', borderRadius: 999 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--success-500)' : 'var(--primary-400)', borderRadius: 999 }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', minWidth: 55 }}>{c.completedSessions}/{c.totalSessions} tiết</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success-500)' }}>
                        {formatCurrency(c.completedSessions * c.ratePerSession)}
                      </td>
                      <td><span className={`badge ${STATUS_MAP[c.status]?.cls}`}>{STATUS_MAP[c.status]?.label}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button className="btn btn-ghost btn-icon-sm" title="Sửa" onClick={() => openEdit(c)}><FiEdit2 size={14} style={{ color: 'var(--primary-400)' }} /></button>
                          <button className="btn btn-ghost btn-icon-sm" title="Xóa" onClick={() => setDeleteConfirm(c)}><FiTrash2 size={14} style={{ color: 'var(--danger-400)' }} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="card" style={{ padding: 20, alignSelf: 'start', position: 'sticky', top: 80, minWidth: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700 }}>Chi tiết lớp học phần</div>
              <button className="btn btn-ghost btn-icon-sm" onClick={() => setSelected(null)}><FiX size={14} /></button>
            </div>
            {[
              { label: 'Mã lớp', value: selected.code },
              { label: 'Tên lớp HP', value: selected.name },
              { label: 'Môn học', value: selected.subjectName },
              { label: 'Giảng viên', value: selected.instructorName },
              { label: 'Phòng học', value: selected.roomName },
              { label: 'Ngày bắt đầu', value: formatDate(selected.startDate) },
              { label: 'Số học viên', value: selected.totalStudents + ' HV' },
              { label: 'Tổng số tiết', value: selected.totalSessions + ' tiết' },
              { label: 'Đã dạy', value: selected.completedSessions + ' tiết' },
              { label: 'Đơn giá/tiết', value: formatCurrency(selected.ratePerSession) },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>{f.label}</span>
                <span style={{ fontWeight: 500 }}>{f.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: 700 }}>Thanh toán GV</span>
              <span style={{ fontWeight: 800, color: 'var(--success-500)' }}>{formatCurrency(selected.completedSessions * selected.ratePerSession)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
              <span>Tổng hợp đồng</span>
              <span>{formatCurrency(selected.totalPayment)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Cập nhật lớp học phần' : 'Thêm lớp học phần mới'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { k: 'code', label: 'Mã lớp HP', span: 1, ph: 'HP-TINH-HOC-2026-01' },
                  { k: 'name', label: 'Tên lớp HP', span: 2, ph: 'Tin học đại cương - K25 - Nhóm 1' },
                ].map(f => (
                  <div key={f.k} className="form-group" style={{ gridColumn: `span ${f.span}` }}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" value={form[f.k] || ''} onChange={e => setField(f.k, e.target.value)} placeholder={f.ph} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Môn học</label>
                  <select className="form-select" value={form.subjectId || ''} onChange={e => setField('subjectId', e.target.value)}>
                    <option value="">-- Chọn môn --</option>
                    {catalogs.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Giảng viên</label>
                  <select className="form-select" value={form.instructorId || ''} onChange={e => setField('instructorId', e.target.value)}>
                    <option value="">-- Chọn GV --</option>
                    {catalogs.instructors.map(i => <option key={i.id} value={i.id}>{i.fullName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phòng học</label>
                  <select className="form-select" value={form.roomId || ''} onChange={e => setField('roomId', e.target.value)}>
                    <option value="">-- Chọn phòng --</option>
                    {catalogs.rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày bắt đầu</label>
                  <input className="form-input" type="date" value={form.startDate || ''} onChange={e => setField('startDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tổng số tiết</label>
                  <input className="form-input" type="number" min={0} value={form.totalSessions || 0} onChange={e => setField('totalSessions', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số tiết đã dạy</label>
                  <input className="form-input" type="number" min={0} value={form.completedSessions || 0} onChange={e => setField('completedSessions', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn giá / tiết (VNĐ)</label>
                  <input className="form-input" type="number" min={0} value={form.ratePerSession || 0} onChange={e => setField('ratePerSession', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-select" value={form.status || 'upcoming'} onChange={e => setField('status', e.target.value)}>
                    {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Tổng thanh toán GV: <strong style={{ color: 'var(--success-500)' }}>{formatCurrency((form.completedSessions || 0) * (form.ratePerSession || 0))}</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}><FiCheck size={16} /> {editItem ? 'Cập nhật' : 'Thêm mới'}</button>
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
                <div className="confirm-message">Xóa lớp học phần <strong>{deleteConfirm.name}</strong>?</div>
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
