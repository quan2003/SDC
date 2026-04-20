import { useState, useEffect, useMemo } from 'react';
import { FiFileText, FiDownload, FiCalendar, FiFilter, FiSearch, FiPrinter } from 'react-icons/fi';
import { registrationsApi, certificatesApi, examSessionsApi } from '../../../services/api';
import { formatDate, formatCurrency } from '../../../utils/helpers';
import { printPDF } from '../../../utils/pdfGenerator';

export default function RegistrationStatsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [regs, certs] = await Promise.all([
        registrationsApi.getAll(),
        certificatesApi.getAll()
      ]);
      setData(regs);
      setCertificates(certs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    // Basic filtering by date if provided
    let filtered = data;
    if (dateRange.start) {
      filtered = filtered.filter(r => new Date(r.submittedAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(r => new Date(r.submittedAt) <= end);
    }

    // Group by certificate
    const byCert = certificates.map(c => {
      const match = filtered.filter(r => String(r.certificateId) === String(c.id));
      const count = match.length;
      const approved = match.filter(r => r.status === 'confirmed' || r.status === 'approved').length;
      return { ...c, total: count, approved };
    }).filter(c => c.total > 0);

    return { total: filtered.length, byCert, filteredRecords: filtered };
  }, [data, certificates, dateRange]);

  const handlePrint = () => {
    const html = `
      <div style="font-family: 'Times New Roman', serif; padding: 40px; color: #000;">
        <h1 style="text-align: center; margin-bottom: 5px;">THỐNG KÊ ĐĂNG KÝ HỌC</h1>
        <p style="text-align: center; font-style: italic; margin-bottom: 30px;">
          (Từ ngày: ${dateRange.start || '...'} đến ngày: ${dateRange.end || '...'})
        </p>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Tổng số đăng ký:</strong> ${stats.total}</p>
        </div>

        <h3>1. Thống kê theo chứng chỉ</h3>
        <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>Chứng chỉ</th>
              <th>Tổng hồ sơ</th>
              <th>Đã duyệt</th>
            </tr>
          </thead>
          <tbody>
            ${stats.byCert.map(c => `
              <tr>
                <td>${c.name}</td>
                <td align="center">${c.total}</td>
                <td align="center">${c.approved}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>2. Chi tiết danh sách</h3>
        <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; font-size: 9pt;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>STT</th>
              <th>Tên học viên</th>
              <th>Ngày sinh</th>
              <th>CCCD</th>
              <th>Điện thoại</th>
              <th>Chứng chỉ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${stats.filteredRecords.map((r, i) => `
              <tr>
                <td align="center">${i + 1}</td>
                <td>${r.fullName}</td>
                <td align="center">${formatDate(r.dob)}</td>
                <td align="center">${r.cccd}</td>
                <td align="center">${r.phone}</td>
                <td>${r.certificateName}</td>
                <td align="center">${r.status === 'confirmed' || r.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    printPDF(html);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Họ tên', 'Ngày sinh', 'Điện thoại', 'CCCD', 'Chứng chỉ', 'Ngày đăng ký', 'Trạng thái'];
    const rows = data.map(r => [
      r.id,
      r.fullName,
      r.dob,
      r.phone,
      r.cccd,
      r.certificateName,
      formatDate(r.submittedAt),
      r.status === 'approved' ? 'Đã duyệt' : 'Chờ xử lý'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Thong_ke_dang_ky.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiFileText /> Thống kê đăng ký học</h1>
        <div className="page-actions" style={{ gap: 12 }}>
          <button className="btn btn-outline" onClick={exportToCSV}>
            <FiDownload /> Xuất CSV
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <FiPrinter /> Xuất PDF
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="toolbar" style={{ margin: 0 }}>
          <div className="toolbar-left">
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.85rem' }}>Từ ngày:</span>
              <input type="date" className="form-input" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
              <span style={{ fontSize: '0.85rem' }}>Đến ngày:</span>
              <input type="date" className="form-input" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
              <button className="btn btn-ghost" onClick={() => setDateRange({start: '', end: ''})}>Xóa lọc</button>
            </div>
          </div>
          <div className="toolbar-right">
             <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Tổng cộng: {stats.total}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 20 }}>Theo loại chứng chỉ</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Chứng chỉ</th>
                  <th style={{ textAlign: 'center' }}>Tổng hồ sơ</th>
                  <th style={{ textAlign: 'center' }}>Đã duyệt</th>
                </tr>
              </thead>
              <tbody>
                {stats.byCert.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td style={{ textAlign: 'center' }}>{c.total}</td>
                    <td style={{ textAlign: 'center' }}><span className="badge badge-success">{c.approved}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
           <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-400)' }}>
             {((stats.total / (data.length || 1)) * 100).toFixed(0)}%
           </div>
           <div style={{ color: 'var(--text-tertiary)', marginTop: 8 }}>Tỷ lệ hồ sơ trong kỳ lọc</div>
        </div>
      </div>
    </div>
  );
}
