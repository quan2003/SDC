import * as XLSX from 'xlsx';

// Format date to Vietnamese format (dd/MM/yyyy)
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // If it's already dd/mm/yyyy (contains / and has 3 parts), return as is
  if (String(dateStr).includes('/') && String(dateStr).split('/').length === 3) return dateStr;
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Parse Vietnamese date (dd/mm/yyyy) to DB format (yyyy-mm-dd)
export const parseDate = (viDateStr) => {
  if (!viDateStr) return null;
  const parts = viDateStr.split('/');
  if (parts.length !== 3) return viDateStr; // Fallback
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

// Format datetime (dd/MM/yyyy HH:mm)
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Format currency VNĐ
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Generate unique ID
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// Search filter helper
export const filterBySearch = (items = [], searchTerm, fields) => {
  if (!items) items = [];
  if (!searchTerm.trim()) return items;
  const term = searchTerm.toLowerCase().trim();
  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(term);
    })
  );
};

// Pagination helper
export const paginate = (items = [], page, perPage) => {
  if (!items) items = [];
  const start = (page - 1) * perPage;
  return {
    data: items.slice(start, start + perPage),
    total: items.length,
    totalPages: Math.ceil(items.length / perPage),
    currentPage: page,
  };
};

// Sort helper
export const sortItems = (items = [], sortKey, sortDir) => {
  if (!items) items = [];
  if (!sortKey) return items;
  return [...items].sort((a, b) => {
    const va = a[sortKey] ?? '';
    const vb = b[sortKey] ?? '';
    const cmp = String(va).localeCompare(String(vb), 'vi');
    return sortDir === 'desc' ? -cmp : cmp;
  });
};

// Day of week in Vietnamese
export const dayOfWeekVi = (day) => {
  const days = { 1: 'Chủ nhật', 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7' };
  return days[day] || '';
};

// Slugify Vietnamese text
export const slugify = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// File to Base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Export to CSV/Excel fallback
export const exportToExcel = (data, filename = 'exported_data') => {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất Excel!');
    return false;
  }

  // Key mapping for Vietnamese headers
  const columnMapping = {
    'code': 'Mã HV',
    'fullName': 'Họ và tên',
    'full_name': 'Họ và tên',
    'dob': 'Ngày sinh',
    'gender': 'Giới tính',
    'ethnicity': 'Dân tộc',
    'birthPlace': 'Nơi sinh',
    'birth_place': 'Nơi sinh',
    'phone': 'Số điện thoại',
    'email': 'Email',
    'cccd': 'CCCD/CMT',
    'cccdDate': 'Ngày cấp',
    'cccd_date': 'Ngày cấp',
    'cccdPlace': 'Nơi cấp',
    'cccd_place': 'Nơi cấp',
    'school': 'Trường/Cơ quan',
    'classGroup': 'Lớp/Nhóm',
    'class_group': 'Lớp/Nhóm',
    'certificateName': 'Chứng chỉ đăng ký',
    'examModule': 'Module thi',
    'exam_module': 'Module thi',
    'fee': 'Lệ phí',
    'submittedAt': 'Ngày đăng ký',
    'submitted_at': 'Ngày đăng ký',
    'paid': 'Đã đóng học phí',
    'feePaid': 'Đã đóng lệ phí thi',
    'status': 'Trạng thái',
  };

  // Columns to ignore
  const ignoreColumns = ['id', 'photo_base64', 'photo', 'certificate_id', 'activity_class_id', 'exam_session_id', 'paid_at', 'created_at'];

  try {
    const cleanData = data.map(item => {
      const newItem = {};
      for (const key in item) {
        // Skip ignored columns
        if (ignoreColumns.includes(key)) continue;
        
        const viHeader = columnMapping[key] || key;
        let val = item[key];
        
        if (val === null || val === undefined) val = '';
        else if (typeof val === 'boolean') val = val ? 'X' : '';
        else if (typeof val === 'object') val = JSON.stringify(val);
        
        newItem[viHeader] = val;
      }
      return newItem;
    });

    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Export Excel Error:', error);
    alert('Có lỗi khi xuất file Excel!');
    return false;
  }
};

// Translate technical DB errors to Vietnamese
export const translateError = (error) => {
  if (!error) return 'Đã xảy ra lỗi không xác định';
  const message = typeof error === 'string' ? error : (error.message || '');
  
  if (message.includes('violates foreign key constraint')) {
    if (message.includes('exam_rooms_session_id_fkey')) return 'Không thể xóa đợt thi này vì đang có các Phòng thi được gán vào nó. Vui lòng xóa các phòng thi trước.';
    if (message.includes('class_id')) return 'Không thể xóa lớp học này vì đang có học viên đăng ký.';
    if (message.includes('subject_id')) return 'Không thể xóa môn học này vì đang có các lớp học liên quan.';
    if (message.includes('instructor_id')) return 'Không thể xóa giảng viên này vì đang có các lớp học được phân công.';
    return 'Không thể xóa mục này vì đang có các dữ liệu khác liên quan (Ràng buộc dữ liệu).';
  }

  if (message.includes('limit reached')) return 'Đã đạt giới hạn số lượng bản ghi cho phép.';
  if (message.includes('duplicate key')) return 'Dữ liệu này đã tồn tại trong hệ thống (trùng mã hoặc tên).';
  
  return message;
};
