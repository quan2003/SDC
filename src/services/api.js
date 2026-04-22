import supabase, { supabaseAdmin, serviceRoleKey } from './supabaseClient';
import { formatDate, parseDate } from '../utils/helpers';

const MOCK_MAP = {};

const getMockData = (tableName) => MOCK_MAP[tableName] || [];

// Polyfill behavior when MOCK is active
const getLocalRegistrations = () => JSON.parse(localStorage.getItem('sdc_online_registrations') || '[]');

export const certificatesApi = {
  async getAll() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('certificates').select('*').order('id', { ascending: false });
      if (error) {
        console.warn('Supabase error for certificates:', error.message);
        return [];
      }
      const results = data || [];
      if (tableName === 'certificate_classes') {
          return results.map(item => {
              const [realName, insId] = (item.name || '').split('|');
              return { 
                  ...item, 
                  name: realName, 
                  instructor_id: insId || '', 
                  instructorId: insId || '',
                  subject_id: item.certificate_id,
                  subjectId: item.certificate_id
              };
          });
      }
      return results;
    } catch (e) {
      return [];
    }
  },

  async create(payload) {
    if (!supabase) return { ...payload, id: Date.now() };
    const { data, error } = await supabase.from('certificates').insert([payload]).select();
    if (error) throw error;
    return data[0];
  },

  async update(id, payload) {
    if (!supabase) return { ...payload, id };
    const { data, error } = await supabase.from('certificates').update(payload).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  async delete(id) {
    if (!supabase) return true;
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};

const UDN_SCHOOLS = [
  "Trường Đại học Bách khoa", "Trường Đại học Kinh tế", "Trường Đại học Sư phạm",
  "Trường Đại học Ngoại ngữ", "Trường Đại học Sư phạm Kỹ thuật",
  "Phân hiệu ĐHĐN tại Kon Tum", "Viện NCĐT Việt-Anh",
  "Trường Đại học Công nghệ thông tin và Truyền thông Việt-Hàn", "Khoa Y Dược"
];

const calculateFee = (school, cert) => {
  if (!cert) return 0;
  const s = (school || '').trim().toLowerCase();
  
  // 1. Thí sinh tự do -> 500k
  if (s === 'thí sinh tự do') return cert.fee_free || 500000;
  
  // 2. Sinh viên ĐH Đà Nẵng -> 300k
  const isUDN = UDN_SCHOOLS.some(uds => uds.toLowerCase() === s) || 
                s.includes('đại học đà nẵng') || 
                s.includes('đhđn');
                
  if (isUDN) return 300000;
  
  // 3. Ngoài ĐHĐN (Mặc định cho các trường khác) -> 400k
  return cert.fee_outside || 400000;
};

export const registrationsApi = {
  async getAll() {
    if (!supabase) return [];
    try {
      // Load subjects to fix missing fees for existing records
      const [{ data, error }, sessions, subjects] = await Promise.all([
        supabase.from('registrations').select(`
          *,
          certificates (name, fee)
        `).order('submitted_at', { ascending: false }),
        registrationsApi.getSessionsMap(),
        subjectsApi.getAll()
      ]);
      
      if (error) throw error;
      
      // Create a map of subjectId -> tuition for quick lookup
      const subjectFeeMap = {};
      (subjects || []).forEach(s => { subjectFeeMap[String(s.id)] = s.tuition; });
      
      return (data || []).map(r => {
        const cert = Array.isArray(r.certificates) ? r.certificates[0] : r.certificates;
        const parsed = (() => {
           if (!r.other_request) return {};
           if (typeof r.other_request === 'object') return r.other_request;
           try { return JSON.parse(r.other_request); } catch { return {}; }
        })();
        
        const sessId = parsed.examSessionId;
        const sessionName = sessions[sessId] || '';
        // Ưu tiên: nếu other_request có subjectId hoặc subjectName thì là đăng ký học
        // Tránh fallback sai về 'exam' khi hồ sơ cũ không có field type
        const hasCourseSignal = !!(parsed.subjectId || parsed.subjectName);
        const regType = parsed.type || r.type || (hasCourseSignal ? 'course' : 'exam');
        const isCourseRegistration = regType === 'course' || regType === 'course_registration';

        
        // Lấy thông tin môn học và học phí từ other_request
        const displayName = isCourseRegistration ? (parsed.subjectName || cert?.name) : (cert?.name || 'Chưa xác định');
        
        // Fix: If fee is 0, try to look up from subjectFeeMap using subjectId
        let displayFee = isCourseRegistration ? parseInt(parsed.fee || parsed.tuition || 0) : calculateFee(r.school, cert);
        if (isCourseRegistration && displayFee === 0 && parsed.subjectId) {
          displayFee = subjectFeeMap[String(parsed.subjectId)] || 0;
        }

        return {
          ...r,
          type: regType,
          fullName: r.full_name,
          dob: formatDate(r.dob),
          gender: r.gender,
          ethnicity: r.ethnicity,
          birthPlace: r.birth_place || parsed.birthPlace,
          cccdDate: formatDate(r.cccd_date),
          cccdPlace: r.cccd_place,
          school: r.school,
          classGroup: r.class_group,
          examModule: r.exam_module,
          otherRequest: r.other_request,
          submittedAt: r.submitted_at,
          paidAt: r.paid_at,
          certificateId: r.certificate_id,
          // Gán giá trị chuẩn đã xử lý
          certificateName: displayName,
          fee: displayFee,
          examSessionId: sessId,
          examSessionName: sessionName,
          code: r.code || `HV${String(r.id).padStart(5, '0')}`,
          paid: r.paid,
          ...(() => {
             return {
               feePaid: parsed.feePaid ?? r.paid,
               tuitionPaid: parsed.tuitionPaid ?? r.paid,
               examRoomId: parsed.examRoomId,
               classId: parsed.classId || parsed.activityClassId,
               activityClassId: parsed.activityClassId || parsed.classId,
               subjectId: parsed.subjectId,
               rawOption: parsed.rawOption
             };
          })()
        };
      });
    } catch (err) {
      console.error('Error in registrationsApi.getAll:', err);
      throw err;
    }
  },

  async getSessionsMap() {
    try {
       const { data } = await supabase.from('exam_sessions').select('id, name');
       const map = {};
       (data || []).forEach(s => map[s.id] = s.name);
       return map;
    } catch { return {}; }
  },

  async findByQuery(query) {
    const q = query.trim();
    if (!supabase) return null;
    
      try {
        const [{ data, error }, sessions, subjects] = await Promise.all([
          supabase
            .from('registrations')
            .select('*, certificates (name, fee)')
            .or(`cccd.eq.${q},phone.eq.${q}`)
            .order('submitted_at', { ascending: false })
            .maybeSingle(),
          registrationsApi.getSessionsMap(),
          subjectsApi.getAll()
        ]);

      if (error) throw error;
      if (!data) return null;
      
      const cert = Array.isArray(data.certificates) ? data.certificates[0] : data.certificates;
      const parsed = (() => {
         if (!data.other_request) return {};
         if (typeof data.other_request === 'object') return data.other_request;
         try { return JSON.parse(data.other_request); } catch { return {}; }
      })();

      const subjectFeeMap = {};
      (subjects || []).forEach(s => { subjectFeeMap[String(s.id)] = s.tuition; });

      const hasCourseSignal = !!(parsed.subjectId || parsed.subjectName);
      const regType = parsed.type || data.type || (hasCourseSignal ? 'course' : 'exam');
      const isCourseRegistration = regType === 'course' || regType === 'course_registration';

      const displayName = isCourseRegistration ? (parsed.subjectName || cert?.name) : (cert?.name || 'Chưa xác định');
      
      let displayFee = isCourseRegistration ? parseInt(parsed.fee || parsed.tuition || 0) : calculateFee(data.school, cert);
      if (isCourseRegistration && displayFee === 0 && parsed.subjectId) {
        displayFee = subjectFeeMap[String(parsed.subjectId)] || 0;
      }

      return {
        ...data,
        type: regType,
        fullName: data.full_name,
        dob: formatDate(data.dob),
        birthPlace: data.birth_place || parsed.birthPlace,
        gender: data.gender,
        ethnicity: data.ethnicity,
        cccdDate: formatDate(data.cccd_date),
        cccdPlace: data.cccd_place,
        school: data.school,
        classGroup: data.class_group,
        examModule: data.exam_module,
        otherRequest: data.other_request,
        certificateId: data.certificate_id,
        certificateName: displayName,
        fee: displayFee,
        examSessionId: parsed.examSessionId,
        examSessionName: sessions[parsed.examSessionId] || '',
        code: data.code || `HV${String(data.id).padStart(5, '0')}`,
        paid: data.paid,
        submittedAt: data.submitted_at,
        paidAt: data.paid_at,
        ...(() => {
           return {
             feePaid: parsed.feePaid ?? data.paid,
             tuitionPaid: parsed.tuitionPaid ?? data.paid,
             examRoomId: parsed.examRoomId,
             activityClassId: parsed.activityClassId,
             rawOption: parsed.rawOption
           };
        })()
      };
    } catch (err) {
      console.error('Error in findByQuery:', err);
      return null;
    }
  },

  async create(payload) {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    // Safety check for existing columns in registrations table
    const dbPayload = {
      full_name: payload.fullName || payload.full_name,
      dob: payload.dob, 
      gender: payload.gender || 'Khác',
      ethnicity: payload.ethnicity || 'Kinh',
      phone: payload.phone,
      email: payload.email,
      cccd: payload.cccd,
      cccd_date: payload.cccdDate || payload.cccd_date || null,
      cccd_place: payload.cccdPlace || payload.cccd_place || 'Việt Nam',
      school: payload.school,
      class_group: payload.classGroup || payload.class_group,
      certificate_id: payload.certificateId || payload.certificate_id,
      exam_module: payload.examModule || payload.exam_module,
      other_request: payload.other_request || payload.otherRequest || JSON.stringify({
         source: 'online_portal',
         type: payload.type || 'exam',
         photo: payload.photo
      }),
      paid: payload.paid || false
    };

    const { data, error } = await supabase.from('registrations').insert([dbPayload]).select();
    if (error) {
      console.error('Database Error:', error);
      throw error;
    }
    return data[0];
  },

  async delete(id) {
    if (!supabase) return false;
    // Ensure ID is passed in the correct format (handles both string and number)
    const { error, count } = await supabase.from('registrations').delete().eq('id', id);
    if (error) {
      console.error('Error deleting registration:', error);
      throw error;
    }
    return true;
  },



  async update(id, payload) {
    if (!supabase) return payload;
    
    // Safety: ensure ID is integer if possible
    const targetId = isNaN(id) ? id : parseInt(id);

    // Minimize payload to only most certain columns
    // Move suspicious columns into other_request JSON
    const dbPayload = {
      full_name: payload.fullName || payload.full_name,
      phone: payload.phone,
      email: payload.email,
      cccd: payload.cccd,
      school: payload.school,
      class_group: payload.classGroup || payload.class_group,
      status: payload.status,
      paid: payload.paid ?? payload.feePaid ?? payload.tuitionPaid,
      certificate_id: payload.certificateId ? Number(payload.certificateId) : null,
      other_request: (() => {
        let obj = {};
        const raw = payload.other_request || payload.otherRequest;
        if (raw) {
          try { obj = typeof raw === 'string' ? JSON.parse(raw) : { ...raw }; }
          catch { obj = { rawData: raw }; }
        }
        // Save potentially missing columns into JSON instead of direct columns
        if (payload.dob) obj.dob = payload.dob;
        if (payload.gender) obj.gender = payload.gender;
        if (payload.ethnicity) obj.ethnicity = payload.ethnicity;
        if (payload.birthPlace) obj.birthPlace = payload.birthPlace;
        if (payload.cccdDate) obj.cccdDate = payload.cccdDate;
        if (payload.cccdPlace) obj.cccdPlace = payload.cccdPlace;
        if (payload.examModule) obj.examModule = payload.examModule;
        if (payload.feePaid !== undefined) obj.feePaid = payload.feePaid;
        if (payload.tuitionPaid !== undefined) obj.tuitionPaid = payload.tuitionPaid;
        // Bổ sung các ID lớp vào JSON
        if (payload.classId) obj.classId = payload.classId;
        if (payload.activityClassId) obj.activityClassId = payload.activityClassId;
        if (payload.subjectId) obj.subjectId = payload.subjectId;
        if (payload.subjectName) obj.subjectName = payload.subjectName;
        if (payload.type) obj.type = payload.type;
        
        return JSON.stringify(obj);
      })(),
    };

    const { data, error } = await supabase.from('registrations').update(dbPayload).eq('id', targetId).select();
    if (error) throw error;
    return data[0];
  },

  async updateStatus(id, status) {
    if (!supabase) return null;
    const targetId = isNaN(id) ? id : parseInt(id);
    const { data, error } = await supabase.from('registrations').update({ status }).eq('id', targetId).select();
    if (error) throw error;
    return data[0];
  },

  async updatePaymentStatus(id, paidStatus) {
    if (!supabase) return null;
    const targetId = isNaN(id) ? id : parseInt(id);
    try {
      const { data: current } = await supabase.from('registrations').select('other_request').eq('id', targetId).maybeSingle();
      let other = {};
      if (current?.other_request) {
        try { other = JSON.parse(current.other_request); } catch(e) {}
      }
      other.feePaid = paidStatus;

      const { data, error } = await supabase
        .from('registrations')
        .update({ 
          paid: paidStatus, 
          paid_at: paidStatus ? new Date().toISOString() : null,
          other_request: JSON.stringify(other)
        })
        .eq('id', targetId)
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      const { data } = await supabase.from('registrations').update({ paid: paidStatus }).eq('id', targetId).select();
      return data?.[0];
    }
  }
};

// Generic CRUD Factory for Catalog tables
export const createCrudApi = (tableName) => ({
  async getAll() {
    try {
      if (!supabase) return [];
      
      const { data, error } = await supabase.from(tableName).select('*').order('id', { ascending: false });
      if (error) {
        console.warn(`Supabase error for ${tableName}:`, error.message);
        return [];
      }

      let results = data || [];

      // Special handling for subjects to decode tuition from name
      if (tableName === 'subjects') {
        results = results.map(item => {
          const [name, tuition] = (item.name || '').split('|');
          return { ...item, name: name || item.name, tuition: parseInt(tuition) || 0 };
        });
      }
      
      // Standardize certificate_classes response
      if (tableName === 'certificate_classes') {
        results = results.map(item => ({
          ...item,
          subjectId: item.subject_id || item.certificate_id,
          subject_id: item.subject_id || item.certificate_id,
          instructorId: item.instructor_id,
          certificateId: item.certificate_id,
          startDate: item.start_date,
          endDate: item.end_date,
          maxStudents: item.max_students,
          currentStudents: item.current_students
        }));
      }

      return results;
    } catch (e) {
      console.error(`Catch in getAll for ${tableName}:`, e);
      return [];
    }
  },
  async create(payload) {
    if (!supabase) return { ...payload, id: Date.now() };
    
    let dbPayload = { ...payload };
    
    // Safety check for registrations table
    if (tableName === 'registrations') {
      const allowedCols = [
        'full_name', 'dob', 'gender', 'ethnicity', 'phone', 'email', 'cccd', 
        'cccd_date', 'cccd_place', 'school', 'class_group', 'exam_module', 
        'other_request', 'certificate_id', 'paid'
      ];
      const extra = {};
      const filtered = {};
      Object.keys(dbPayload).forEach(key => {
        if (allowedCols.includes(key)) filtered[key] = dbPayload[key];
        else if (key !== 'other_request') extra[key] = dbPayload[key];
      });
      const currentOther = JSON.parse(dbPayload.other_request || '{}');
      filtered.other_request = JSON.stringify({ ...currentOther, ...extra });
      dbPayload = filtered;
    } else if (tableName === 'subjects') {
      dbPayload.name = `${payload.name}|${payload.tuition || 0}`;
      delete dbPayload.tuition;
    } else if (tableName === 'certificate_classes') {
      const subId = payload.subject_id || payload.subjectId;
      const certId = payload.certificate_id || payload.certificateId;
      dbPayload = {
        code: payload.code,
        name: payload.name,
        certificate_id: subId ? null : (certId || null),
        subject_id: subId || null,
        instructor_id: payload.instructor_id || payload.instructorId || null,
        start_date: payload.start_date || payload.startDate || null,
        end_date: payload.end_date || payload.endDate || null,
        max_students: payload.max_students || payload.maxStudents || 40,
        current_students: payload.current_students || payload.currentStudents || 0,
        fee: payload.fee || 0,
        status: payload.status || 'upcoming'
      };
    }

    const { data, error } = await supabase.from(tableName).insert([dbPayload]).select();
    if (error) throw error;
    
    const result = data[0];
    if (tableName === 'certificate_classes' && result) {
        return {
          ...result,
          subjectId: result.subject_id || result.certificate_id,
          subject_id: result.subject_id || result.certificate_id,
          instructorId: result.instructor_id,
          instructor_id: result.instructor_id,
          certificateId: result.certificate_id,
          startDate: result.start_date,
          endDate: result.end_date,
          maxStudents: result.max_students,
          currentStudents: result.current_students
        };
    }
    return result;
  },
  async update(id, payload) {
    if (!supabase) return { ...payload, id };
    
    let dbPayload = { ...payload };

    if (tableName === 'subjects') {
      const [cleanName] = (payload.name || '').split('|');
      dbPayload.name = `${cleanName}|${payload.tuition || 0}`;
      delete dbPayload.tuition;
    } else if (tableName === 'certificate_classes') {
      dbPayload = {};
      const map = {
        code: 'code', name: 'name', 
        subject_id: 'subject_id', subjectId: 'subject_id',
        instructor_id: 'instructor_id', instructorId: 'instructor_id',
        certificateId: 'certificate_id', certificate_id: 'certificate_id',
        startDate: 'start_date', start_date: 'start_date',
        endDate: 'end_date', end_date: 'end_date',
        maxStudents: 'max_students', max_students: 'max_students',
        currentStudents: 'current_students', current_students: 'current_students',
        fee: 'fee', status: 'status'
      };
      
      Object.keys(payload).forEach(key => {
        if (map[key] !== undefined) dbPayload[map[key]] = payload[key];
      });

      if (dbPayload.subject_id) {
          dbPayload.certificate_id = null;
      }
    }

    const { data, error } = await supabase.from(tableName).update(dbPayload).eq('id', id).select();
    if (error) throw error;
    
    const result = data[0];
    if (tableName === 'certificate_classes' && result) {
        return {
          ...result,
          subjectId: result.subject_id || result.certificate_id,
          subject_id: result.subject_id || result.certificate_id,
          instructorId: result.instructor_id,
          instructor_id: result.instructor_id,
          certificateId: result.certificate_id,
          startDate: result.start_date,
          endDate: result.end_date,
          maxStudents: result.max_students,
          currentStudents: result.current_students
        };
    }
    return result;
  },
  async delete(id) {
    if (!supabase) return true;
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
    return true;
  }
});

export const unitsApi = createCrudApi('units');
export const scheduleApi = createCrudApi('schedules');
export const rolesApi = createCrudApi('roles');
export const permissionsApi = createCrudApi('permissions');
export const notificationsApi = createCrudApi('notifications');
export const examSessionsApi = createCrudApi('exam_sessions');
export const bannersApi = createCrudApi('banners');
export const categoriesApi = createCrudApi('categories');
export const subjectsApi = createCrudApi('subjects');
export const classroomsApi = createCrudApi('classrooms');
export const instructorsApi = createCrudApi('instructors');
export const certificateClassesApi = createCrudApi('certificate_classes');
export const courseClassesApi = createCrudApi('course_classes');
export const activityClassesApi = createCrudApi('activity_classes');
export const contractsApi = createCrudApi('contracts');
export const examRoomsApi = createCrudApi('exam_rooms');
export const studentScoresApi = createCrudApi('student_scores');

export const usersApi = {
  async getAll() {
    try {
      if (!supabase) return [];
      
      const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn(`Supabase error for user_profiles:`, error.message);
        return [];
      }
      return (data || []).map(u => ({
        id: u.id,
        username: u.id.split('-')[0], // Không có username trong DB thật, mượn ID
        fullName: u.full_name,
        phone: u.phone,
        email: 'Đã ẩn bảo mật', // Không query auth.users trực tiếp từ web
        role: u.role,
        status: u.status
      }));
    } catch (e) {
      return [];
    }
  },
  async create(payload) {
    if (!supabase) return { ...payload, id: Date.now() };

    if (!supabaseAdmin || !serviceRoleKey) {
      throw new Error('YÊU CẦU: Vui lòng thêm biến môi trường VITE_SUPABASE_SERVICE_ROLE_KEY="..." vào file .env (lấy key trong mục Project Settings -> API của Supabase) để dùng chức năng này!');
    }

    if (!payload.email || !payload.password) {
      throw new Error('Vui lòng nhập Email và Mật khẩu cho tài khoản mới.');
    }

    // Kiểm tra đuôi email nếu có ràng buộc
    if (payload.email !== 'admin@sdc.udn.vn' && !payload.email.endsWith('@sdc.udn.vn')) {
      throw new Error('Email nhân viên phải có đuôi @sdc.udn.vn');
    }

    // 1. Tạo user trong auth.users bằng Admin API (Không tự động đăng nhập mất session hiện tại)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: { full_name: payload.fullName }
    });

    if (authError) throw new Error(authError.message);

    const userId = authData.user?.id;
    if (!userId) throw new Error('Không thể lấy ID của user mới tạo.');

    // 2. Insert thông tin vào bảng user_profiles
    const { error: profileError } = await supabaseAdmin.from('user_profiles').insert({
      id: userId,
      full_name: payload.fullName,
      phone: payload.phone,
      role: payload.role,
      status: payload.status
    });

    if (profileError) {
      // Xóa user dở dang nếu profile lỗi
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(profileError.message);
    }

    return { id: userId, ...payload };
  },
  async update(id, payload) {
    if (!supabase) return { ...payload, id };
    
    // Admin quyền lực có thể đổi mật khẩu và Email (cần supabaseAdmin)
    if (payload.password || payload.email) {
      if (!supabaseAdmin) throw new Error('Chưa cấu hình Service Role Key để cập nhật mật khẩu/email bảo mật!');
      const updateAuth = {};
      if (payload.password) updateAuth.password = payload.password;
      if (payload.email) {
        updateAuth.email = payload.email;
        updateAuth.email_confirm = true;
      }
      
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateAuth);
      if (authError) throw new Error("Lỗi cập nhật bảo mật: " + authError.message);
    }
    
    const { data, error } = await supabase.from('user_profiles').update({
      full_name: payload.fullName,
      phone: payload.phone,
      role: payload.role,
      status: payload.status
    }).eq('id', id).select();
    if (error) throw error;
    return { ...payload, id };
  },
  async delete(id) {
    if (!supabase) return true;
    if (!supabaseAdmin || !serviceRoleKey) {
      throw new Error('Thiếu VITE_SUPABASE_SERVICE_ROLE_KEY trong file .env !!');
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw error;
    
    return true;
  }
};

