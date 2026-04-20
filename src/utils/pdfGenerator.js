/**
 * PDF Generator for SDC Training Management
 * Generates "Thẻ dự thi" and "Đơn đăng ký dự thi cấp chứng chỉ ứng dụng CNTT"
 */

// Format date for PDF: "ngày ... tháng ... năm ..."
const formatDateParts = (dateStr) => {
  if (!dateStr) return { day: '....', month: '....', year: '........' };
  const d = new Date(dateStr);
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear()),
  };
};

const formatDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr; // Already formatted
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Generate HTML for "Thẻ dự thi" (Exam Card)
 */
export function generateExamCardHTML(data) {
  const today = formatDateParts(new Date().toISOString());
  const dobFormatted = formatDDMMYYYY(data.dob);

  return `
    <div style="font-family: 'Times New Roman', serif; color: #000; background: #fff; padding: 30px 40px; max-width: 800px; margin: 0 auto; font-size: 13pt; line-height: 1.5;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; text-align: center; margin-bottom: 15px;">
        <div style="flex: 0 0 40%; display: flex; flex-direction: column; align-items: center;">
          <div style="font-size: 13pt;">ĐẠI HỌC ĐÀ NẴNG</div>
          <div style="font-weight: bold; font-size: 13pt;">
            TT PHÁT TRIỂN PHẦN MỀM
            <div style="border-bottom: 1px solid #000; width: 45%; margin: 1px auto 0;"></div>
          </div>
        </div>
        <div style="flex: 0 0 60%; display: flex; flex-direction: column; align-items: center;">
          <div style="font-weight: bold; font-size: 13pt; white-space: nowrap;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-weight: bold; font-size: 13pt; display: inline-block; line-height: 1.1; margin-top: 4px;">
            Độc lập – Tự do – Hạnh phúc
            <div style="border-bottom: 1px solid #000; width: 100%; margin: 1px auto 0;"></div>
          </div>
        </div>
      </div>

      <!-- Title -->
      <div style="text-align: center; margin: 25px 0; position: relative; right: 15px;">
        <div style="font-weight: bold; font-size: 18pt;">THẺ DỰ THI</div>
        <div style="font-weight: bold; font-size: 14pt; margin-top: 8px;">CHỨNG CHỈ ỨNG DỤNG CÔNG NGHỆ THÔNG TIN</div>
        <div style="font-weight: bold; font-size: 13pt; margin-top: 5px;">TÊN CHỨNG CHỈ: ${data.certificateName || '...............................................'}</div>
      </div>

      <!-- Body -->
      <div style="margin: 20px 0 30px 0;">
        <div style="margin: 8px 0; display: flex; white-space: nowrap;">
          <span style="margin-right: 5px;">Tên tôi là: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; min-width: 10px; font-weight: bold; text-align: center;">${data.fullName || ''}</span>
        </div>
        
        <div style="display: flex; gap: 10px; margin: 8px 0;">
          <div style="width: 55%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Ngày, tháng, năm sinh: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${dobFormatted}</span>
          </div>
          <div style="width: 45%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Nơi sinh: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.birthPlace || ''}</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin: 8px 0;">
          <div style="width: 55%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Điện thoại: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.phone || ''}</span>
          </div>
          <div style="width: 45%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Email: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.email || ''}</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin: 8px 0;">
          <div style="width: 55%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Giới tính: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.gender || ''}</span>
          </div>
          <div style="width: 45%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Dân tộc: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.ethnicity || ''}</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin: 8px 0;">
          <div style="width: 55%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Sinh viên trường: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.school || ''}</span>
          </div>
          <div style="width: 45%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Lớp: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.classGroup || ''}</span>
          </div>
        </div>
      </div>

      <!-- Note -->
      <div style="font-style: italic; font-size: 11pt; margin: 20px 0; border: 1px dotted #999; padding: 10px;">
        <strong>*** Ghi chú:</strong> Thí sinh chịu trách nhiệm với những thông tin ghi trên hồ sơ để cấp chứng chỉ, không giải quyết cho những trường hợp đăng ký hộ.
      </div>

      <!-- Footer -->
      <div style="display: flex; justify-content: space-between; margin-top: 30px;">
        <div>
          <div style="font-style: italic; margin-bottom: 8px; font-size: 12pt;">Ảnh thẻ:</div>
          <div style="width: 95px; height: 127px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff;">
            ${data.photo ? `<img src="${data.photo}" style="width:100%;height:100%;object-fit:cover;" />` : '<span style="font-size: 14pt; color: #000;">3x4</span>'}
          </div>
        </div>
        <div style="text-align: center;">
          <div style="font-style: italic; font-size: 13pt;">Đà Nẵng, ngày ${today.day} tháng ${today.month} năm ${today.year}</div>
          <div style="font-weight: bold; margin-top: 8px; font-size: 13pt;">Người đăng ký dự thi</div>
          <div style="font-style: italic; font-size: 12pt;">(Ký, ghi rõ họ tên)</div>
          <div style="margin-top: 60px; font-weight: bold; font-size: 13pt;">${data.fullName || ''}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate HTML for "Đơn đăng ký dự thi cấp chứng chỉ ứng dụng CNTT"
 */
export function generateRegistrationFormHTML(data) {
  const today = formatDateParts(new Date().toISOString());
  const dobFormatted = formatDDMMYYYY(data.dob);
  const cccdDateFormatted = formatDDMMYYYY(data.cccdDate);

  return `
    <div style="font-family: 'Times New Roman', serif; color: #000; background: #fff; padding: 30px 50px; max-width: 800px; margin: 0 auto; font-size: 13pt; line-height: 1.5;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 15px; display: flex; flex-direction: column; align-items: center;">
        <div style="font-weight: bold; font-size: 13pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div style="font-weight: bold; font-size: 13pt; display: inline-block; line-height: 1.1; margin-top: 4px;">
          Độc lập – Tự do – Hạnh phúc
          <div style="border-bottom: 1px solid #000; width: 100%; margin: 1px auto 0;"></div>
        </div>
      </div>

      <!-- Title -->
      <div style="text-align: center; margin: 25px 0;">
        <div style="font-weight: bold; font-size: 16pt;">ĐƠN ĐĂNG KÝ DỰ THI CẤP CHỨNG CHỈ ỨNG DỤNG CNTT</div>
      </div>

      <!-- Kính gửi -->
      <div style="margin: 12px 0; text-align: center;">
        Kính gửi: <strong style="font-style: italic;">Trung tâm Phát triển Phần mềm, Đại học Đà Nẵng</strong>
      </div>

      <!-- Reference -->
      <div style="margin: 12px 0; text-align: justify; line-height: 1.4;">
        Căn cứ Quy định về tổ chức thi và cấp chứng chỉ ứng dụng CNTT ban hành theo Thông tư liên tịch số 17/2016/TTLT-BGDĐT-BTTTT ngày 21 tháng 6 năm 2016 của Bộ trưởng Bộ Giáo dục và Đào tạo, Bộ trưởng Bộ Thông tin và Truyền thông;
      </div>

      <!-- Form fields -->
      <div style="margin: 15px 0;">
        <div style="margin: 8px 0; display: flex; white-space: nowrap;">
          <span style="margin-right: 5px;">Tên tôi là: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; min-width: 10px; font-weight: bold; text-align: center;">${data.fullName || ''}</span>
        </div>
        
        <div style="margin: 8px 0; display: flex; white-space: nowrap;">
          <span style="margin-right: 5px;">Ngày, tháng, năm sinh: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; min-width: 10px; text-align: center;">${dobFormatted}</span>
        </div>
        
        <div style="margin: 8px 0; display: flex; white-space: nowrap;">
          <span style="margin-right: 5px;">Nơi sinh: <i>(* Ghi theo giấy khai sinh *)</i>: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; min-width: 10px; text-align: center;">${data.birthPlace || ''}</span>
        </div>
        
        <div style="display: flex; gap: 15px; margin: 8px 0;">
          <div style="width: 50%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Điện thoại: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.phone || ''}</span>
          </div>
          <div style="width: 50%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Email: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.email || ''}</span>
          </div>
        </div>

        <div style="display: flex; gap: 15px; margin: 8px 0;">
          <div style="width: 55%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Sinh viên Trường: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.school || ''}</span>
          </div>
          <div style="width: 45%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Lớp: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.classGroup || ''}</span>
          </div>
        </div>

        <div style="margin: 8px 0; display: flex; white-space: nowrap;">
          <span style="margin-right: 5px;">Số CCCD <i>(hoặc giấy tờ khác theo quy định)</i>: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; min-width: 10px; text-align: center;">${data.cccd || ''}</span>
        </div>
        
        <div style="display: flex; gap: 15px; margin: 8px 0;">
          <div style="width: 40%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Ngày cấp: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${cccdDateFormatted}</span>
          </div>
          <div style="width: 60%; display: flex; white-space: nowrap;">
            <span style="margin-right: 5px;">Nơi cấp: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.cccdPlace || ''}</span>
          </div>
        </div>
      </div>

      <!-- Registration details -->
      <div style="margin: 15px 0;">
        <div style="margin: 4px 0;">Tôi đăng ký dự thi cấp chứng chỉ ứng dụng CNTT:</div>
        
        <div style="margin: 6px 0; padding-left: 15px; display: flex; white-space: nowrap;">
          <span style="margin-right: 5px;">- Tên chứng chỉ <i>(cơ bản hoặc nâng cao)</i>: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; font-weight: bold; text-align: center;">${data.certificateName || ''}</span>
        </div>
        
        <div style="margin: 6px 0; padding-left: 15px; display: flex; white-space: nowrap;">
          <span style="margin-right: 5px;">- Tên mô đun dự thi <i>(nếu thi nâng cao)</i>: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.examModule || ''}</span>
        </div>
        
        <div style="margin: 6px 0; padding-left: 15px; display: flex; white-space: nowrap;">
          <span style="margin-right: 5px;">- Yêu cầu khác <i>(nếu có)</i>: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; text-align: center;">${data.otherRequest || ''}</span>
        </div>
      </div>

      <!-- Council info -->
      <div style="margin: 8px 0;">
        Tại Hội đồng thi: Trung tâm Phát triển Phần mềm – Đại học Đà Nẵng
      </div>
      <div style="margin: 8px 0;">
        Tôi cam kết thực hiện đúng các quy định về tổ chức thi và cấp chứng chỉ ứng dụng CNTT.
      </div>

      <!-- Footer -->
      <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <div>
          <div style="font-style: italic; margin-bottom: 8px; font-size: 12pt;">Ảnh thẻ:</div>
          <div style="width: 95px; height: 127px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff;">
            ${data.photo ? `<img src="${data.photo}" style="width:100%;height:100%;object-fit:cover;" />` : '<span style="font-size: 14pt; color: #000;">3x4</span>'}
          </div>
        </div>
        <div style="text-align: center;">
          <div style="font-style: italic; font-size: 13pt;">Đà Nẵng, ngày ${today.day} tháng ${today.month} năm ${today.year}</div>
          <div style="font-weight: bold; margin-top: 8px; font-size: 13pt;">Người đăng ký dự thi</div>
          <div style="font-style: italic; font-size: 12pt;">(Ký, ghi rõ họ tên)</div>
          <div style="margin-top: 55px; font-weight: bold; font-size: 13pt;">${data.fullName || ''}</div>
        </div>
      </div>

      <!-- Note -->
      <div style="font-style: italic; font-size: 11pt; margin-top: 15px; border-top: 1px solid #eee; padding-top: 5px;">
        <strong>***</strong> Thí sinh chịu trách nhiệm với những thông tin ghi trên hồ sơ để cấp chứng chỉ, không giải quyết cho những trường hợp đăng ký hộ.
      </div>
    </div>
  `;
}

/**
 * Print PDF - Opens print dialog
 */
export function printPDF(html) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>In phiếu - SDC</title>
      <style>
        @page { size: A4; margin: 10mm; }
        body { margin: 0; padding: 0; font-family: 'Times New Roman', serif; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}

/**
 * Export to PDF file using html2pdf.js
 */
export async function exportPDF(html, filename = 'document.pdf') {
  const { default: html2pdf } = await import('html2pdf.js');
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  await html2pdf().set({
    margin: 5,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(container).save();

  document.body.removeChild(container);
}

/**
 * Generate HTML for "Biên lai thu tiền" (Fee Receipt / Phiếu thu)
 */
export function generateReceiptHTML(data) {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const timeStr = `${day}/${month}/${year} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  
  const isTuition = data.isTuition === true || data.type === 'tuition' || data.feeType === 'tuition';
  const feePrefix = isTuition ? 'tuition' : 'exam';
  
  // Generate or retrieve stable sequential receipt number
  let receiptNo = localStorage.getItem(`receiptNo_${feePrefix}_${data.id}`);
  if (!receiptNo) {
    const counterKey = `receiptCounter_${feePrefix}`;
    const startCounter = 1;
    let counter = parseInt(localStorage.getItem(counterKey) || String(startCounter), 10);
    receiptNo = String(counter);
    localStorage.setItem(counterKey, String(counter + 1));
    localStorage.setItem(`receiptNo_${feePrefix}_${data.id}`, receiptNo);
  }

  const getFeeText = (fee) => {
    if (fee === 350000) return 'Ba trăm năm mươi nghìn đồng chẵn';
    if (fee === 300000) return 'Ba trăm nghìn đồng chẵn';
    if (fee === 250000) return 'Hai trăm năm mươi nghìn đồng chẵn';
    if (fee === 400000) return 'Bốn trăm nghìn đồng chẵn';
    return fee ? fee.toLocaleString() + ' đồng' : '.......................................';
  };

  const nameUpper = (data.fullName || '').toUpperCase();
  const dobFormatted = formatDDMMYYYY(data.dob);
  const birthPlace = (data.birthPlace || '').toUpperCase();
  const classVal = data.classGroup || data.className || '';
  const certVal = data.certName || data.certificateName || 'ứng dụng CNTT Cơ bản';

  const noiDungThu = isTuition ? `Học phí lớp ${classVal}` : `Lệ phí thi cấp Chứng chỉ ${certVal}`;
  const lyDoNop = isTuition 
    ? `Thu học phí khóa học` 
    : `CK- Lệ phí thi ${certVal.replace('Chứng chỉ ', '')} đợt ${data.examSessionName || '...'}`;

  return `
    <div style="font-family: 'Times New Roman', serif; color: #000; background: #fff; padding: 40px 50px; max-width: 800px; margin: 0 auto; font-size: 13pt; line-height: 1.4;">
      
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="text-align: center; width: 45%;">
          <div style="font-size: 12pt;">ĐẠI HỌC ĐÀ NẴNG</div>
          <div style="font-weight: bold; font-size: 12pt;">TRUNG TÂM PHÁT TRIỂN PHẦN MỀM</div>
          <div style="font-size: 12pt;">Địa chỉ: 41 Lê Duẩn - Đà Nẵng</div>
          <div style="font-size: 12pt;"><u>Mã đơn vị có QHNS:....</u></div>
        </div>
        
        <div style="text-align: center; width: 55%; font-size: 11pt;">
          <div style="font-weight: bold; font-size: 12pt;">Mẫu số C38 - BB</div>
          <div>(Ban hành theo QĐ số 19/2006/QĐ-BTC ngày 30/03/2006</div>
          <div>của Bộ trưởng BTC và sửa đổi bổ sung theo TT số</div>
          <div>185/2010/TT-BTC ngày 15/11/2010 của Bộ trưởng BTC)</div>
          <div>Quyển số: ....</div>
          <div style="font-weight: bold; font-size: 12pt;">Số: ${receiptNo}</div>
        </div>
      </div>

      <!-- Title -->
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-weight: bold; font-size: 17pt; letter-spacing: 0.5px;">BIÊN LAI THU TIỀN</div>
        <div style="font-style: italic; font-size: 13pt; margin-top: 2px;">
          Ngày ${day} tháng ${month} năm ${year}
        </div>
      </div>

      <!-- Body -->
      <table style="width: 100%; font-size: 13pt; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          <tr>
            <td style="width: 32%; padding: 3px 0;">Họ và tên người nộp tiền</td>
            <td style="width: 68%; padding: 3px 0; font-weight: bold;">${nameUpper} (${dobFormatted}, ${birthPlace})</td>
          </tr>
          <tr>
            <td style="padding: 3px 0;">Tên lớp</td>
            <td style="padding: 3px 0;">${classVal}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0;">Nội dung thu</td>
            <td style="padding: 3px 0;">${noiDungThu}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0;">Lý do nộp</td>
            <td style="padding: 3px 0;">${lyDoNop}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0;">Số tiền thu</td>
            <td style="padding: 3px 0;">${(data.fee || 300000).toLocaleString('vi-VN')}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0;">Viết bằng chữ</td>
            <td style="padding: 3px 0; font-weight: 500;">${getFeeText(data.fee || 300000)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Signatures -->
      <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 20px;">
        <div style="flex: 1;">
          <div style="font-weight: bold; font-size: 13pt;">Người nộp tiền</div>
          <div style="font-style: italic; font-size: 13pt;">(Ký, ghi rõ họ tên)</div>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: bold; font-size: 13pt;">Người thu tiền</div>
          <div style="font-style: italic; font-size: 13pt;">(Ký, ghi rõ họ tên)</div>
          <div style="margin-top: 70px; font-weight: bold; font-size: 13pt; margin-left: 20px;">Nguyễn Thị Loan</div>
        </div>
      </div>
      
      <!-- Generated Time Note -->
      <div style="margin-top: 40px; text-align: center;">
        <div style="font-size: 12pt;">${timeStr}</div>
        <div style="font-style: italic; font-size: 12pt;">Lưu ý: Cá nhân tự bảo quản biên lai để xuất trình khi cần thiết, mất không cấp lại.</div>
      </div>
    </div>
  `;
}
