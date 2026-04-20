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
      return data || [];
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

export const registrationsApi = {
  async getAll() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('registrations').select(`
        *,
        certificates (name, fee)
      `).order('submitted_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(r => {
        // Handle both object and array response from Supabase Join
        const cert = Array.isArray(r.certificates) ? r.certificates[0] : r.certificates;
        return {
          ...r,
          fullName: r.full_name,
          dob: formatDate(r.dob),
          gender: r.gender,
          ethnicity: r.ethnicity,
          birthPlace: r.birth_place,
          cccdDate: formatDate(r.cccd_date),
          cccdPlace: r.cccd_place,
          school: r.school,
          classGroup: r.class_group,
          examModule: r.exam_module,
          otherRequest: r.other_request,
          submittedAt: r.submitted_at,
          paidAt: r.paid_at,
          certificateId: r.certificate_id,
          certificateName: cert?.name || 'Chưa xác định',
          fee: cert?.fee || 0,
          code: r.code || `HV${String(r.id).padStart(5, '0')}`,
          paid: r.paid,
          feePaid: r.fee_paid ?? r.paid, // Fallback to 'paid' column
          tuitionPaid: r.tuition_paid ?? r.paid, // Fallback to 'paid' column
        };
      });
    } catch (err) {
      console.error('Error in registrationsApi.getAll:', err);
      throw err;
    }
  },

  async findByQuery(query) {
    const q = query.trim();
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*, certificates (name, fee)')
        .or(`cccd.eq.${q},phone.eq.${q}`)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      const cert = Array.isArray(data.certificates) ? data.certificates[0] : data.certificates;
      return {
        ...data,
        fullName: data.full_name,
        dob: formatDate(data.dob),
        birthPlace: data.birth_place,
        gender: data.gender,
        ethnicity: data.ethnicity,
        cccdDate: formatDate(data.cccd_date),
        cccdPlace: data.cccd_place,
        school: data.school,
        classGroup: data.class_group,
        examModule: data.exam_module,
        otherRequest: data.other_request,
        submittedAt: data.submitted_at,
        paidAt: data.paid_at,
        certificateId: data.certificate_id,
        certificateName: cert?.name || 'Chưa xác định',
        fee: cert?.fee || 0,
        code: data.code || `HV${String(data.id).padStart(5, '0')}`,
        paid: data.paid,
        feePaid: data.fee_paid ?? data.paid,
        tuitionPaid: data.tuition_paid ?? data.paid,
      };
    } catch (err) {
      console.error('Error in findByQuery:', err);
      return null;
    }
  },

  async create(payload) {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const dbPayload = {
      full_name: payload.fullName,
      dob: payload.dob, // Expects yyyy-mm-dd from client
      gender: payload.gender,
      ethnicity: payload.ethnicity,
      phone: payload.phone,
      email: payload.email,
      cccd: payload.cccd,
      cccd_date: payload.cccdDate || null,
      cccd_place: payload.cccdPlace,
      school: payload.school,
      class_group: payload.classGroup,
      certificate_id: payload.certificateId,
      exam_module: payload.examModule,
      other_request: payload.otherRequest,
      photo_base64: payload.photo,
      status: 'pending',
      paid: false
    };

    const { data, error } = await supabase.from('registrations').insert([dbPayload]).select();
    if (error) throw error;
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

  async updatePaymentStatus(id, paidStatus) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('registrations')
      .update({ paid: paidStatus, paid_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateStatus(id, newStatus) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('registrations')
      .update({ status: newStatus })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id, payload) {
    if (!supabase) return payload;
    const dbPayload = {
      full_name: payload.fullName,
      dob: parseDate(payload.dob),
      gender: payload.gender,
      ethnicity: payload.ethnicity,
      birth_place: payload.birthPlace,
      phone: payload.phone,
      email: payload.email,
      cccd: payload.cccd,
      cccd_date: parseDate(payload.cccdDate) || null,
      cccd_place: payload.cccdPlace,
      school: payload.school,
      class_group: payload.classGroup,
      certificate_id: payload.certificateId,
      exam_module: payload.examModule,
      other_request: payload.otherRequest,
      status: payload.status,
      paid: payload.paid,
      activity_class_id: payload.activityClassId,
      tuition_paid: payload.tuitionPaid,
      fee_paid: payload.feePaid,
      exam_session_id: payload.examSessionId,
    };

    const { data, error } = await supabase
      .from('registrations')
      .update(dbPayload)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
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
      return data || [];
    } catch (e) {
      console.error(`Catch in getAll for ${tableName}:`, e);
      return [];
    }
  },
  async create(payload) {
    if (!supabase) return { ...payload, id: Date.now() };
    const { data, error } = await supabase.from(tableName).insert([payload]).select();
    if (error) throw error;
    return data[0];
  },
  async update(id, payload) {
    if (!supabase) return { ...payload, id };
    const { data, error } = await supabase.from(tableName).update(payload).eq('id', id).select();
    if (error) throw error;
    return data[0];
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

