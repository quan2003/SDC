import { useState } from 'react';
import { FiSearch, FiUser, FiCheckCircle, FiClock, FiFileText, FiPrinter } from 'react-icons/fi';
import { registrationsApi } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { generateReceiptHTML, printPDF } from '../../utils/pdfGenerator';

export default function LookupPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePrint = () => {
    if (!result) return;
    const html = generateReceiptHTML({
      id: result.id,
      receiptNo: result.receiptNo, // Số thứ tự từ 1
      fullName: result.fullName,
      dob: result.dob,
      birthPlace: result.birthPlace,
      phone: result.phone,
      classGroup: result.classGroup,
      certificateName: result.certificateName,
      certName: result.certificateName,
      examSessionName: result.examSessionName,
      fee: result.fee,
      isTuition: result.type === 'course',
    });
    printPDF(html);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearched(true);
    setLoading(true);
    
    try {
      const found = await registrationsApi.findByQuery(query);
      setResult(found || null);
    } catch (err) {
      console.error(err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-section lookup-page-section" style={{ paddingTop: 40, minHeight: '60vh' }}>
      <div className="client-container lookup-container" style={{ maxWidth: 700 }}>
        <div className="lookup-heading" style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
            Tra cứu <span className="gradient-text">hồ sơ</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tra cứu trạng thái hồ sơ đăng ký thi và nhận mã thanh toán</p>
        </div>

        <div className="card lookup-card" style={{ padding: 32 }}>
          <form onSubmit={handleSearch}>
            <div className="form-group" style={{ marginBottom: result ? 24 : 0 }}>
              <label className="form-label"><FiUser size={14} /> Nhập số CCCD hoặc số điện thoại theo hồ sơ</label>
              <div className="lookup-search-row" style={{ display: 'flex', gap: 12 }}>
                <input className="form-input" placeholder="Số CCCD hoặc số điện thoại..." value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary"><FiSearch size={16} /> Tra cứu</button>
              </div>
            </div>
          </form>

          {searched && !result && (
            <div className="animate-fade-in-scale" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
              <FiSearch size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div>Không tìm thấy dữ liệu đăng ký nào ứng với SĐT/CCCD này.</div>
            </div>
          )}

          {result && (
            <div className="animate-fade-in-scale lookup-result" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Thông tin hồ sơ</h3>
              
              <div className="lookup-result-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 24 }}>
                <div className="lookup-info-list" style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.95rem' }}>
                  <div className="lookup-info-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="lookup-info-label" style={{ color: 'var(--text-tertiary)' }}>Họ và tên:</span>
                    <strong className="lookup-info-value" style={{ color: 'var(--text-primary)' }}>{result.fullName}</strong>
                  </div>
                  <div className="lookup-info-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="lookup-info-label" style={{ color: 'var(--text-tertiary)' }}>Chứng chỉ đăng ký:</span>
                    <strong className="lookup-info-value" style={{ color: 'var(--primary-500)', textAlign: 'right' }}>{result.certificateName}</strong>
                  </div>
                  <div className="lookup-info-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="lookup-info-label" style={{ color: 'var(--text-tertiary)' }}>Ngày nộp:</span>
                    <strong className="lookup-info-value">{formatDateTime(result.submittedAt)}</strong>
                  </div>
                  <div className="lookup-info-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="lookup-info-label" style={{ color: 'var(--text-tertiary)' }}>Trạng thái hồ sơ:</span>
                    <span>
                      {result.status === 'pending' ? <span className="badge badge-warning">Đang chờ xử lý</span> : <span className="badge badge-success">Đã duyệt</span>}
                    </span>
                  </div>
                  <div className="lookup-info-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="lookup-info-label" style={{ color: 'var(--text-tertiary)' }}>Trạng thái học phí:</span>
                    <span>
                      {result.paid ? <span className="badge badge-success" style={{ fontWeight: 800 }}>ĐÃ THANH TOÁN</span> : <span className="badge badge-danger">CHƯA THANH TOÁN</span>}
                    </span>
                  </div>
                </div>

                {/* QR Code Segment */}
                <div className="lookup-payment-panel" style={{ width: 220, padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {result.paid ? (
                    <div className="lookup-payment-success" style={{ textAlign: 'center' }}>
                      <div className="lookup-payment-icon" style={{ width: 60, height: 60, background: 'rgba(34, 197, 94, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <FiCheckCircle size={30} style={{ color: 'var(--success-500)' }} />
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--success-600)', marginBottom: 8 }}>Thanh toán hoàn tất</div>
                      <button 
                        className="btn btn-secondary btn-sm lookup-print-btn" 
                        onClick={handlePrint}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '0 auto' }}
                      >
                        <FiPrinter size={14} /> In hóa đơn
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>Quét mã để thanh toán ngay</div>
                      <div className="lookup-qr-image" style={{ width: 150, height: 150, background: 'white', padding: 8, borderRadius: 'var(--radius-md)' }}>
                        <img 
                          src={`https://img.vietqr.io/image/970418-5601274934-compact.png?amount=${result.fee}&addInfo=${encodeURIComponent(`SDC - ${result.fullName} - LPTCB ${result.examSessionName}`)}&accountName=TT PT PHAN MEM DAI HOC DA NANG`}
                          alt="QR Thanh Toán"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div className="lookup-amount" style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--danger-500)', fontWeight: 800, textAlign: 'center' }}>
                        {formatCurrency(result.fee)}
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
