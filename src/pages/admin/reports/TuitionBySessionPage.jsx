import { useState, useEffect } from 'react';
import { FiBarChart2, FiDownload, FiRotateCcw } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { formatCurrency, exportToExcel } from '../../../utils/helpers';
import { registrationsApi, examSessionsApi, certificatesApi } from '../../../services/api';


export default function TuitionBySessionPage() {
  const toast = useToast();
  const [filterSession, setFilterSession] = useState('');
  const [sessionData, setSessionData] = useState([]);
  const [sessionsList, setSessionsList] = useState([]);

  useEffect(() => {
    async function loadStats() {
      const [regs, sessions, certs] = await Promise.all([
        registrationsApi.getAll(),
        examSessionsApi.getAll(),
        certificatesApi.getAll()
      ]);
      const validRegs = (regs || []).filter(r => r.examSessionId);
      const sMap = (sessions || []).reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});
      const cMap = (certs || []).reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
      
      const grouped = {};
      validRegs.forEach(r => {
        const key = `${r.examSessionId}-${r.certificateId}`;
        if (!grouped[key]) {
          grouped[key] = {
            sessionId: r.examSessionId,
            sessionName: sMap[r.examSessionId] || 'Không xác định',
            certId: r.certificateId,
            certName: cMap[r.certificateId]?.name || 'Không xác định',
            totalStudents: 0,
            paidCount: 0,
            unpaidCount: 0,
            totalAmount: 0,
            collectedAmount: 0
          };
        }
        const fee = r.fee || cMap[r.certificateId]?.fee || 350000;
        grouped[key].totalStudents++;
        grouped[key].totalAmount += fee;
        if (r.feePaid || r.tuitionPaid || r.paid) {
          grouped[key].paidCount++;
          grouped[key].collectedAmount += fee;
        } else {
          grouped[key].unpaidCount++;
        }
      });
      const dataArr = Object.values(grouped);
      setSessionData(dataArr);
      const uniqueSess = [...new Set(dataArr.map(d => d.sessionId))].map(id => ({
        id, name: dataArr.find(d => d.sessionId === id)?.sessionName
      }));
      setSessionsList(uniqueSess);
    }
    loadStats();
  }, []);

  const filtered = filterSession ? sessionData.filter(d => String(d.sessionId) === filterSession) : sessionData;

  const handleExport = () => {
    const success = exportToExcel(filtered, 'ThongKe_HocPhi_TheoDot');
    if (success) toast.success('Xuất file thành công', '');
  };

  const totals = {
    students: filtered.reduce((s, d) => s + d.totalStudents, 0),
    paid: filtered.reduce((s, d) => s + d.paidCount, 0),
    unpaid: filtered.reduce((s, d) => s + d.unpaidCount, 0),
    total: filtered.reduce((s, d) => s + d.totalAmount, 0),
    collected: filtered.reduce((s, d) => s + d.collectedAmount, 0),
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiBarChart2 /> Thống kê học phí theo đợt</h1>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={handleExport}><FiDownload size={16} /> Xuất Excel</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng thí sinh', value: totals.students, color: 'var(--primary-400)' },
          { label: 'Đã đóng HP', value: totals.paid, color: 'var(--success-400)' },
          { label: 'Chưa đóng HP', value: totals.unpaid, color: 'var(--danger-400)' },
          { label: 'Tổng HP cần thu', value: formatCurrency(totals.total), color: 'var(--warning-400)' },
          { label: 'Đã thu được', value: formatCurrency(totals.collected), color: 'var(--accent-400)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="toolbar">
        <div className="toolbar-left" style={{ gap: 10 }}>
          <select className="form-select" value={filterSession} onChange={e => setFilterSession(e.target.value)} style={{ width: 220 }}>
            <option value="">Tất cả đợt thi</option>
            {sessionsList.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
          </select>
          {filterSession && (
            <button className="btn btn-ghost btn-sm" onClick={() => setFilterSession('')}><FiRotateCcw size={14} /> Xóa lọc</button>
          )}
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>STT</th>
              <th>Đợt thi</th>
              <th>Loại chứng chỉ</th>
              <th style={{ textAlign: 'center' }}>Tổng TS</th>
              <th style={{ textAlign: 'center' }}>Đã đóng HP</th>
              <th style={{ textAlign: 'center' }}>Chưa đóng</th>
              <th style={{ textAlign: 'right' }}>Tổng HP cần thu</th>
              <th style={{ textAlign: 'right' }}>Đã thu</th>
              <th style={{ textAlign: 'center' }}>Tiến độ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const pct = d.totalAmount > 0 ? Math.round((d.collectedAmount / d.totalAmount) * 100) : 0;
              return (
                <tr key={`${d.sessionId}-${d.certId}`}>
                  <td style={{ color: 'var(--text-tertiary)' }}>{i + 1}</td>
                  <td><strong>{d.sessionName}</strong></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{d.certName}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{d.totalStudents}</td>
                  <td style={{ textAlign: 'center', color: 'var(--success-500)', fontWeight: 600 }}>{d.paidCount}</td>
                  <td style={{ textAlign: 'center', color: d.unpaidCount > 0 ? 'var(--danger-400)' : 'var(--text-tertiary)', fontWeight: 600 }}>{d.unpaidCount}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(d.totalAmount)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success-500)' }}>{formatCurrency(d.collectedAmount)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border-color)', borderRadius: 999 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? 'var(--success-500)' : pct >= 50 ? 'var(--warning-400)' : 'var(--danger-400)', borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, minWidth: 35, color: 'var(--text-secondary)' }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Totals row */}
          <tfoot>
            <tr style={{ background: 'var(--bg-glass)' }}>
              <td colSpan={3} style={{ fontWeight: 700, padding: '10px 12px' }}>TỔNG CỘNG</td>
              <td style={{ textAlign: 'center', fontWeight: 800 }}>{totals.students}</td>
              <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--success-500)' }}>{totals.paid}</td>
              <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--danger-400)' }}>{totals.unpaid}</td>
              <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatCurrency(totals.total)}</td>
              <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--success-500)' }}>{formatCurrency(totals.collected)}</td>
              <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary-400)' }}>
                {totals.total > 0 ? Math.round((totals.collected / totals.total) * 100) : 0}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
