import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

export default function ContactPage() {
  const toast = useToast();

  return (
    <div className="client-section" style={{ paddingTop: 40 }}>
      <div className="client-container" style={{ maxWidth: 900 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Liên hệ</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>

        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Info */}
          <div>
            <div className="card contact-card contact-info-card" style={{ padding: 28, height: '100%' }}>
              <h3 style={{ marginBottom: 24 }}>Thông tin liên hệ</h3>
              {[
                { icon: FiMapPin, label: 'Địa chỉ', value: 'Tầng 5 Khu C, 41 Lê Duẩn - Hải Châu - Đà Nẵng' },
                { icon: FiPhone, label: 'Điện thoại', value: '+0236 2240 741' },
                { icon: FiMail, label: 'Email', value: 'contact@sdc.udn.vn' },
                { icon: FiClock, label: 'Giờ làm việc', value: 'Thứ 2 - Thứ 6: 7:30 - 17:00' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'flex-start' }}>
                  <div className="client-icon-surface" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={16} style={{ color: 'var(--primary-400)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontWeight: 500 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            <div className="card contact-card contact-form-card client-form-card" style={{ padding: 28 }}>
              <h3 style={{ marginBottom: 24 }}>Gửi tin nhắn ngay</h3>
              <form 
                action="https://formsubmit.co/contact@sdc.udn.vn" 
                method="POST"
                onSubmit={() => toast.success('Đang chuyển hướng...', 'Yêu cầu của bạn đang được xử lý!')}
              >
                {/* Configuration */}
                <input type="hidden" name="_subject" value="Website SDC: Tin nhắn liên hệ mới" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value={window.location.href} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Họ tên khách hàng</label>
                    <input className="form-input" name="Họ tên" placeholder="Họ và tên của bạn..." required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Địa chỉ Email</label>
                      <input className="form-input" type="email" name="Email" placeholder="Email để liên hệ lại..." required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại</label>
                      <input className="form-input" name="Số điện thoại" placeholder="SĐT liên hệ..." required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nội dung cần hỗ trợ</label>
                    <textarea className="form-textarea" name="Nội dung" placeholder="Bạn cần chúng tôi hỗ trợ gì?" rows={5} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ height: 48 }}>
                    <FiSend size={18} /> Gửi tin nhắn cho trung tâm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="card contact-map-card client-form-card" style={{ padding: 0, marginTop: 24, overflow: 'hidden' }}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3644.1960481845504!2d108.21682417490409!3d16.070993384608705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421836b72064ff%3A0x454e48e22686cc98!2zNDEgTMOqIER14bqpbiwgSOG6o2kgQ2jDonUsIMSQw6AgTuG6tW5nIDU1MDAwMCwgVmnhu4d0IE5hbQ!5e1!3m2!1svi!2s!4v1776139741630!5m2!1svi!2s" 
            width="100%" 
            height="400" 
            style={{ border: 0, display: 'block' }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
