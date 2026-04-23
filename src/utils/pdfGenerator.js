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

const parseOtherRequest = (val) => {
  if (!val) return '';
  if (typeof val === 'string' && !val.trim().startsWith('{')) return val;
  try {
    const obj = typeof val === 'string' ? JSON.parse(val) : val;
    // Chỉ lấy tin nhắn thực tế mà người dùng nhập vào
    const userMsg = obj.other_request || obj.request || obj.message;
    return userMsg || '';
  } catch { return String(val); }
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
        <div style="margin: 8px 0; display: flex;">
          <span style="margin-right: 5px; white-space: nowrap;">Tên tôi là: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; min-width: 10px; font-weight: bold; text-align: left; padding-left: 10px;">${data.fullName || ''}</span>
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
          <div style="width: 60%; display: flex;">
            <span style="margin-right: 5px; white-space: nowrap;">Sinh viên trường: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: left;">${data.school || ''}</span>
          </div>
          <div style="width: 40%; display: flex;">
            <span style="margin-right: 5px; white-space: nowrap;">Lớp: </span>
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
          <div style="margin-top: 90px; font-weight: bold; font-size: 13pt;">${data.fullName || ''}</div>
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
    <div style="font-family: 'Times New Roman', serif; color: #000; background: #fff; padding: 15px 45px; max-width: 800px; margin: 0 auto; font-size: 13pt; line-height: 1.3;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 5px; display: flex; flex-direction: column; align-items: center;">
        <div style="font-weight: bold; font-size: 12pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div style="font-weight: bold; font-size: 12pt; display: inline-block; line-height: 1.1; margin-top: 2px;">
          Độc lập – Tự do – Hạnh phúc
          <div style="border-bottom: 1px solid #000; width: 100%; margin: 1px auto 0;"></div>
        </div>
      </div>

      <!-- Title -->
      <div style="text-align: center; margin: 25px 0;">
        <div style="font-weight: bold; font-size: 15pt;">ĐƠN ĐĂNG KÝ DỰ THI CẤP CHỨNG CHỈ ỨNG DỤNG CNTT</div>
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
      <div style="margin: 10px 0;">
        <div style="margin: 4px 0; display: flex;">
          <span style="margin-right: 5px; white-space: nowrap;">Tên tôi là: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; min-width: 10px; font-weight: bold; text-align: left; padding-left: 10px;">${data.fullName || ''}</span>
        </div>
        
        <div style="margin: 4px 0; display: flex; white-space: nowrap;">
          <span style="margin-right: 5px;">Ngày, tháng, năm sinh: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; min-width: 10px; text-align: center;">${dobFormatted}</span>
        </div>
        
        <div style="margin: 4px 0; display: flex;">
          <span style="margin-right: 5px;">Nơi sinh: <i>(* Ghi theo giấy khai sinh *)</i>: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; min-width: 10px; text-align: left;">${data.birthPlace || ''}</span>
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
          <div style="width: 65%; display: flex;">
            <span style="margin-right: 5px; white-space: nowrap;">Sinh viên Trường: </span>
            <span style="border-bottom: 1px dotted #000; flex: 1; text-align: left;">${data.school || ''}</span>
          </div>
          <div style="width: 35%; display: flex;">
            <span style="margin-right: 5px; white-space: nowrap;">Lớp: </span>
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
        
        <div style="margin: 4px 0; padding-left: 15px; display: flex;">
          <span style="margin-right: 5px; white-space: nowrap;">- Yêu cầu khác <i>(nếu có)</i>: </span>
          <span style="border-bottom: 1px dotted #000; flex: 1; text-align: left; font-size: 11pt; font-weight: 500;">${parseOtherRequest(data.otherRequest)}</span>
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
      <div style="display: flex; justify-content: space-between; margin-top: 5px;">
        <div>
          <div style="font-style: italic; margin-bottom: 2px; font-size: 11pt;">Ảnh thẻ:</div>
          <div style="width: 85px; height: 114px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff;">
            ${data.photo ? `<img src="${data.photo}" style="width:100%;height:100%;object-fit:cover;" />` : '<span style="font-size: 12pt; color: #000;">3x4</span>'}
          </div>
        </div>
        <div style="text-align: center;">
          <div style="font-style: italic; font-size: 12pt;">Đà Nẵng, ngày ${today.day} tháng ${today.month} năm ${today.year}</div>
          <div style="font-weight: bold; margin-top: 3px; font-size: 12pt;">Người đăng ký dự thi</div>
          <div style="font-style: italic; font-size: 11pt;">(Ký, ghi rõ họ tên)</div>
          <div style="margin-top: 70px; font-weight: bold; font-size: 12pt;">${data.fullName || ''}</div>
        </div>
      </div>

      <!-- Note -->
      <div style="font-style: italic; font-size: 10.5pt; margin-top: 8px; border-top: 1px solid #eee; padding-top: 3px;">
        <strong style="text-decoration: underline;">*** Lưu ý:</strong> Thí sinh chịu trách nhiệm với những thông tin ghi trên hồ sơ để cấp chứng chỉ, không giải quyết cho những trường hợp đăng ký hộ.
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
 * Export to PDF file — opens a new window with print dialog (Save as PDF)
 * Does NOT require html2pdf.js or any external library.
 */
export function exportPDF(html, filename = 'document.pdf') {
  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) {
    alert('Vui lòng cho phép popup để tải PDF.');
    return Promise.resolve();
  }
  win.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${filename.replace('.pdf', '')}</title>
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
  win.document.close();
  // Đợi tài nguyên tải xong rồi mới mở print dialog
  return new Promise((resolve) => {
    win.onload = () => {
      setTimeout(() => {
        win.focus();
        win.print();
        // Không đóng để user có thể chọn "Lưu dưới dạng PDF"
        resolve();
      }, 400);
    };
    // Fallback nếu onload không kích hoạt
    setTimeout(() => {
      win.focus();
      win.print();
      resolve();
    }, 800);
  });
}

/**
 * Generate HTML for "Biên lai thu tiền" (Fee Receipt / Phiếu thu)
 */
export function generateReceiptHTML(data) {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  const isTuition = data.isTuition === true || data.type === 'tuition' || data.feeType === 'tuition';
  
  const getFeeText = (fee) => {
    if (!fee) return '.......................................';
    if (fee === 350000) return 'Ba trăm năm mươi nghìn đồng chẵn';
    if (fee === 300000) return 'Ba trăm nghìn đồng chẵn';
    if (fee === 1000000) return 'Một triệu đồng chẵn';
    if (fee === 400000) return 'Bốn trăm nghìn đồng chẵn';
    if (fee === 450000) return 'Bốn trăm năm mươi nghìn đồng chẵn';
    if (fee === 500000) return 'Năm trăm nghìn đồng chẵn';
    return fee.toLocaleString('vi-VN') + ' đồng chẵn';
  };

  const nameUpper = (data.fullName || '').toUpperCase();
  const dobFormatted = formatDDMMYYYY(data.dob);
  const classVal = data.classGroup || data.className || '';
  const certVal = data.certName || data.certificateName || 'ứng dụng CNTT Cơ bản';

  const displayNo = data.receiptNo || 1;
  const quyenSo = '....'; 

  const noiDungThu = isTuition 
    ? `Học phí môn ${certVal}` 
    : `Lệ phí môn thi Chứng chỉ ${certVal}`;
  
  const sessionText = data.examSessionName ? ` đợt ${data.examSessionName}` : '';
  const lyDoNop = isTuition 
    ? `Thu học phí môn học` 
    : `CK- Lệ phí thi ${certVal.replace('Chứng chỉ ', '').replace('ứng dụng ', '')}${sessionText}`;

  return `
    <style>
      @media print {
        @page { size: A4; margin: 0; }
        body { margin: 0; padding: 0; }
        .receipt-container { 
          width: 210mm; 
          min-height: 297mm;
          padding: 15mm 25mm !important;
          margin: 0 auto !important;
          box-sizing: border-box;
          background: #fff;
        }
      }
      .receipt-table td { padding: 6px 0; line-height: 1.35; vertical-align: top; }
    </style>
    <div class="receipt-container" style="font-family: 'Times New Roman', serif; color: #000; background: #fff; padding: 30px 60px; max-width: 850px; margin: 0 auto; font-size: 12pt;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="text-align: center; width: 52%;">
          <div style="font-size: 11.5pt;">ĐẠI HỌC ĐÀ NẴNG</div>
          <div style="font-weight: bold; font-size: 11.5pt;">TRUNG TÂM PHÁT TRIỂN PHẦN MỀM</div>
          <div style="font-size: 10pt; margin-top: 2px;">Địa chỉ: 41 Lê Duẩn - Đà Nẵng</div>
          <div style="font-size: 10pt;"><u>Mã đơn vị có QHNS:....</u></div>
        </div>
        <div style="text-align: center; width: 45%; font-size: 10pt;">
          <div style="font-weight: bold; font-size: 11pt;">Mẫu số C38 - BB</div>
          <div style="font-size: 9.5pt; line-height: 1.1;">(Ban hành theo QĐ số 19/2006/QĐ-BTC ngày 30/03/2006</div>
          <div style="font-size: 9.5pt; line-height: 1.1;">của Bộ trưởng BTC và sửa đổi bổ sung theo TT số</div>
          <div style="font-size: 9.5pt; line-height: 1.1;">185/2010/TT-BTC ngày 15/11/2010 của Bộ trưởng BTC)</div>
          <div style="margin-top: 4px;">Quyển số: ${quyenSo}</div>
          <div style="font-weight: bold; font-size: 13pt; color: #000; margin-top: 1px;">Số: ${displayNo}</div>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0 25px;">
        <div style="font-weight: bold; font-size: 20pt; letter-spacing: 1px;">BIÊN LAI THU TIỀN</div>
        <div style="font-style: italic; font-size: 13pt; margin-top: 5px;">
          Ngày ${day} tháng ${month} năm ${year}
        </div>
      </div>

      <div style="margin: 25px 0;">
        <table class="receipt-table" style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr>
              <td style="width: 32%;">Họ và tên người nộp tiền:</td>
              <td style="width: 68%; font-weight: bold; text-transform: uppercase;">
                ${nameUpper} ${dobFormatted ? `(${dobFormatted}${data.birthPlace ? `, ${data.birthPlace.toUpperCase()}` : ''})` : ''}
              </td>
            </tr>
            <tr>
              <td>Tên lớp:</td>
              <td style="font-weight: 500;">${classVal || '...................................................'}</td>
            </tr>
            <tr>
              <td>Nội dung thu:</td>
              <td>${noiDungThu}</td>
            </tr>
            <tr>
              <td>Lý do nộp:</td>
              <td>${lyDoNop}</td>
            </tr>
            <tr>
              <td>Số tiền thu:</td>
              <td style="font-weight: bold; font-size: 14pt;">${(data.fee ? Number(data.fee) : 0).toLocaleString('vi-VN')}</td>
            </tr>
            <tr>
              <td>Viết bằng chữ:</td>
              <td style="font-style: italic;">${getFeeText(data.fee)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 45px; page-break-inside: avoid;">
        <div style="width: 45%;">
          <div style="font-weight: bold;">Người nộp tiền</div>
          <div style="font-style: italic; font-size: 11pt; margin-bottom: 95px;">(Ký, ghi rõ họ tên)</div>
          <div style="font-weight: bold; text-transform: uppercase;">${data.fullName}</div>
        </div>
        <div style="width: 45%;">
          <div style="font-weight: bold;">Người thu tiền</div>
          <div style="font-style: italic; font-size: 11pt; margin-bottom: 95px;">(Ký, ghi rõ họ tên)</div>
          <div style="font-weight: bold;">Nguyễn Thị Loan</div>
        </div>
      </div>
      
      <div style="margin-top: 90px; text-align: center; font-size: 11pt; color: #000; border-top: 1px dashed #ccc; padding-top: 20px;">
        <div style="margin-bottom: 8px;">${day}/${month}/${year} ${new Date().toLocaleTimeString('vi-VN', {hour12: false})}</div>
        <div style="font-style: italic;">Lưu ý: Cá nhân tự bảo quản biên lai để xuất trình khi cần thiết, mất không cấp lại.</div>
      </div>
    </div>
  `;
}
