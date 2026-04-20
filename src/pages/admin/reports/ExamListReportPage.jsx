import { useState, useEffect } from 'react';
import { FiFileText, FiDownload, FiPrinter, FiUsers, FiSearch } from 'react-icons/fi';
import { registrationsApi, examSessionsApi } from '../../../services/api';
import { formatDate, exportToExcel } from '../../../utils/helpers';
import { printPDF } from '../../../utils/pdfGenerator';
import { mockCertificates } from '../../../utils/mockData';

export default function ExamListReportPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedCert, setSelectedCert] = useState('');

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const [regs, sess] = await Promise.all([
        registrationsApi.getAll(),
        examSessionsApi.getAll()
      ]);
      setData(regs);
      setSessions(sess);
      if (sess.length > 0) setSelectedSession(sess[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter(r => {
    if (selectedSession && String(r.examSessionId) !== String(selectedSession)) return false;
    if (selectedCert && String(r.certificateId) !== String(selectedCert)) return false;
    return true;
  });

  const handlePrint = () => {
    const session = sessions.find(s => String(s.id) === String(selectedSession));
    const cert = mockCertificates.find(c => String(c.id) === String(selectedCert));
    
    const html = `
      <div style="font-family: 'Times New Roman', serif; padding: 30px; color: #000;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="text-align: center; width: 45%;">
            <p style="margin: 0; font-size: 11pt;">ĐẠI HỌC ĐÀ NẴNG</p>
            <p style="margin: 0; font-weight: bold; font-size: 11pt;">TRUNG TÂM PHÁT TRIỂN PHẦN MỀM</p>
            <div style="width: 150px; border-top: 1px solid #000; margin: 5px auto;"></div>
          </div>
          <div style="text-align: center; width: 45%;">
            <p style="margin: 0; font-weight: bold; font-size: 11pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p style="margin: 0; font-weight: bold; font-size: 11pt;">Độc lập - Tự do - Hạnh phúc</p>
            <div style="width: 180px; border-top: 1px solid #000; margin: 5px auto;"></div>
          </div>
        </div>

        <h2 style="text-align: center; margin-top: 30px; font-size: 16pt;">DANH SÁCH THÍ SINH DỰ THI</h2>
        <p style="text-align: center; font-style: italic; margin-top: -10px;">
          Khóa thi ngày: ${formatDate(session?.exam_date || '')} ${session?.name || ''}
        </p>
        <p style="text-align: center; font-weight: bold; margin-top: 5px;">
          Chứng chỉ: ${cert?.name || 'Tất cả'}
        </p>

        <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 10pt;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th rowspan="2">STT</th>
              <th rowspan="2">SBD</th>
              <th colspan="2">Họ và tên thí sinh</th>
              <th rowspan="2">Giới tính</th>
              <th rowspan="2">Ngày sinh</th>
              <th rowspan="2">Nơi sinh</th>
              <th rowspan="2">CCCD/CMND</th>
              <th rowspan="2">Điện thoại</th>
              <th rowspan="2">Email</th>
              <th rowspan="2">Ký tên</th>
            </tr>
            <tr style="background-color: #f2f2f2;">
              <th>Họ đệm</th>
              <th>Tên</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((r, i) => {
              const nameParts = (r.fullName || '').trim().split(' ');
              const lastName = nameParts.pop();
              const firstName = nameParts.join(' ');
              return `
                <tr>
                  <td align="center">${i + 1}</td>
                  <td align="center"><strong>${String(i + 1).padStart(3, '0')}</strong></td>
                  <td>${firstName}</td>
                  <td><strong>${lastName}</strong></td>
                  <td align="center">${r.gender || ''}</td>
                  <td align="center">${formatDate(r.dob)}</td>
                  <td>${r.birthPlace || ''}</td>
                  <td align="center">${r.cccd || ''}</td>
                  <td align="center">${r.phone || ''}</td>
                  <td style="font-size: 8pt;">${r.email || ''}</td>
                  <td style="height: 40px;"></td>
                </tr>
              `;
            }).join('')}
            ${filtered.length === 0 ? '<tr><td colspan="9" align="center" style="padding: 20px;">Không có thí sinh</td></tr>' : ''}
          </tbody>
        </table>

        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 40%;">
            <p><strong>GIÁM THỊ 1</strong></p>
            <p style="margin-top: 60px;">...................................</p>
          </div>
          <div style="text-align: right; width: 50%; padding-right: 50px;">
            <p style="font-style: italic;">Đà Nẵng, ngày .... tháng .... năm 2026</p>
            <p style="text-align: center; padding-right: 50px;"><strong>GIÁM THỊ 2</strong></p>
            <p style="text-align: center; margin-top: 60px; padding-right: 50px;">...................................</p>
          </div>
        </div>
      </div>
    `;
    printPDF(html);
  };

  const handleExport = () => {
    const session = sessions.find(s => String(s.id) === String(selectedSession));
    exportToExcel(filtered.map((r, i) => ({
      'STT': i+1,
      'SBD': String(i+1).padStart(3, '0'),
      'Họ tên': r.fullName,
      'Giới tính': r.gender,
      'Ngày sinh': formatDate(r.dob),
      'Nơi sinh': r.birthPlace,
      'CCCD': r.cccd,
      'Điện thoại': r.phone,
      'Email': r.email,
      'Đợt thi': session?.name
    })), `DanhSachDuThi_${session?.code || 'All'}`);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiUsers /> Báo cáo danh sách dự thi</h1>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={handleExport}><FiDownload size={16} /> Xuất Excel</button>
          <button className="btn btn-primary" onClick={handlePrint}><FiPrinter size={16} /> In Danh sách</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Chọn đợt thi</label>
            <select className="form-select" value={selectedSession} onChange={e => setSelectedSession(e.target.value)}>
              <option value="">Tất cả đợt thi</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.name} ({formatDate(s.exam_date)})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Loại chứng chỉ</label>
            <select className="form-select" value={selectedCert} onChange={e => setSelectedCert(e.target.value)}>
              <option value="">Tất cả chứng chỉ</option>
              {mockCertificates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 6 }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
              Có <strong style={{ color: 'var(--primary-400)' }}>{filtered.length}</strong> thí sinh thỏa mãn điều kiện
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>STT</th>
                <th>SBD</th>
                <th>Họ tên</th>
                <th>Phái</th>
                <th>Ngày sinh</th>
                <th>Nơi sinh</th>
                <th>CCCD</th>
                <th>Điện thoại</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td><strong style={{ color: 'var(--primary-400)' }}>{String(i + 1).padStart(3, '0')}</strong></td>
                  <td><strong>{r.fullName}</strong></td>
                  <td>{r.gender}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{formatDate(r.dob)}</td>
                  <td>{r.birthPlace}</td>
                  <td style={{ fontFamily: 'monospace' }}>{r.cccd}</td>
                  <td style={{ fontSize: '0.85rem' }}>{r.phone}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Không tìm thấy thí sinh</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
