import { useState, useEffect } from 'react';
import { FiX, FiSend, FiMail } from 'react-icons/fi';
import { useToast } from '../contexts/ToastContext';
import { sendRealEmail } from '../utils/mailer';
import { formatCurrency } from '../utils/helpers';

export default function EmailModal({ isOpen, onClose, recipients = [], extraData = {} }) {
  const toast = useToast();
  
  // Aggregate payment status to decide default types
  const allTuitionPaid = recipients.length > 0 && recipients.every(r => r.tuitionPaid);
  const allFeePaid = recipients.length > 0 && recipients.every(r => r.feePaid);

  const getDefaultType = () => {
    if (extraData?.context === 'exam') {
      if (!allFeePaid) return 'fee';
      return 'schedule_exam';
    }
    if (!allTuitionPaid) return 'tuition';
    if (!allFeePaid) return 'fee';
    return 'schedule_class';
  };
  
  const [emailType, setEmailType] = useState('tuition');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmailType(getDefaultType());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Default config values
    const centerName = 'SDC - Trung tâm Phát triển Phần mềm';
    const amount = extraData.amount ? formatCurrency(extraData.amount) : '....... đ';
    const className = extraData.className || '.......';

    switch (emailType) {
      case 'tuition':
        setSubject(`[${centerName}] Thông báo nộp học phí khóa học`);
        setBody(`<h2>Chào [Tên Học Viên],</h2>
<p>Ban giáo vụ ${centerName} xin thông báo về việc đóng học phí cho lớp <b>${className}</b>.</p>
<p>Số tiền học phí: <b style="color:red">${amount}</b></p>
<p>Bạn vui lòng hoàn thành trước ngày khai giảng để được xếp danh sách chính thức.</p>
<p>Trân trọng.</p>`);
        break;
      case 'fee':
        setSubject(`[${centerName}] Thông báo nộp lệ phí thi`);
        setBody(`<h2>Chào [Tên Học Viên],</h2>
<p>Ban quản lý thi ${centerName} xin thông báo về việc nộp lệ phí dự thi chứng chỉ <b>${className}</b>.</p>
<p>Lệ phí thi: <b style="color:red">${amount}</b></p>
<p>Bạn vui lòng nộp lệ phí đúng hạn để hội đồng thi chốt danh sách phòng máy.</p>
<p>Trân trọng.</p>`);
        break;
      case 'schedule_class':
        setSubject(`[${centerName}] Thông báo lịch học khai giảng`);
        setBody(`<h2>Chào [Tên Học Viên],</h2>
<p>Lớp <b>${className}</b> của bạn chuẩn bị khai giảng.</p>
<p>Vui lòng chú ý thời khóa biểu sẽ được gửi chi tiết vào email này. Đề nghị có mặt đúng giờ vào buổi học đầu tiên.</p>
<p>Trân trọng.</p>`);
        break;
      case 'schedule_exam':
        setSubject(`[${centerName}] Thông báo lịch thi và phòng máy`);
        setBody(`<h2>Chào [Tên Học Viên],</h2>
<p>Bạn có lịch thi cho đợt thi <b>${className}</b> sắp tới.</p>
<p>Thông tin SBD và Phòng máy sẽ được niêm yết trước 3 ngày. Bạn vui lòng thường xuyên kiểm tra email và mang theo CCCD khi đi thi.</p>
<p>Chúc bạn ôn tập tốt.</p>`);
        break;
      case 'custom':
        setSubject(`[${centerName}] `);
        setBody(`<h2>Chào [Tên Học Viên],</h2><p>...</p>`);
        break;
      default:
        break;
    }
  }, [emailType, isOpen, extraData]);

  if (!isOpen) return null;

  const validRecipients = recipients.filter(r => r.email);

  const handleSend = async () => {
    if (validRecipients.length === 0) {
      toast.error('Lỗi', 'Không có học viên nào được chọn hoặc học viên không có email hợp lệ!');
      return;
    }
    setSending(true);
    let successCount = 0;
    try {
      for (const r of validRecipients) {
        const personalizedBody = body.replace(/\[Tên Học Viên\]/gi, r.fullName);
        await sendRealEmail({ to: r.email, subject, body: personalizedBody });
        successCount++;
      }
      toast.success(`Đã gửi ${successCount}/${validRecipients.length} email`, 'Việc gửi thư đã hoàn tất.');
      onClose();
    } catch (e) {
      toast.error(`Lỗi sau khi gửi ${successCount} email`, e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title"><FiMail /> Soạn Email Thông Báo</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Người nhận ({validRecipients.length} người hợp lệ)</label>
            <div style={{ background: 'var(--bg-input)', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', maxHeight: 100, overflowY: 'auto' }}>
              {recipients.length === 1 ? (
                <span style={{ fontSize: '0.9rem' }}>{recipients[0].fullName} ({recipients[0].email || 'Thiếu email'})</span>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {recipients.slice(0, 10).map((r, i) => (
                    <span key={i} className={`badge ${r.email ? 'badge-info' : 'badge-inactive'}`}>
                      {r.fullName}
                    </span>
                  ))}
                  {recipients.length > 10 && <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', alignSelf: 'center' }}>+ {recipients.length - 10} người khác</span>}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Chọn bộ phận / Loại mẫu thư</label>
            <select className="form-select" value={emailType} onChange={e => setEmailType(e.target.value)}>
              {extraData?.context !== 'exam' && !allTuitionPaid && <option value="tuition">Kế toán - Nhắc nộp học phí</option>}
              {!allFeePaid && <option value="fee">Khảo thí - Nhắc nộp lệ phí thi</option>}
              {extraData?.context !== 'exam' && <option value="schedule_class">Giáo vụ - Lịch học</option>}
              <option value="schedule_exam">Khảo thí - Lịch thi</option>
              <option value="custom">Tùy chỉnh nội dung</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Tiêu đề (Subject)</label>
            <input className="form-input" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Nội dung thư (Hỗ trợ định dạng HTML)</label>
            <textarea 
               className="form-textarea" 
               style={{ minHeight: 180, fontFamily: 'monospace' }} 
               value={body} 
               onChange={e => setBody(e.target.value)} 
            />
          </div>
          
          <div style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
            * Chú ý: Hãy cấu hình đúng SMTP trong cài đặt hệ thống trước khi Gửi.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSend} disabled={sending || validRecipients.length === 0}>
            <FiSend size={16} /> {sending ? 'Đang gửi...' : `Gửi ${validRecipients.length} Email`}
          </button>
        </div>
      </div>
    </div>
  );
}
