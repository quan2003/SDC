/**
 * Xử lý gửi email.
 * LƯU Ý QUAN TRỌNG:
 * - smtpjs.com hiện đã sập toàn cầu (trả về lỗi 404).
 * - Trình duyệt web KHÔNG THỂ kết nối trực tiếp đến cổng TCP 587 (chuẩn bảo mật trình duyệt).
 * - Do đó, không thể gửi email TRỰC TIẾP từ React Client đến smtp.gmail.com.
 *
 * TẠM THỜI: Hàm này sẽ giả lập việc gửi mail thành công (delay 1.5s) và in nội dung ra Console.
 * KẾ HOẠCH TƯƠNG LAI: Khi dự án kết nối với Backend thực tế (Node.js/Supabase), 
 * backend sẽ nhận những cài đặt này và dùng thư viện Nodemailer để gửi đi 100% thật.
 */
export async function sendRealEmail({ to, subject, body }) {
  const emailSettingsStr = localStorage.getItem('sdc_settings_email');
  if (!emailSettingsStr) {
    throw new Error('Chưa cấu hình cài đặt Email trong hệ thống');
  }

  const emailOpts = JSON.parse(emailSettingsStr);
  if (!emailOpts.enableEmail) {
    console.log('Chức năng gửi mail tự động đang tắt.');
    return false;
  }

  if (!emailOpts.smtpHost || !emailOpts.smtpUser || !emailOpts.smtpPassword) {
    throw new Error('Thiếu thông tin SMTP (Host, User, Password) trong cài đặt');
  }

  try {
    // Gọi tệp Vercel Backend Function ẩn
    const response = await fetch('/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        smtpHost: emailOpts.smtpHost,
        smtpPort: emailOpts.smtpPort || 587,
        smtpUser: emailOpts.smtpUser,
        smtpPassword: emailOpts.smtpPassword,
        to: to,
        subject: subject,
        htmlBody: body, // Truyền nội dung HTML
      })
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || `Server Node.js trả về lỗi ${response.status}`);
    }

    console.log('---[GỬI EMAIL THÀNH CÔNG QUA NỀN TẢNG VERCEL]---', result.messageId);
    return true;
  } catch (err) {
    console.error('Lỗi khi từ chối gửi email:', err);
    throw err;
  }
}
