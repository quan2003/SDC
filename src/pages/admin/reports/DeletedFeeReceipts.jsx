import { useState } from 'react';
import { FiFileText, FiDownload, FiTrash2, FiRotateCcw, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { formatCurrency, formatDateTime } from '../../../utils/helpers';

const mockDeleted = [
  { id: 1, receiptNo: 'LPT-2026-002', studentName: 'Lê Thị Hoa', amount: 350000, certName: 'CNTT cơ bản', deletedAt: '2026-04-09 11:00:00', deletedBy: 'staff1', reason: 'Học viên chưa đủ điều kiện dự thi' },
  { id: 2, receiptNo: 'LPT-2026-007', studentName: 'Phạm Minh Tuấn', amount: 500000, certName: 'CNTT nâng cao', deletedAt: '2026-04-12 16:45:00', deletedBy: 'admin', reason: 'Nhập nhầm chứng chỉ' },
];

export default function DeletedFeeReceipts() {
  const toast = useToast();
  const [records] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filtered = records.filter(r => {
    if (fromDate && r.deletedAt < fromDate) return false;
    if (toDate && r.deletedAt > toDate + ' 23:59:59') return false;
    return true;
  });

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiTrash2 /> Phiếu thu lệ phí thi đã xóa</h1>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => toast.info('Xuất Excel', 'Đang xuất...')}><FiDownload size={16} /> Xuất Excel</button>
        </div>
      </div>

      <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, color: 'var(--danger-400)' }}>
        <FiAlertCircle size={16} />
        <span style={{ fontSize: '0.88rem' }}>Danh sách phiếu thu lệ phí thi đã bị xóa. Chỉ dùng để đối chiếu và kiểm toán nội bộ.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng phiếu đã xóa', value: records.length, color: 'var(--danger-400)' },
          { label: 'Tổng lệ phí bị xóa', value: formatCurrency(records.reduce((s, r) => s + r.amount, 0)), color: 'var(--warning-400)' },
          { label: 'Giai đoạn đang lọc', value: filtered.length + ' phiếu', color: 'var(--primary-400)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="toolbar-left" style={{ gap: 10 }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Từ ngày:</label>
          <input className="form-input" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ width: 150 }} />
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Đến ngày:</label>
          <input className="form-input" type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ width: 150 }} />
          {(fromDate || toDate) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFromDate(''); setToDate(''); }}><FiRotateCcw size={14} /> Xóa lọc</button>
          )}
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>STT</th>
              <th>Số phiếu thu</th>
              <th>Học viên</th>
              <th>Chứng chỉ</th>
              <th>Lệ phí</th>
              <th>Thời gian xóa</th>
              <th>Người xóa</th>
              <th>Lý do</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Không có phiếu lệ phí nào bị xóa trong giai đoạn này</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={r.id}>
                <td style={{ color: 'var(--text-tertiary)' }}>{i + 1}</td>
                <td><code style={{ color: 'var(--danger-400)', fontWeight: 600 }}>{r.receiptNo}</code></td>
                <td><strong>{r.studentName}</strong></td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.certName}</td>
                <td style={{ fontWeight: 700, color: 'var(--danger-400)' }}>-{formatCurrency(r.amount)}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDateTime(r.deletedAt)}</td>
                <td><span className="badge badge-warning">{r.deletedBy}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
