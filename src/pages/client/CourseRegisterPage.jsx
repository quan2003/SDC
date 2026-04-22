import { useState, useEffect } from 'react';
import { FiSend, FiCheckCircle, FiUser, FiPhone, FiMail, FiBook, FiCalendar, FiDollarSign, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';
import { registrationsApi, subjectsApi } from '../../services/api';
import DateInput from '../../components/DateInput';
import { formatCurrency } from '../../utils/helpers';

export default function CourseRegisterPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);

  const [form, setForm] = useState({
    fullName: '', 
    dob: '', 
    birthPlace: '', 
    phone: '', 
    email: '', 
    cccd: '',
    subjectId: '',
  });
  const [errors, setErrors] = useState({});

  const update = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên';
    if (!form.dob) e.dob = 'Vui lòng nhập ngày sinh';
    else if (form.dob.length < 10) e.dob = 'Ngày sinh chưa hợp lệ (dd/mm/yyyy)';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{9,11}$/.test(form.phone.trim())) e.phone = 'Số điện thoại không hợp lệ (9-11 chữ số)';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không đúng định dạng';
    if (!form.cccd.trim()) e.cccd = 'Vui lòng nhập số CCCD/CMND';
    else if (!/^[0-9]{9,12}$/.test(form.cccd.trim())) e.cccd = 'Số CCCD phải có 9-12 chữ số';
    if (!form.birthPlace.trim()) e.birthPlace = 'Vui lòng nhập nơi sinh';
    if (!form.subjectId) e.subjectId = 'Vui lòng chọn môn học';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    subjectsApi.getAll().then(res => {
      setSubjects(res || []);
    });
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Thông tin chưa hợp lệ', 'Vui lòng kiểm tra lại các trường bị lỗi');
      return;
    }

    const selectedSub = subjects.find(s => String(s.id) === String(form.subjectId));

    setLoading(true);
    try {
      // Map form fields to database columns correctly
      const payload = {
        full_name: form.fullName,
        dob: form.dob || null,
        phone: form.phone,
        email: form.email,
        cccd: form.cccd,
        gender: 'Khác',
        ethnicity: 'Kinh',
        cccd_place: 'Việt Nam',
        cccd_date: new Date().toISOString().split('T')[0],
        certificate_id: selectedSub?.certificate_id ? parseInt(selectedSub.certificate_id) : null,
        paid: false,
        status: 'pending',
        other_request: JSON.stringify({
          source: 'online_portal',
          type: 'course',
          birthPlace: form.birthPlace,
          subjectId: form.subjectId,
          subjectName: selectedSub?.name,
          fee: selectedSub?.tuition || 0,
          registeredAt: new Date().toISOString()
        })
      };

      const res = await registrationsApi.create(payload);
      setSubmittedData({
        ...res,
        fullName: form.fullName,
        certificateName: selectedSub?.name,
        fee: selectedSub?.tuition || selectedSub?.fee || 0
      });
      toast.success('Thành công', 'Đăng ký học đã được gửi');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Lỗi', 'Không thể gửi hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedData) {
    return (
      <div className="container" style={{ maxWidth: 700, padding: '60px 20px', margin: '0 auto' }}>
        <div className="card text-center" style={{ padding: '40px 30px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ color: 'var(--success-500)', marginBottom: 20 }}>
            <FiCheckCircle size={64} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 10 }}>Đăng ký thành công!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>
            Hồ sơ học viên của <strong>{submittedData.fullName}</strong> đã được hệ thống ghi nhận. 
            Mã học viên tạm thời của bạn là: <strong style={{ color: 'var(--primary-500)' }}>{submittedData.code || 'SDC-' + submittedData.id}</strong>
          </p>

          <div style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 'var(--radius-lg)', marginBottom: 30, textAlign: 'left' }}>
            <h4 style={{ marginBottom: 16, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>Thông báo học phí</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span>Môn học:</span>
              <strong>{submittedData.certificateName}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginTop: 10, color: 'var(--success-600)' }}>
              <span>Tổng học phí:</span>
              <strong>{formatCurrency(submittedData.fee)}</strong>
            </div>
          </div>

          <div style={{ marginBottom: 30 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginBottom: 15 }}>Quét mã QR dưới đây để thanh toán học phí nhanh:</p>
            <div style={{ display: 'inline-block', padding: 15, background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <img 
                src={`https://img.vietqr.io/image/970418-5601274934-compact.png?amount=${submittedData.fee}&addInfo=${encodeURIComponent(`SDC - ${submittedData.fullName} - HP ${submittedData.certificateName}`)}&accountName=TT PT PHAN MEM DAI HOC DA NANG`}
                alt="QR Thanh toán"
                style={{ width: 220, height: 220, display: 'block' }}
              />
            </div>
          </div>

          <button className="btn btn-ghost" onClick={() => window.location.reload()}>Trở về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 1000, padding: '60px 20px', margin: '0 auto' }}>
      <div className="section-header text-center" style={{ marginBottom: 50 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16, background: 'linear-gradient(135deg, var(--primary-600), var(--accent-600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="course-reg-title">Đăng ký học Online</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 650, margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Vui lòng điền đầy đủ các thông tin bắt buộc dưới đây để đăng ký tham gia khóa đào tạo tại Trung tâm Phát triển Phần mềm - Đại học Đà Nẵng.
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .course-reg-form { grid-template-columns: 1fr !important; }
          .course-reg-sticky { position: static !important; order: -1; }
          .course-reg-grid2 { grid-template-columns: 1fr !important; }
          .course-reg-card { padding: 20px !important; }
          .course-reg-title { font-size: 1.8rem !important; }
        }
      `}</style>

      <form onSubmit={handleSubmit} noValidate className="animate-fade-in course-reg-form" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 40, alignItems: 'start' }}>
        
        <div className="card course-reg-card" style={{ padding: 40, borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 30, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 15 }}>
            <FiUser style={{ color: 'var(--primary-500)' }} /> Thông tin cá nhân học viên
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }} className="course-reg-grid2">
            <div className="form-group">
              <label className="form-label required">Họ và tên học viên</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.fullName ? 'var(--danger-400)' : 'var(--text-tertiary)', zIndex: 1 }} />
                <input className={`form-input ${errors.fullName ? 'error' : ''}`} style={{ paddingLeft: 40, height: 48 }} placeholder="Nhập họ và tên đầy đủ..." value={form.fullName} onChange={e => update('fullName', e.target.value)} />
              </div>
              {errors.fullName && <div className="form-error">{errors.fullName}</div>}
            </div>
            <div className="form-group">
              <label className="form-label required">Ngày sinh</label>
              <DateInput value={form.dob} onChange={val => update('dob', val)} />
              {errors.dob && <div className="form-error">{errors.dob}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }} className="course-reg-grid2">
            <div className="form-group">
              <label className="form-label required">Số điện thoại liên hệ</label>
              <div style={{ position: 'relative' }}>
                <FiPhone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.phone ? 'var(--danger-400)' : 'var(--text-tertiary)', zIndex: 1 }} />
                <input className={`form-input ${errors.phone ? 'error' : ''}`} style={{ paddingLeft: 40, height: 48 }} placeholder="Số điện thoại chính chủ..." value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>
            <div className="form-group">
              <label className="form-label required">Địa chỉ Email</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.email ? 'var(--danger-400)' : 'var(--text-tertiary)', zIndex: 1 }} />
                <input className={`form-input ${errors.email ? 'error' : ''}`} style={{ paddingLeft: 40, height: 48 }} type="email" placeholder="email@gmail.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="course-reg-grid2">
            <div className="form-group">
              <label className="form-label required">Số CCCD/CMND</label>
              <div style={{ position: 'relative' }}>
                <FiCreditCard style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.cccd ? 'var(--danger-400)' : 'var(--text-tertiary)', zIndex: 1 }} />
                <input className={`form-input ${errors.cccd ? 'error' : ''}`} style={{ paddingLeft: 40, height: 48 }} placeholder="Nhập số định danh..." value={form.cccd} onChange={e => update('cccd', e.target.value)} />
              </div>
              {errors.cccd && <div className="form-error">{errors.cccd}</div>}
            </div>
            <div className="form-group">
              <label className="form-label required">Nơi sinh (Tỉnh/TP)</label>
              <div style={{ position: 'relative' }}>
                <FiMapPin style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.birthPlace ? 'var(--danger-400)' : 'var(--text-tertiary)', zIndex: 1 }} />
                <input className={`form-input ${errors.birthPlace ? 'error' : ''}`} style={{ paddingLeft: 40, height: 48 }} placeholder="Ví dụ: Đà Nẵng" value={form.birthPlace} onChange={e => update('birthPlace', e.target.value)} />
              </div>
              {errors.birthPlace && <div className="form-error">{errors.birthPlace}</div>}
            </div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 100 }} className="course-reg-sticky">
          <div className="card" style={{ padding: 30, borderRadius: 'var(--radius-xl)', border: '2px solid var(--primary-100)', boxShadow: '0 8px 30px rgba(59, 130, 246, 0.08)' }}>
            <h4 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiBook style={{ color: 'var(--primary-500)' }} /> Lựa chọn môn học
            </h4>
            
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label required">Chọn môn học muốn học</label>
              <select 
                className={`form-select ${errors.subjectId ? 'error' : ''}`}
                style={{ height: 48, fontSize: '1rem' }}
                value={form.subjectId} 
                onChange={e => update('subjectId', e.target.value)} 
                required
              >
                <option value="">-- Danh sách môn học --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
              {errors.subjectId && <div className="form-error">{errors.subjectId}</div>}
            </div>

            {form.subjectId && (
              <div style={{ 
                padding: '16px 20px', 
                background: 'linear-gradient(to right, var(--success-50), transparent)', 
                borderRadius: 'var(--radius-md)', 
                borderLeft: '4px solid var(--success-500)',
                marginBottom: 24 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Học phí môn học:</span>
                  <strong style={{ color: 'var(--success-600)', fontSize: '1.2rem' }}>
                    {formatCurrency(subjects.find(s => String(s.id) === String(form.subjectId))?.tuition || 0)}
                  </strong>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', height: 52, fontSize: '1.05rem', fontWeight: 600, borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }} 
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <><FiSend /> Gửi đăng ký học ngay</>
              )}
            </button>
          </div>
          
          <div style={{ padding: '20px 10px', fontSize: '0.85rem', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <FiCalendar style={{ flexShrink: 0, marginTop: 2, color: 'var(--primary-500)' }} />
              <span>Sau khi nhận được hồ sơ, tư vấn viên sẽ gọi lại để xác nhận và xếp lớp.</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <FiDollarSign style={{ flexShrink: 0, marginTop: 2, color: 'var(--success-500)' }} />
              <span>Bạn có thể nộp học phí qua mã QR sau khi nhấn nút đăng ký thành công.</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
