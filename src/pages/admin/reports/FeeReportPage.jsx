import { useState, useEffect, useMemo } from 'react';
import { FiDollarSign, FiDownload, FiPieChart, FiTrendingUp, FiPrinter } from 'react-icons/fi';
import { registrationsApi } from '../../../services/api';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { printPDF } from '../../../utils/pdfGenerator';

export default function FeeReportPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'paid', 'unpaid'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const regs = await registrationsApi.getAll();
      setData(regs);
    } catch (e) {
      console.error('Error loading report data:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(r => {
      if (filterStatus === 'paid') return r.paid;
      if (filterStatus === 'unpaid') return !r.paid;
      return true;
    });
  }, [data, filterStatus]);

  const stats = useMemo(() => {
    const totalPossible = data.reduce((sum, r) => sum + (r.fee || 0), 0);
    const collected = data.filter(r => r.paid).reduce((sum, r) => sum + (r.fee || 0), 0);
    const pending = totalPossible - collected;
    const paidCount = data.filter(r => r.paid).length;
    const unpaidCount = data.length - paidCount;

    return { totalPossible, collected, pending, paidCount, unpaidCount };
  }, [data]);

  const handlePrint = () => {
    const html = `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; color: #000;">
        <h1 style="text-align: center; margin-bottom: 5px;">BÁO CÁO DOANH THU & HỌC PHÍ</h1>
        <p style="text-align: center; font-style: italic; margin-bottom: 25px;">
          (Dạng: ${filterStatus === 'paid' ? 'Chỉ danh sách đã nộp' : filterStatus === 'unpaid' ? 'Chỉ danh sách chưa nộp' : 'Tất cả'})
        </p>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 1.1rem;">
          <div>
            <p><strong>Ngày lập báo cáo:</strong> ${formatDate(new Date())}</p>
            <p><strong>Tổng số hồ sơ trong danh sách:</strong> ${filteredData.length}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Doanh thu đã thu:</strong> ${formatCurrency(stats.collected)}</p>
            <p><strong>Học phí còn nợ:</strong> ${formatCurrency(stats.pending)}</p>
          </div>
        </div>

        <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; font-size: 11pt;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>STT</th>
              <th>Họ và tên</th>
              <th>Chứng chỉ</th>
              <th>Lệ phí</th>
              <th>Trạng thái</th>
              <th>Ngày sinh</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((r, i) => `
              <tr>
                <td align="center">${i + 1}</td>
                <td>${r.fullName || ''}</td>
                <td>${r.certificateName || ''}</td>
                <td align="right">${formatCurrency(r.fee)}</td>
                <td align="center">${r.paid ? 'Đã nộp' : '<span style="color: red;">Chưa nộp</span>'}</td>
                <td align="center">${formatDate(r.dob)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 40%;">
            <p><strong>Người lập biểu</strong></p>
            <p style="margin-top: 60px;">...................................</p>
          </div>
          <div style="text-align: center; width: 40%;">
            <p><strong>Kế toán trưởng</strong></p>
            <p style="margin-top: 60px;">...................................</p>
          </div>
        </div>
      </div>
    `;
    printPDF(html);
  };

  // stats is now defined above handlePrint

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiDollarSign /> Báo cáo doanh thu & học phí</h1>
        <div className="page-actions" style={{ gap: 12 }}>
           <select 
             className="form-select" 
             value={filterStatus} 
             onChange={e => setFilterStatus(e.target.value)}
             style={{ width: 180 }}
           >
             <option value="all">Tất cả hồ sơ</option>
             <option value="paid">Chỉ người ĐÃ nộp</option>
             <option value="unpaid">Chỉ người CHƯA nộp</option>
           </select>
           <button className="btn btn-primary" onClick={handlePrint}><FiPrinter size={16} /> Xuất PDF</button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon green"><FiTrendingUp /></div>
          <div className="stat-info">
            <div className="stat-label">Doanh thu đã thu</div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(stats.collected)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiDollarSign /></div>
          <div className="stat-info">
            <div className="stat-label">Học phí chờ thu</div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(stats.pending)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><FiPieChart /></div>
          <div className="stat-info">
            <div className="stat-label">Tỷ lệ thanh toán</div>
            <div className="stat-value">
              {((stats.collected / (stats.totalPossible || 1)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 20 }}>Chi tiết học phí theo hồ sơ</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Chứng chỉ</th>
                <th>Lệ phí</th>
                <th>Trạng thái</th>
                <th>Ngày nộp</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 100).map(r => (
                <tr key={r.id}>
                  <td><strong>{r.fullName}</strong></td>
                  <td>{r.certificateName}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(r.fee)}</td>
                  <td>
                    {r.paid 
                      ? <span className="badge badge-success">Đã nộp</span> 
                      : <span className="badge badge-danger">Chưa nộp</span>
                    }
                  </td>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{formatDate(r.dob)}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Không có hồ sơ thỏa mãn</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
