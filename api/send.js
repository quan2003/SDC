import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Cấu hình Header CORS cho Vercel (bắt buộc)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Trả về OK nếu là preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Chặn mọi method không phải POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    // Nhận cấu hình từ giao diện Client (React gửi lên)
    const { smtpHost, smtpPort, smtpUser, smtpPassword, to, subject, htmlBody } = req.body;

    if (!smtpHost || !smtpUser || !smtpPassword || !to) {
      return res.status(400).json({ success: false, error: 'Thiếu tham số bắt buộc' });
    }

    // Khởi tạo trạm gửi thư Nodemailer (Transporter)
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 587,
      secure: Number(smtpPort) === 465, // True với cổng bảo mật 465, False với 587 hoặc khác
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      tls: {
       // Bổ sung: bỏ qua từ chối chứng chỉ kém nếu test cục bộ
       rejectUnauthorized: false
      }
    });

    // Thực thi lệnh gửi tin
    const info = await transporter.sendMail({
      from: `"Hệ thống Quản trị SDC" <${smtpUser}>`,
      to: to,
      subject: subject,
      html: htmlBody,
    });

    // Báo cáo thành công cho Client
    return res.status(200).json({ success: true, messageId: info.messageId });
    
  } catch (error) {
    console.error('Lệnh gửi Mail thất bại tại backend:', error);
    return res.status(500).json({ success: false, error: error.message || 'Lỗi không xác định' });
  }
}
