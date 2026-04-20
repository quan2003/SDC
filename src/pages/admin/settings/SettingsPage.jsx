import { useState } from 'react';
import { FiSettings, FiSave, FiGlobe, FiDollarSign, FiShield, FiMail, FiCheck } from 'react-icons/fi';
import { useToast } from '../../../contexts/ToastContext';
import { sendRealEmail } from '../../../utils/mailer';

// Defined OUTSIDE component to prevent re-creation on every render (would cause input focus loss)
function Field({ label, children }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>{children}</div>
    </div>
  );
}

const TABS = [
  { id: 'general', label: 'Thông tin chung', icon: FiGlobe },
  { id: 'payment', label: 'Thanh toán', icon: FiDollarSign },
  { id: 'email', label: 'Email / Thông báo', icon: FiMail },
  { id: 'security', label: 'Bảo mật', icon: FiShield },
];

export default function SettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  const [general, setGeneral] = useState(() => {
    const saved = localStorage.getItem('sdc_settings_general');
    return saved ? JSON.parse(saved) : {
      centerName: 'Trung tâm Phát triển Phần mềm - Đại học Đà Nẵng',
      shortName: 'SDC - ĐHĐN',
      address: 'Tầng 5 Khu C, 41 Lê Duẩn, Hải Châu, Đà Nẵng',
      phone: '+0236 2240 741',
      email: 'contact@sdc.udn.vn',
      website: 'https://sdc.udn.vn',
      taxCode: '0400 600 809',
      bankAccount: '5601274934',
      bankName: 'BIDV CN Đà Nẵng',
      accountHolder: 'TT PT PHAN MEM DAI HOC DA NANG',
    };
  });

  const [payment, setPayment] = useState(() => {
    const saved = localStorage.getItem('sdc_settings_payment');
    return saved ? JSON.parse(saved) : {
      enableQR: true,
      qrBankCode: '970418',
      defaultTuitionFee: 350000,
      defaultExamFee: 350000,
      invoicePrefix: 'PT',
      feeInvoicePrefix: 'LPT',
      autoReminder: true,
      reminderDaysBefore: 3,
    };
  });

  const [emailOpts, setEmailOpts] = useState(() => {
    const saved = localStorage.getItem('sdc_settings_email');
    return saved ? JSON.parse(saved) : {
      enableEmail: false,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'sdc@gmail.com',
      smtpPassword: '',
      sendOnRegister: true,
      sendOnPayment: true,
    };
  });

  const [security, setSecurity] = useState(() => {
    const saved = localStorage.getItem('sdc_settings_security');
    return saved ? JSON.parse(saved) : {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      requireStrongPassword: true,
      logActivity: true,
    };
  });

  const handleSave = () => {
    localStorage.setItem('sdc_settings_general', JSON.stringify(general));
    localStorage.setItem('sdc_settings_payment', JSON.stringify(payment));
    localStorage.setItem('sdc_settings_email', JSON.stringify(emailOpts));
    localStorage.setItem('sdc_settings_security', JSON.stringify(security));
    
    setSaved(true);
    toast.success('Lưu thành công', 'Cài đặt đã được cập nhật');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1 className="page-title"><FiSettings /> Thiết lập hệ thống</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? <><FiCheck size={16} /> Đã lưu!</> : <><FiSave size={16} /> Lưu cài đặt</>}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Sidebar Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-400)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: 'all 0.15s',
                fontSize: '0.9rem',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card" style={{ padding: 28 }}>
          {activeTab === 'general' && (
            <>
              <Section title="Thông tin trung tâm">
                <Field label="Tên đầy đủ">
                  <input className="form-input" value={general.centerName} onChange={e => setGeneral(g => ({ ...g, centerName: e.target.value }))} />
                </Field>
                <Field label="Tên viết tắt">
                  <input className="form-input" value={general.shortName} onChange={e => setGeneral(g => ({ ...g, shortName: e.target.value }))} />
                </Field>
                <Field label="Địa chỉ" >
                  <input className="form-input" value={general.address} onChange={e => setGeneral(g => ({ ...g, address: e.target.value }))} />
                </Field>
                <Field label="Mã số thuế">
                  <input className="form-input" value={general.taxCode} onChange={e => setGeneral(g => ({ ...g, taxCode: e.target.value }))} />
                </Field>
                <Field label="Điện thoại">
                  <input className="form-input" value={general.phone} onChange={e => setGeneral(g => ({ ...g, phone: e.target.value }))} />
                </Field>
                <Field label="Email liên hệ">
                  <input className="form-input" type="email" value={general.email} onChange={e => setGeneral(g => ({ ...g, email: e.target.value }))} />
                </Field>
                <Field label="Website">
                  <input className="form-input" value={general.website} onChange={e => setGeneral(g => ({ ...g, website: e.target.value }))} />
                </Field>
              </Section>
              <Section title="Thông tin ngân hàng">
                <Field label="Tên ngân hàng">
                  <input className="form-input" value={general.bankName} onChange={e => setGeneral(g => ({ ...g, bankName: e.target.value }))} />
                </Field>
                <Field label="Số tài khoản">
                  <input className="form-input" value={general.bankAccount} onChange={e => setGeneral(g => ({ ...g, bankAccount: e.target.value }))} />
                </Field>
                <Field label="Chủ tài khoản">
                  <input className="form-input" value={general.accountHolder} onChange={e => setGeneral(g => ({ ...g, accountHolder: e.target.value }))} />
                </Field>
              </Section>
            </>
          )}

          {activeTab === 'payment' && (
            <Section title="Cài đặt thanh toán">
              <Field label="Lệ phí mặc định (học phí, VNĐ)">
                <input className="form-input" type="number" value={payment.defaultTuitionFee} onChange={e => setPayment(p => ({ ...p, defaultTuitionFee: Number(e.target.value) }))} />
              </Field>
              <Field label="Lệ phí thi mặc định (VNĐ)">
                <input className="form-input" type="number" value={payment.defaultExamFee} onChange={e => setPayment(p => ({ ...p, defaultExamFee: Number(e.target.value) }))} />
              </Field>
              <Field label="Tiền tố số phiếu thu HP">
                <input className="form-input" value={payment.invoicePrefix} onChange={e => setPayment(p => ({ ...p, invoicePrefix: e.target.value }))} />
              </Field>
              <Field label="Tiền tố số phiếu lệ phí">
                <input className="form-input" value={payment.feeInvoicePrefix} onChange={e => setPayment(p => ({ ...p, feeInvoicePrefix: e.target.value }))} />
              </Field>
              <Field label="Mã ngân hàng QR (VietQR)">
                <input className="form-input" value={payment.qrBankCode} onChange={e => setPayment(p => ({ ...p, qrBankCode: e.target.value }))} />
              </Field>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={payment.enableQR} onChange={e => setPayment(p => ({ ...p, enableQR: e.target.checked }))} />
                  <span className="form-label" style={{ margin: 0 }}>Hiển thị mã QR thanh toán</span>
                </label>
              </div>
            </Section>
          )}

          {activeTab === 'email' && (
            <Section title="Cài đặt Email">
              <Field label="SMTP Host">
                <input className="form-input" value={emailOpts.smtpHost} onChange={e => setEmailOpts(p => ({ ...p, smtpHost: e.target.value }))} />
              </Field>
              <Field label="SMTP Port">
                <input className="form-input" type="number" value={emailOpts.smtpPort} onChange={e => setEmailOpts(p => ({ ...p, smtpPort: Number(e.target.value) }))} />
              </Field>
              <Field label="Email tài khoản">
                <input className="form-input" value={emailOpts.smtpUser} onChange={e => setEmailOpts(p => ({ ...p, smtpUser: e.target.value }))} />
              </Field>
              <Field label="Mật khẩu ứng dụng">
                <input className="form-input" type="password" value={emailOpts.smtpPassword} onChange={e => setEmailOpts(p => ({ ...p, smtpPassword: e.target.value }))} placeholder="••••••••" />
              </Field>
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { k: 'enableEmail', label: 'Bật gửi email tự động' },
                  { k: 'sendOnRegister', label: 'Gửi email khi học viên đăng ký' },
                  { k: 'sendOnPayment', label: 'Gửi email xác nhận thanh toán' },
                ].map(f => (
                  <label key={f.k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={emailOpts[f.k]} onChange={e => setEmailOpts(p => ({ ...p, [f.k]: e.target.checked }))} />
                    <span style={{ fontSize: '0.9rem' }}>{f.label}</span>
                  </label>
                ))}
              </div>
              <div style={{ gridColumn: 'span 2', marginTop: 16, padding: 16, background: 'var(--info-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--info-400)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--info-500)', marginBottom: 10 }}>Kiểm tra cấu hình gửi mail thực tế</div>
                <div style={{ display: 'flex', gap: 10 }}>
                   <input className="form-input" style={{ width: 250 }} placeholder="Nhập địa chỉ nhận thư thử..." value={testEmailAddress} onChange={e => setTestEmailAddress(e.target.value)} />
                   <button 
                     className="btn btn-primary" 
                     disabled={testingEmail || !testEmailAddress}
                     onClick={async () => {
                       setTestingEmail(true);
                       try {
                         // Must save locally first so mailer can read the config
                         localStorage.setItem('sdc_settings_email', JSON.stringify(emailOpts));
                         await sendRealEmail({
                            to: testEmailAddress,
                            subject: 'SDC - Kiểm tra cấu hình gửi email SMTPJS',
                            body: 'Xin chào,<br><br>Hệ thống SDC đang hoạt động tốt. Việc gửi mail từ cài đặt của bạn đã thành công!'
                         });
                         toast.success('Gửi thử thành công', 'Vui lòng kiểm tra hộp thư của bạn.');
                       } catch (e) {
                         toast.error('Lỗi cấu hình', e.message);
                       } finally {
                         setTestingEmail(false);
                       }
                     }}
                   >
                     {testingEmail ? 'Đang gửi...' : 'Gửi thử nghiệm'}
                   </button>
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'security' && (
            <Section title="Cài đặt bảo mật">
              <Field label="Thời gian hết phiên (phút)">
                <input className="form-input" type="number" value={security.sessionTimeout} onChange={e => setSecurity(s => ({ ...s, sessionTimeout: Number(e.target.value) }))} />
              </Field>
              <Field label="Số lần đăng nhập sai tối đa">
                <input className="form-input" type="number" value={security.maxLoginAttempts} onChange={e => setSecurity(s => ({ ...s, maxLoginAttempts: Number(e.target.value) }))} />
              </Field>
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { k: 'requireStrongPassword', label: 'Yêu cầu mật khẩu mạnh (ít nhất 8 ký tự, có số và chữ)' },
                  { k: 'logActivity', label: 'Ghi log hoạt động người dùng' },
                ].map(f => (
                  <label key={f.k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={security[f.k]} onChange={e => setSecurity(s => ({ ...s, [f.k]: e.target.checked }))} />
                    <span style={{ fontSize: '0.9rem' }}>{f.label}</span>
                  </label>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
