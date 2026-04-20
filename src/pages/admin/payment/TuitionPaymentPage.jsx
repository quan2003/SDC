import { useState } from 'react';
import { FiSearch, FiCheck, FiPrinter, FiDollarSign, FiClock, FiCheckCircle, FiUser } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { formatCurrency, formatDateTime } from '../../../utils/helpers';
import { registrationsApi } from '../../../services/api';
import { printPDF, generateReceiptHTML } from '../../../utils/pdfGenerator';

export default function TuitionPaymentPage() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearched(true);
    setSearchLoading(true);
    try {
      const found = await registrationsApi.findByQuery(query);
      setResult(found || null);
    } catch (err) {
      toast.error('Lỗi tìm kiếm', err.message);
      setResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!result) return;
    if (!window.confirm(`Xác nhận đã thu ${formatCurrency(result.fee)} từ học viên ${result.fullName}?`)) return;
    
    setLoading(true);
    try {
      const updated = await registrationsApi.updatePaymentStatus(result.id, true);
      if (updated) {
        setResult({ ...result, paid: true, paid_at: updated.paid_at || new Date().toISOString() });
        toast.success('Thành công', 'Đã xác nhận thu học phí');
      }
    } catch (err) {
      toast.error('Lỗi', 'Không thể hoàn tất thanh toán: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!result) return;
    // Mark as tuition for the receipt generator
    const html = generateReceiptHTML({ ...result, isTuition: true });
    printPDF(html);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title"><FiDollarSign /> Lập phiếu thu học phí</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div>
          {/* Search Box */}
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Tra cứu học viên</h3>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  className="form-input"
                  placeholder="Nhập Số CCCD hoặc Số điện thoại sinh viên..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{ flex: 1 }}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  <FiSearch size={16} /> Tìm kiếm
                </button>
              </div>
            </form>
          </div>

          {/* Result Box */}
          {searched && !result && (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <FiSearch size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div>Không tìm thấy thông tin đăng ký ứng với số CMT/SĐT này.</div>
            </div>
          )}

          {result && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-glass)' }}>
                <h3 style={{ margin: 0 }}>Chi tiết hồ sơ</h3>
                {result.paid ? (
                  <span className="badge badge-success"><FiCheckCircle /> Đã thanh toán</span>
                ) : (
                  <span className="badge badge-warning"><FiClock /> Chưa thanh toán</span>
                )}
              </div>
              <div style={{ padding: 24, display: 'flex', gap: 24 }}>
                {result.photo && (
                  <div style={{ width: 100, height: 130, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                    <img src={result.photo} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1.3rem', marginBottom: 16, color: 'var(--primary-500)' }}>{result.fullName}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.9rem' }}>
                    <div><strong style={{ color: 'var(--text-secondary)' }}>Giới tính:</strong> {result.gender}</div>
                    <div><strong style={{ color: 'var(--text-secondary)' }}>Ngày sinh:</strong> {result.dob}</div>
                    <div><strong style={{ color: 'var(--text-secondary)' }}>CCCD:</strong> {result.cccd}</div>
                    <div><strong style={{ color: 'var(--text-secondary)' }}>Điện thoại:</strong> {result.phone}</div>
                    <div style={{ gridColumn: 'span 2' }}><strong style={{ color: 'var(--text-secondary)' }}>Nơi sinh:</strong> {result.birthPlace || 'Đang cập nhật'}</div>
                    <div style={{ gridColumn: 'span 2' }}><strong style={{ color: 'var(--text-secondary)' }}>Trường học:</strong> {result.school || 'Không rõ'}</div>
                  </div>
                  
                  <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px dashed var(--border-color)' }} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.9rem' }}>
                    <div style={{ gridColumn: 'span 2' }}><strong style={{ color: 'var(--text-secondary)' }}>Đăng ký thi:</strong> <span style={{ fontWeight: 600 }}>{result.certificateName}</span></div>
                    <div><strong style={{ color: 'var(--text-secondary)' }}>Ngày đăng ký:</strong> {formatDateTime(result.submittedAt)}</div>
                    <div><strong style={{ color: 'var(--text-secondary)' }}>Học phí cần đóng:</strong> <span style={{ color: 'var(--danger-500)', fontWeight: 800, fontSize: '1.1rem' }}>{formatCurrency(result.fee)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div>
          {result ? (
            <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
              <h3 style={{ marginBottom: 20 }}>Thao tác thanh toán</h3>
              
              {!result.paid ? (
                <>
                  <div style={{ background: 'var(--bg-glass)', padding: 16, borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 8 }}>Quét mã VietQR để thanh toán</div>
                    <div style={{ width: 180, height: 180, background: 'white', borderRadius: 'var(--radius-md)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                      <img 
                        src={`https://img.vietqr.io/image/970418-5601274934-compact.png?amount=${result.fee}&addInfo=SDC ${result.cccd} ${result.fullName}&accountName=TT PT PHAN MEM DAI HOC DA NANG`}
                        alt="QR Code"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginBottom: 12 }}
                    onClick={handleConfirmPayment}
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : <><FiCheck /> Xác nhận Đã thu tiền</>}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: 20, borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: 20, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <FiCheckCircle size={32} style={{ color: 'var(--success-500)', marginBottom: 12 }} />
                    <div style={{ color: 'var(--success-600)', fontWeight: 600 }}>Tài khoản đã thanh toán</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>vào lúc {formatDateTime(result.paidAt)}</div>
                  </div>
                  
                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handlePrint}>
                    <FiPrinter /> In phiếu thu (Biên lai)
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 24, opacity: 0.5 }}>
              Vui lòng tra cứu học viên ở khung bên trái để xem chức năng thanh toán.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
