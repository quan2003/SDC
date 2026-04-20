import { useState, useEffect } from 'react';
import { FiSend, FiUpload, FiCheckCircle, FiUser, FiPhone, FiMail, FiBook, FiCalendar } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';
import { fileToBase64 } from '../../utils/helpers';
import DateInput from '../../components/DateInput';
import { certificatesApi, registrationsApi } from '../../services/api';

const SCHOOL_LIST = [
  "Trường Đại học Bách khoa - Đại học Đà Nẵng",
  "Trường Đại học Kinh tế - Đại học Đà Nẵng",
  "Trường Đại học Sư phạm - Đại học Đà Nẵng",
  "Trường Đại học Ngoại ngữ - Đại học Đà Nẵng",
  "Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng",
  "Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn, Đại học Đà Nẵng",
  "Trường Y Dược - Đại học Đà Nẵng",
  "Viện Nghiên cứu & Đào tạo Việt - Anh, Đại học Đà Nẵng",
  "Khoa Giáo dục Thể chất - Đại học Đà Nẵng",
  "Trường Đại học Kiến trúc Đà Nẵng",
  "Trường Đại học Đông Á"
];

export default function RegisterPage() {
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState({
    fullName: '', dob: '', birthPlace: '', gender: 'Nam', ethnicity: 'Kinh',
    phone: '', email: '', cccd: '', cccdDate: '', cccdPlace: '',
    school: '', classGroup: '', certificateId: '',
    examModule: '', otherRequest: '', photo: '',
  });
  const [errors, setErrors] = useState({});
  const [isOtherSchool, setIsOtherSchool] = useState(false);

  useEffect(() => {
    async function loadCerts() {
      try {
        const certs = await certificatesApi.getAll();
        setCertificates(certs || []);
      } catch (err) {
        toast.error('Lỗi', 'Không thể tải danh sách chứng chỉ từ máy chủ');
      }
    }
    loadCerts();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if (!form.dob) e.dob = 'Vui lòng nhập ngày sinh';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại';
    if (!form.cccd.trim()) e.cccd = 'Vui lòng nhập số CCCD';
    if (!form.certificateId) e.certificateId = 'Vui lòng chọn chứng chỉ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const cert = certificates.find(c => c.id === Number(form.certificateId));
      
      const newReg = await registrationsApi.create({
        ...form,
        certificateName: cert?.name || '',
        fee: cert?.fee || 0,
      });

      setSubmittedData({
        ...newReg,
        certificateName: cert?.name || '',
        fee: cert?.fee || 0,
      });
      setSubmitted(true);
      toast.success('Đăng ký thành công!', 'Vui lòng hoàn tất thanh toán học phí');
    } catch (err) {
      toast.error('Lỗi đăng ký', err.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File quá lớn', 'Vui lòng chọn file ≤ 5MB');
        return;
      }
      const base64 = await fileToBase64(file);
      setForm(prev => ({ ...prev, photo: base64 }));
    }
  };

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  if (submitted) {
    return (
      <div className="client-section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="client-container" style={{ textAlign: 'center' }}>
          <div className="animate-fade-in-scale">
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <FiCheckCircle size={40} style={{ color: 'var(--success-400)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Đăng ký thành công!</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 24px', fontSize: '1rem' }}>
              Đơn đăng ký chứng chỉ <strong>{submittedData?.certificateName}</strong> của bạn đã được gửi. Vui lòng thanh toán học phí để hoàn tất thủ tục.
            </p>

            {submittedData && (
              <div style={{ width: 280, padding: 24, background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', margin: '0 auto 32px', boxShadow: 'var(--shadow-md)' }}>
                 <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Số tiền cần thanh toán</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger-500)' }}>
                      {new Intl.NumberFormat('vi-VN').format(submittedData.fee)}đ
                    </div>
                 </div>
                 <div style={{ padding: 8, background: '#fff', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <img 
                       src={`https://img.vietqr.io/image/970418-5601274934-compact.png?amount=${submittedData.fee}&addInfo=SDC ${submittedData.cccd} ${submittedData.fullName}&accountName=TT PT PHAN MEM DAI HOC DA NANG`}
                       alt="QR Code thanh toán"
                       style={{ width: '100%', display: 'block' }}
                    />
                 </div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 12 }}>
                   Kiểm tra trạng thái tại mục <strong>Tra cứu</strong>
                 </div>
              </div>
            )}

            <button className="btn btn-primary" onClick={() => { setSubmitted(false); setSubmittedData(null); setForm({ fullName: '', dob: '', birthPlace: '', gender: 'Nam', ethnicity: 'Kinh', phone: '', email: '', cccd: '', cccdDate: '', cccdPlace: '', school: '', classGroup: '', certificateId: '', examModule: '', otherRequest: '', photo: '' }); }}>
              Đăng ký hồ sơ khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="client-section" style={{ paddingTop: 40 }}>
      <div className="client-container" style={{ maxWidth: 800 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
            Đăng ký dự thi <span className="gradient-text">Chứng chỉ CNTT</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Vui lòng điền đầy đủ thông tin bên dưới. Các trường có dấu <span style={{ color: 'var(--danger-400)' }}>*</span> là bắt buộc.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 32 }}>
            {/* Photo + Basic info */}
            <div style={{ display: 'flex', gap: 28, marginBottom: 24 }}>
              {/* Photo upload */}
              <div style={{ flexShrink: 0 }}>
                <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                  Ảnh thẻ 3x4
                </label>
                <label style={{
                  width: 120, height: 160, borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--border-color)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  cursor: 'pointer', transition: 'all var(--transition-base)',
                  background: form.photo ? 'transparent' : 'var(--bg-glass)',
                }}>
                  {form.photo ? (
                    <img src={form.photo} alt="Ảnh thẻ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      <FiUpload size={24} style={{ marginBottom: 6 }} />
                      <div style={{ fontSize: '0.75rem' }}>Chọn ảnh<br />3x4</div>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Form fields */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label"><FiUser size={13} /> Họ và tên <span className="required">*</span></label>
                  <input className={`form-input ${errors.fullName ? 'error' : ''}`} placeholder="Nhập họ và tên đầy đủ..." value={form.fullName} onChange={e => update('fullName', e.target.value)} />
                  {errors.fullName && <div className="form-error">{errors.fullName}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label"><FiCalendar size={13} /> Ngày sinh <span className="required">*</span></label>
                  <DateInput className={`form-input ${errors.dob ? 'error' : ''}`} value={form.dob} onChange={val => update('dob', val)} />
                  {errors.dob && <div className="form-error">{errors.dob}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Nơi sinh <i style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(theo giấy khai sinh)</i></label>
                  <input className="form-input" placeholder="Thành phố/Tỉnh..." value={form.birthPlace} onChange={e => update('birthPlace', e.target.value)} />
                </div>
              </div>
            </div>

            {/* More fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Giới tính</label>
                <select className="form-select" value={form.gender} onChange={e => update('gender', e.target.value)}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Dân tộc</label>
                <input className="form-input" value={form.ethnicity} onChange={e => update('ethnicity', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label"><FiPhone size={13} /> Điện thoại <span className="required">*</span></label>
                <input className={`form-input ${errors.phone ? 'error' : ''}`} placeholder="Số điện thoại..." value={form.phone} onChange={e => update('phone', e.target.value)} />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>
              <div className="form-group">
                <label className="form-label"><FiMail size={13} /> Email</label>
                <input className="form-input" type="email" placeholder="Email..." value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Sinh viên trường</label>
                <select 
                  className="form-select" 
                  value={isOtherSchool ? 'Khác' : form.school}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'Khác') {
                      setIsOtherSchool(true);
                      update('school', '');
                    } else {
                      setIsOtherSchool(false);
                      update('school', val);
                    }
                  }}
                >
                  <option value="">-- Chọn trường --</option>
                  {SCHOOL_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="Khác">Khác...</option>
                </select>
                {isOtherSchool && (
                  <input 
                    className="form-input" 
                    style={{ marginTop: 8 }} 
                    placeholder="Nhập tên trường của bạn..." 
                    value={form.school} 
                    onChange={e => update('school', e.target.value)} 
                    autoFocus
                  />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Lớp</label>
                <input className="form-input" placeholder="Lớp sinh viên..." value={form.classGroup} onChange={e => update('classGroup', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Số CCCD <span className="required">*</span></label>
                <input className={`form-input ${errors.cccd ? 'error' : ''}`} placeholder="Số CCCD..." value={form.cccd} onChange={e => update('cccd', e.target.value)} />
                {errors.cccd && <div className="form-error">{errors.cccd}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Ngày cấp CCCD</label>
                <DateInput className="form-input" value={form.cccdDate} onChange={val => update('cccdDate', val)} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Nơi cấp CCCD</label>
                <input className="form-input" placeholder="Nơi cấp..." value={form.cccdPlace} onChange={e => update('cccdPlace', e.target.value)} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

            {/* Registration details */}
            <h3 style={{ fontSize: '1.05rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiBook size={16} /> Thông tin đăng ký dự thi
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Tên chứng chỉ <span className="required">*</span></label>
                <select className={`form-select ${errors.certificateId ? 'error' : ''}`} value={form.certificateId} onChange={e => update('certificateId', e.target.value)}>
                  <option value="">-- Chọn chứng chỉ đăng ký --</option>
                  {certificates.filter(c => c.status === 'active').map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({new Intl.NumberFormat('vi-VN').format(c.fee)}đ)</option>
                  ))}
                </select>
                {errors.certificateId && <div className="form-error">{errors.certificateId}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Mô đun dự thi <i style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(nếu thi nâng cao)</i></label>
                <input className="form-input" placeholder="Tên mô đun..." value={form.examModule} onChange={e => update('examModule', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Yêu cầu khác <i style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(nếu có)</i></label>
                <input className="form-input" placeholder="Yêu cầu khác..." value={form.otherRequest} onChange={e => update('otherRequest', e.target.value)} />
              </div>
            </div>

            {/* Note */}
            <div style={{
              marginTop: 24, padding: '14px 18px', fontSize: '0.85rem',
              background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
            }}>
              <strong style={{ color: 'var(--warning-400)' }}>Lưu ý:</strong> Thí sinh chịu trách nhiệm với những thông tin ghi trên hồ sơ để cấp chứng chỉ, không giải quyết cho những trường hợp đăng ký hộ.
            </div>

            {/* Submit */}
            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ minWidth: 200 }}>
                {loading ? (
                  <><span className="loading-spinner" /> Đang gửi...</>
                ) : (
                  <><FiSend size={18} /> Gửi đăng ký</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
