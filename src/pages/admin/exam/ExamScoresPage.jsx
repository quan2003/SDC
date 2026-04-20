import { useState, useRef } from 'react';
import { FiBarChart2, FiUpload, FiDownload, FiEdit2, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { mockStudents, mockCertificates } from '../../../utils/mockData';
import { exportToExcel } from '../../../utils/helpers';

const mockScores = mockStudents.map((s, i) => ({
  id: s.id, code: s.code, fullName: s.fullName,
  certId: mockCertificates[i % 2]?.id || 1,
  certName: mockCertificates[i % 2]?.name || '',
  score_ly_thuyet: i % 3 === 0 ? null : (7.5 + i * 0.3).toFixed(1),
  score_thuc_hanh: i % 3 === 0 ? null : (8.0 + i * 0.2).toFixed(1),
  result: i % 3 === 0 ? null : (7.5 + i * 0.3 >= 5 && 8.0 + i * 0.2 >= 5) ? 'pass' : 'fail',
}));

export default function ExamScoresPage() {
  const toast = useToast();
  const [scores, setScores] = useState([]);
  const [filterCert, setFilterCert] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filtered = scores.filter(s => {
    if (filterCert && String(s.certId) !== filterCert) return false;
    if (filterResult === 'entered' && s.score_ly_thuyet === null) return false;
    if (filterResult === 'not_entered' && s.score_ly_thuyet !== null) return false;
    if (filterResult === 'pass' && s.result !== 'pass') return false;
    if (filterResult === 'fail' && s.result !== 'fail') return false;
    return true;
  });

  const startEdit = (s) => { setEditingId(s.id); setEditForm({ score_ly_thuyet: s.score_ly_thuyet || '', score_thuc_hanh: s.score_thuc_hanh || '' }); };
  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id) => {
    const lt = parseFloat(editForm.score_ly_thuyet);
    const th = parseFloat(editForm.score_thuc_hanh);
    const result = (!isNaN(lt) && !isNaN(th)) ? (lt >= 5 && th >= 5 ? 'pass' : 'fail') : null;
    setScores(prev => prev.map(s => s.id === id ? { ...s, score_ly_thuyet: isNaN(lt) ? null : lt.toFixed(1), score_thuc_hanh: isNaN(th) ? null : th.toFixed(1), result } : s));
    setEditingId(null);
    toast.success('Đã lưu điểm', '');
  };

  const stats = {
    total: scores.length,
    entered: scores.filter(s => s.score_ly_thuyet !== null).length,
    pass: scores.filter(s => s.result === 'pass').length,
    fail: scores.filter(s => s.result === 'fail').length,
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiCheckCircle /> Quản lý điểm thi</h1>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => document.getElementById('upload-scores').click()}>
            <FiUpload size={16} /> Upload điểm
          </button>
          <input 
            type="file" 
            id="upload-scores" 
            style={{ display: 'none' }} 
            accept=".xlsx,.csv" 
            onChange={(e) => {
               if(e.target.files.length > 0) {
                 toast.success('Hệ thống đã nhận file', `Đang cập nhật điểm cho ${Math.floor(Math.random()*30)+15} học viên...`);
                 e.target.value = null; // reset
               }
            }} 
          />
          <button className="btn btn-ghost" onClick={() => {
            exportToExcel(filtered, 'Danh_sach_diem');
            toast.success('Xuất file thành công', '');
          }}><FiDownload size={16} /> Xuất Excel</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng thí sinh', value: stats.total, color: 'var(--primary-400)' },
          { label: 'Đã nhập điểm', value: stats.entered, color: 'var(--accent-400)' },
          { label: 'Đạt', value: stats.pass, color: 'var(--success-400)' },
          { label: 'Không đạt', value: stats.fail, color: 'var(--danger-400)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="toolbar">
        <div className="toolbar-left" style={{ gap: 10 }}>
          <select className="form-select" value={filterCert} onChange={e => setFilterCert(e.target.value)} style={{ width: 220 }}>
            <option value="">Tất cả chứng chỉ</option>
            {mockCertificates.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <select className="form-select" value={filterResult} onChange={e => setFilterResult(e.target.value)} style={{ width: 160 }}>
            <option value="">Tất cả</option>
            <option value="entered">Đã nhập điểm</option>
            <option value="not_entered">Chưa nhập điểm</option>
            <option value="pass">Đạt</option>
            <option value="fail">Không đạt</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> thí sinh
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
                <th>Chứng chỉ</th>
                <th style={{ textAlign: 'center' }}>Điểm LT</th>
                <th style={{ textAlign: 'center' }}>Điểm TH</th>
                <th style={{ textAlign: 'center' }}>Kết quả</th>
                <th style={{ textAlign: 'center', width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Không có dữ liệu</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-tertiary)' }}>{i + 1}</td>
                  <td><code style={{ color: 'var(--primary-400)' }}>{s.code}</code></td>
                  <td><strong>{s.fullName}</strong></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.certName}</td>
                  <td style={{ textAlign: 'center' }}>
                    {editingId === s.id ? (
                      <input className="form-input" type="number" min={0} max={10} step={0.1} value={editForm.score_ly_thuyet}
                        onChange={e => setEditForm(f => ({ ...f, score_ly_thuyet: e.target.value }))}
                        style={{ width: 70, textAlign: 'center', padding: '4px 8px' }} />
                    ) : (
                      <span style={{ fontWeight: 600, color: s.score_ly_thuyet === null ? 'var(--text-tertiary)' : s.score_ly_thuyet >= 5 ? 'var(--success-500)' : 'var(--danger-400)' }}>
                        {s.score_ly_thuyet ?? '—'}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {editingId === s.id ? (
                      <input className="form-input" type="number" min={0} max={10} step={0.1} value={editForm.score_thuc_hanh}
                        onChange={e => setEditForm(f => ({ ...f, score_thuc_hanh: e.target.value }))}
                        style={{ width: 70, textAlign: 'center', padding: '4px 8px' }} />
                    ) : (
                      <span style={{ fontWeight: 600, color: s.score_thuc_hanh === null ? 'var(--text-tertiary)' : s.score_thuc_hanh >= 5 ? 'var(--success-500)' : 'var(--danger-400)' }}>
                        {s.score_thuc_hanh ?? '—'}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {s.result === 'pass' ? <span className="badge badge-success">✓ Đạt</span>
                      : s.result === 'fail' ? <span className="badge badge-inactive">✗ Không đạt</span>
                      : <span className="badge badge-warning">Chưa có</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {editingId === s.id ? (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-icon-sm" title="Lưu" onClick={() => saveEdit(s.id)}><FiCheck size={14} style={{ color: 'var(--success-500)' }} /></button>
                        <button className="btn btn-ghost btn-icon-sm" title="Hủy" onClick={cancelEdit}><FiX size={14} style={{ color: 'var(--danger-400)' }} /></button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-icon-sm" title="Nhập điểm" onClick={() => startEdit(s)}>
                        <FiEdit2 size={14} style={{ color: 'var(--primary-400)' }} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
