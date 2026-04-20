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
    // Giả lập độ trễ mạng như đang gửi thật qua SMTP
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.warn('---[GIẢ LẬP GỬI EMAIL THÀNH CÔNG]---');
    console.log(`Từ: ${emailOpts.smtpUser}`);
    console.log(`Đến: ${to}`);
    console.log(`Tiêu đề: ${subject}`);
    console.log(`Nội dung (HTML):`);
    console.log(body);
    console.warn('-----------------------------------');
    
    return true;
  } catch (err) {
    console.error('Lỗi khi gửi email:', err);
    throw err;
  }
}
