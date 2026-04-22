import { useState, useEffect, useMemo } from 'react';
import { FiDollarSign, FiDownload, FiPieChart, FiTrendingUp, FiPrinter } from 'react-icons/fi';
import { registrationsApi } from '../../../services/api';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { printPDF, generateReceiptHTML } from '../../../utils/pdfGenerator';

export default function FeeReportPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState('course'); // 'course' or 'exam'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'paid', 'unpaid'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const regs = await registrationsApi.getAll();
      setData(regs || []);
    } catch (e) {
      console.error('Error loading report data:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(r => {
      // Tách biệt học và thi
      const isCourse = r.type === 'course' || r.type === 'course_registration';
      if (filterType === 'course' && !isCourse) return false;
      if (filterType === 'exam' && isCourse) return false;

      if (filterStatus === 'paid') return r.paid;
      if (filterStatus === 'unpaid') return !r.paid;
      return true;
    });
  }, [data, filterType, filterStatus]);

  const stats = useMemo(() => {
    const totalPossible = filteredData.reduce((sum, r) => sum + (r.fee || 0), 0);
    const collected = filteredData.filter(r => r.paid).reduce((sum, r) => sum + (r.fee || 0), 0);
    const pending = totalPossible - collected;
    const paidCount = filteredData.filter(r => r.paid).length;
    
    return { totalPossible, collected, pending, paidCount, totalCount: filteredData.length };
  }, [filteredData]);

  const handlePrintReport = () => {
    const html = `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; color: #000;">
        <h1 style="text-align: center; margin-bottom: 30px;">BÁO CÁO DOANH THU & ${filterType === 'course' ? 'HỌC PHÍ' : 'LỆ PHÍ THI'}</h1>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 1.1rem;">
          <div>
            <p><strong>Ngày lập báo cáo:</strong> ${formatDate(new Date())}</p>
            <p><strong>Loại hình:</strong> ${filterType === 'course' ? 'Đăng ký học lớp chuyên đề/chứng chỉ' : 'Đăng ký thi chứng chỉ'}</p>
            <p><strong>Tổng số hồ sơ:</strong> ${stats.totalCount}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Doanh thu đã thu:</strong> ${formatCurrency(stats.collected)}</p>
            <p><strong>Cần thu thêm:</strong> ${formatCurrency(stats.pending)}</p>
          </div>
        </div>

        <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; font-size: 10pt;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>STT</th>
              <th>Họ và tên</th>
              <th>Nội dung</th>
              <th>Số tiền</th>
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
            <p style="margin-top: 60px; font-style: italic; color: #666;">(Ký và ghi rõ họ tên)</p>
          </div>
          <div style="text-align: center; width: 40%;">
            <p><strong>Kế toán trưởng</strong></p>
            <p style="margin-top: 60px; font-style: italic; color: #666;">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    `;
    printPDF(html);
  };

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const handlePrintReceipt = (item) => {
    const html = generateReceiptHTML(item);
    printPDF(html);
  };

  const handlePrintAllReceiptsByDate = () => {
    const dailyData = data.filter(r => {
        if (!r.paid) return false;
        // Kiểm tra loại hình (Học/Thi) khớp với tab hiện tại
        const isCourse = r.type === 'course' || r.type === 'course_registration';
        if (filterType === 'course' && !isCourse) return false;
        if (filterType === 'exam' && isCourse) return false;

        // So khớp ngày nộp (paid_at hoặc registrationDate nếu cũ)
        const dateStr = r.paid_at || r.registrationDate;
        if (!dateStr) return false;
        return dateStr.startsWith(filterDate);
    });

    if (dailyData.length === 0) {
        return toast?.error('Không có dữ liệu', `Không tìm thấy phiếu thu nào trong ngày ${formatDate(filterDate)}`);
    }

    // Kết hợp tất cả các phiếu thu vào một HTML lớn
    const combinedHTML = dailyData.map(item => {
        return `<div style="page-break-after: always; min-height: 100vh;">${generateReceiptHTML(item)}</div>`;
    }).join('');

    printPDF(combinedHTML);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiDollarSign /> Báo cáo doanh thu & học phí</h1>
        <div className="page-actions" style={{ gap: 12 }}>
           <input 
             type="date" 
             className="form-input" 
             value={filterDate} 
             onChange={e => setFilterDate(e.target.value)} 
             style={{ width: 150 }} 
           />
           <button className="btn btn-ghost" onClick={handlePrintAllReceiptsByDate}>
             <FiPrinter size={16} /> Phiếu thu theo ngày
           </button>
           <select 
             className="form-select" 
             value={filterStatus} 
             onChange={e => setFilterStatus(e.target.value)}
             style={{ width: 150 }}
           >
             <option value="all">Tất cả trạng thái</option>
             <option value="paid">Đã nộp</option>
             <option value="unpaid">Chưa nộp</option>
           </select>
           <button className="btn btn-primary" onClick={handlePrintReport}><FiPrinter size={16} /> Xuất PDF báo cáo</button>
        </div>
      </div>

      {/* Tabs Tách biệt Học và Thi */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        <button className={`tab ${filterType === 'course' ? 'active' : ''}`} onClick={() => setFilterType('course')}>Quy trình Đăng ký học</button>
        <button className={`tab ${filterType === 'exam' ? 'active' : ''}`} onClick={() => setFilterType('exam')}>Quy trình Đăng ký thi</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon green"><FiTrendingUp /></div>
          <div className="stat-info">
            <div className="stat-label">Doanh thu {filterType === 'course' ? 'học phí' : 'lệ phí'} đã thu</div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(stats.collected)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiDollarSign /></div>
          <div className="stat-info">
            <div className="stat-label">Số tiền chưa thu</div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(stats.pending)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><FiPieChart /></div>
          <div className="stat-info">
            <div className="stat-label">Tỷ lệ hoàn thành</div>
            <div className="stat-value">
              {((stats.collected / (stats.totalPossible || 1)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">Chi tiết {filterType === 'course' ? 'học phí' : 'lệ phí'} theo hồ sơ</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Tổng cộng: <strong>{stats.totalCount}</strong> hồ sơ</span>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>STT</th>
                <th>Sinh viên</th>
                <th>{filterType === 'course' ? 'Môn học' : 'Chứng chỉ thi'}</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center', width: 100 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-tertiary)' }}>{i + 1}</td>
                  <td>
                    <div><strong>{r.fullName}</strong></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{formatDate(r.dob)}</div>
                  </td>
                  <td>{r.certificateName}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{formatCurrency(r.fee)}</td>
                  <td>
                    {r.paid 
                      ? <span className="badge badge-success">Đã nộp</span> 
                      : <span className="badge badge-danger">Chưa nộp</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {r.paid && (
                            <button className="btn btn-ghost btn-icon-sm" title="In phiếu thu" onClick={() => handlePrintReceipt(r)}>
                                <FiPrinter size={13} style={{ color: 'var(--success-500)' }} />
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Không có dữ liệu trong danh mục này</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
