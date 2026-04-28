import supabase, { supabaseAdmin, serviceRoleKey } from './supabaseClient';
import { formatDate } from '../utils/helpers';

const MOCK_MAP = {};

const getMockData = (tableName) => MOCK_MAP[tableName] || [];

const LOCAL_TABLE_KEYS = {
  notifications: 'sdc_local_notifications',
};

const getLocalTable = (tableName) => {
  const key = LOCAL_TABLE_KEYS[tableName];
  if (!key) return getMockData(tableName);
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const saveLocalTable = (tableName, rows) => {
  const key = LOCAL_TABLE_KEYS[tableName];
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(rows));
};

export const certificatesApi = {
  async getAll() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('certificates').select('*').order('id', { ascending: false });
      if (error) {
        console.warn('Supabase error for certificates:', error.message);
        return [];
      }
      // Decode fee fields encoded in description (format: desc|fee_ud|fee_outside|fee_freelance)
      return (data || []).map(item => {
        const parts = (item.description || '').split('|');
        return {
          ...item,
          description: parts[0] || item.description,
          fee_ud: parseInt(parts[1]) || 0,
          fee_outside: parseInt(parts[2]) || 0,
          fee_freelance: parseInt(parts[3]) || 0
        };
      });
    } catch (e) {
      console.error('Error in certificatesApi.getAll:', e);
      return [];
    }
  },

  async create(payload) {
    if (!supabase) return { ...payload, id: Date.now() };
    // Encode fee fields into description column (format: desc|fee_ud|fee_outside|fee_freelance)
    const desc = (payload.description || '').split('|')[0];
    const dbPayload = {
      ...payload,
      description: `${desc}|${payload.fee_ud || 0}|${payload.fee_outside || 0}|${payload.fee_freelance || 0}`
    };
    delete dbPayload.fee_ud;
    delete dbPayload.fee_outside;
    delete dbPayload.fee_freelance;
    const { data, error } = await supabase.from('certificates').insert([dbPayload]).select();
    if (error) throw error;
    const result = data[0];
    const parts = (result.description || '').split('|');
    return {
      ...result,
      description: parts[0] || result.description,
      fee_ud: parseInt(parts[1]) || 0,
      fee_outside: parseInt(parts[2]) || 0,
      fee_freelance: parseInt(parts[3]) || 0
    };
  },

  async update(id, payload) {
    if (!supabase) return { ...payload, id };
    // Encode fee fields into description column (format: desc|fee_ud|fee_outside|fee_freelance)
    const cleanDesc = (payload.description || '').split('|')[0];
    const dbPayload = {
      ...payload,
      description: `${cleanDesc}|${payload.fee_ud || 0}|${payload.fee_outside || 0}|${payload.fee_freelance || 0}`
    };
    delete dbPayload.fee_ud;
    delete dbPayload.fee_outside;
    delete dbPayload.fee_freelance;
    const { data, error } = await supabase.from('certificates').update(dbPayload).eq('id', id).select();
    if (error) throw error;
    const result = data[0];
    const parts = (result.description || '').split('|');
    return {
      ...result,
      description: parts[0] || result.description,
      fee_ud: parseInt(parts[1]) || 0,
      fee_outside: parseInt(parts[2]) || 0,
      fee_freelance: parseInt(parts[3]) || 0
    };
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
  
  // 1. Thí sinh tự do
  if (s.includes('tự do')) return cert.fee_freelance || 450000;
  
  // 2. Thành viên/Sinh viên ĐH Đà Nẵng
  const isUDN = UDN_SCHOOLS.some(uds => uds.toLowerCase() === s) || 
                s.includes('đại học đà nẵng') || 
                s.includes('đhđn') ||
                s.includes('thành viên');
                
  if (isUDN) return cert.fee_ud || 300000;
  
  // 3. Ngoài ĐHĐN (Sinh viên các trường ngoài hệ thống)
  return cert.fee_outside || 350000;
};

export const registrationsApi = {
  async getAll() {
    if (!supabase) return [];
    try {
      if (!supabase) return [];
      
      const { data, error } = await supabase.from('registrations')
        .select(`
          *,
          certificates (id, name, fee, fee_ud, fee_outside, fee_freelance),
          exam_sessions (id, name),
          exam_rooms (id, shift, classrooms(name)),
          subjects!fk_registrations_subjects (id, name, tuition)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      // Tính toán số thứ tự cho từng hồ sơ theo loại
      const examRegs = (data || []).filter(r => r.type !== 'course').reverse();
      const courseRegs = (data || []).filter(r => r.type === 'course').reverse();

      const examMap = {};
      examRegs.forEach((r, idx) => { examMap[r.id] = idx + 1; });
      
      const courseMap = {};
      courseRegs.forEach((r, idx) => { courseMap[r.id] = idx + 1; });

      return (data || []).map(r => {
        const cert    = Array.isArray(r.certificates) ? r.certificates[0] : r.certificates;
        const session = Array.isArray(r.exam_sessions) ? r.exam_sessions[0] : r.exam_sessions;
        const room    = Array.isArray(r.exam_rooms)    ? r.exam_rooms[0]    : r.exam_rooms;
        const subject = Array.isArray(r.subjects)      ? r.subjects[0]      : r.subjects;
        
        const seqNumber = r.type === 'course' ? courseMap[r.id] : examMap[r.id];
        const isCourseRegistration = r.type === 'course' || r.type === 'course_registration';

        // Tên hiển thị: ưu tiên DB JOIN, fallback JSON (bản ghi cũ)
        let fallbackName = null;
        let fallbackFee  = 0;
        if (isCourseRegistration && !subject?.name && r.other_request) {
          try {
            const or = typeof r.other_request === 'string' ? JSON.parse(r.other_request) : r.other_request;
            fallbackName = or?.subjectName || null;
            fallbackFee  = Number(or?.fee) || 0;
          } catch {
            // Ignore malformed legacy metadata.
          }
        }

        const displayName = isCourseRegistration
          ? (subject?.name || fallbackName || cert?.name || 'Chưa xác định')
          : (cert?.name || 'Chưa xác định');

        const displayFee = r.fee
          || (isCourseRegistration ? (subject?.tuition || fallbackFee) : calculateFee(r.school, cert));
        
        return {
          ...r,
          fullName:        r.full_name,
          dob:             formatDate(r.dob),
          gender:          r.gender,
          ethnicity:       r.ethnicity,
          birthPlace:      r.birth_place,
          cccdDate:        formatDate(r.cccd_date),
          cccdPlace:       r.cccd_place,
          school:          r.school,
          classGroup:      r.class_group,
          examModule:      r.exam_module,
          otherRequest:    r.other_request,
          submittedAt:     r.submitted_at,
          paidAt:          r.paid_at,
          certificateId:   r.certificate_id,
          certificateName: displayName,
          fee:             displayFee,
          receiptNo:       seqNumber,
          examSessionId:   r.exam_session_id,
          examSessionName: session?.name || '',
          examRoomId:      r.exam_room_id,
          examRoomName:    room?.classrooms?.name || '',
          code:            r.code || `HV${String(r.id).padStart(5, '0')}`,
          paid:            r.paid,
          feePaid:         r.fee_paid || r.paid,
          tuitionPaid:     r.tuition_paid,
          classId:         r.class_id,
          subjectId:       r.subject_id,
          photo:           r.photo
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
      const { data, error } = await supabase
        .from('registrations')
        .select('*, certificates(name, fee), exam_sessions(name)')
        .or(`cccd.eq.${q},phone.eq.${q}`)
        .order('submitted_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      const cert = Array.isArray(data.certificates) ? data.certificates[0] : data.certificates;
      const sessionData = Array.isArray(data.exam_sessions) ? data.exam_sessions[0] : data.exam_sessions;
      
      const isCourseRegistration = data.type === 'course' || data.type === 'course_registration';
      const displayName = isCourseRegistration ? (data.certificate_name || cert?.name) : (cert?.name || 'Chưa xác định');

      // Tính số thứ tự cho hồ sơ này
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('type', data.type)
        .lte('submitted_at', data.submitted_at);

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
        certificateId: data.certificate_id,
        certificateName: displayName,
        fee: data.fee || calculateFee(data.school, cert),
        receiptNo: count || 1, 
        examSessionId: data.exam_session_id,
        examSessionName: sessionData?.name || '',
        examRoomId: data.exam_room_id,
        code: data.code || `HV${String(data.id).padStart(5, '0')}`,
        paid: data.paid,
        feePaid: data.fee_paid || data.paid,
        tuitionPaid: data.tuition_paid,
        submittedAt: data.submitted_at,
        paidAt: data.paid_at,
        classId: data.class_id,
        subjectId: data.subject_id,
        photo: data.photo
      };
    } catch (err) {
      console.error('Error in findByQuery:', err);
      return null;
    }
  },

  async create(payload) {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    // Helper: chuyển FK không hợp lệ (chuỗi rỗng, undefined, NaN) → null
    const toId = (v) => {
      const n = parseInt(v);
      return isNaN(n) ? null : n;
    };

    const dbPayload = {
      full_name:    payload.fullName || payload.full_name || null,
      dob:          payload.dob || null,
      gender:       payload.gender || 'Khác',
      ethnicity:    payload.ethnicity || 'Kinh',
      phone:        payload.phone || null,
      email:        payload.email || null,
      cccd:         payload.cccd || null,
      cccd_date:    payload.cccdDate || payload.cccd_date || null,
      cccd_place:   payload.cccdPlace || payload.cccd_place || 'Việt Nam',
      birth_place:  payload.birthPlace || null,
      school:       payload.school || null,
      class_group:  payload.classGroup || payload.class_group || null,
      // bigint FKs — empty string → null
      certificate_id:  toId(payload.certificateId ?? payload.certificate_id),
      exam_session_id: toId(payload.examSessionId ?? payload.exam_session_id),
      exam_room_id:    toId(payload.examRoomId ?? payload.exam_room_id),
      class_id:        toId(payload.classId ?? payload.class_id),
      subject_id:      toId(payload.subjectId ?? payload.subject_id),
      // Các field khác
      exam_module:   payload.examModule || null,
      other_request: payload.otherRequest ?? payload.other_request ?? null,
      status:        payload.status || 'pending',
      type:          payload.type || 'exam',
      code:          payload.code || null,
      fee_paid:      payload.feePaid || false,
      tuition_paid:  payload.tuitionPaid || false,
      paid:          payload.paid || payload.feePaid || false,
      fee:           payload.fee || 0,
      photo:         payload.photo || null,
    };

    // Fallback: nếu fee chưa có, tính toán tự động
    if (!dbPayload.fee) {
      const { data: certData } = await supabase.from('certificates').select('*').eq('id', dbPayload.certificate_id).maybeSingle();
      if (certData) {
        const parts = (certData.description || '').split('|');
        const cert = {
          ...certData,
          fee_ud: parseInt(parts[1]) || 0,
          fee_outside: parseInt(parts[2]) || 0,
          fee_freelance: parseInt(parts[3]) || 0
        };
        dbPayload.fee = calculateFee(dbPayload.school, cert);
      }
    }

    const { data: insertResult, error } = await supabase.from('registrations').insert([dbPayload]).select();
    if (error) {
      console.error('Database Error:', error);
      throw error;
    }
    return insertResult[0];
  },

  async delete(id) {
    if (!supabase) return false;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async update(id, payload) {
    if (!supabase) return payload;
    const targetId = isNaN(id) ? id : parseInt(id);

    const dbPayload = {
      full_name: payload.fullName,
      dob: payload.dob,
      gender: payload.gender,
      ethnicity: payload.ethnicity,
      phone: payload.phone,
      email: payload.email,
      cccd: payload.cccd,
      cccd_date: payload.cccdDate,
      cccd_place: payload.cccdPlace,
      birth_place: payload.birthPlace,
      school: payload.school,
      class_group: payload.classGroup,
      exam_module: payload.examModule,
      certificate_id: payload.certificateId,
      other_request: payload.otherRequest, 
      status: payload.status,
      type: payload.type,
      // Direct columns
      code: payload.code,
      exam_session_id: payload.examSessionId,
      exam_room_id: payload.examRoomId,
      fee_paid: payload.feePaid,
      tuition_paid: payload.tuitionPaid,
      paid: payload.paid || payload.feePaid || payload.tuitionPaid,
      fee: payload.fee,
      photo: payload.photo,
      class_id: payload.classId,
      subject_id: payload.subjectId,
    };

    // Filter out undefined values to avoid overwriting with null unless intended
    const finalPayload = {};
    Object.keys(dbPayload).forEach(key => {
      let val = dbPayload[key];
      if (val !== undefined) {
        // Prevent Postgres cast errors: empty strings in dates/foreign keys must be null, not ''
        if (val === '' && (key.includes('dob') || key.includes('date') || key.includes('_id'))) {
            val = null;
        }
        finalPayload[key] = val;
      }
    });

    const { data, error } = await supabase.from('registrations').update(finalPayload).eq('id', targetId).select();
    if (error) throw error;
    return data[0];
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase.from('registrations').update({ status }).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  async updatePaymentStatus(id, paidStatus) {
    const { data, error } = await supabase
      .from('registrations')
      .update({ 
        paid: paidStatus, 
        fee_paid: paidStatus,
        paid_at: paidStatus ? new Date().toISOString() : null 
      })
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
      if (!supabase) return getLocalTable(tableName);
      
      const { data, error } = await supabase.from(tableName).select('*').order('id', { ascending: false });
      if (error) {
        console.warn(`Supabase error for ${tableName}:`, error.message);
        return [];
      }

      let results = data || [];

      // Special handling for subjects to decode tuition from name (fallback for old unmigrated data)
      if (tableName === 'subjects') {
        results = results.map(item => {
          const parts = (item.name || '').split('|');
          const parsedTuition = parts.length > 1 ? parseInt(parts[1]) : 0;
          return { ...item, name: parts[0] ? parts[0].trim() : item.name, tuition: item.tuition || parsedTuition || 0 };
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

      // Standardize instructors response
      if (tableName === 'instructors') {
        results = results.map(item => ({
          ...item,
          fullName: item.full_name || item.fullName
        }));
      }

      // Standardize certificates response
      if (tableName === 'certificates') {
        results = results.map(item => {
          const parts = (item.description || '').split('|');
          return {
            ...item,
            description: parts[0] || item.description,
            fee_ud: parseInt(parts[1]) || 0,
            fee_outside: parseInt(parts[2]) || 0,
            fee_freelance: parseInt(parts[3]) || 0
          };
        });
      }

      return results;
    } catch (e) {
      console.error(`Catch in getAll for ${tableName}:`, e);
      return [];
    }
  },
  async create(payload) {
    if (!supabase) {
      const rows = getLocalTable(tableName);
      const created = { ...payload, id: Date.now() };
      saveLocalTable(tableName, [created, ...rows]);
      return created;
    }
    
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
    } else if (tableName === 'instructors') {
      dbPayload = {
        code: payload.code,
        full_name: payload.fullName || payload.full_name,
        specialization: payload.specialization,
        phone: payload.phone,
        email: payload.email,
        status: payload.status
      };
    } else if (tableName === 'certificates') {
      const desc = payload.description || '';
      dbPayload = {
        ...payload,
        description: `${desc}|${payload.fee_ud || 0}|${payload.fee_outside || 0}|${payload.fee_freelance || 0}`
      };
      delete dbPayload.fee_ud;
      delete dbPayload.fee_outside;
      delete dbPayload.fee_freelance;
    }

    const { data, error } = await supabase.from(tableName).insert([dbPayload]).select();
    if (error) throw error;
    
    const result = data[0];
    if (tableName === 'instructors' && result) {
        return { ...result, fullName: result.full_name };
    }
    if (tableName === 'certificates' && result) {
        const parts = (result.description || '').split('|');
        return {
          ...result,
          description: parts[0] || result.description,
          fee_ud: parseInt(parts[1]) || 0,
          fee_outside: parseInt(parts[2]) || 0,
          fee_freelance: parseInt(parts[3]) || 0
        };
    }
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
    if (tableName === 'instructors' && result) {
        return { ...result, fullName: result.full_name };
    }
    return result;
  },
  async update(id, payload) {
    if (!supabase) {
      const rows = getLocalTable(tableName);
      const updated = { ...payload, id };
      saveLocalTable(tableName, rows.map(item => String(item.id) === String(id) ? { ...item, ...updated } : item));
      return updated;
    }
    
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
    } else if (tableName === 'instructors') {
      dbPayload = {};
      const map = {
        code: 'code',
        fullName: 'full_name', full_name: 'full_name',
        specialization: 'specialization',
        phone: 'phone',
        email: 'email',
        status: 'status'
      };
      Object.keys(payload).forEach(key => {
        if (map[key]) dbPayload[map[key]] = payload[key];
      });
    } else if (tableName === 'certificates') {
      const desc = payload.description || '';
      // Clean description if it contains old markings
      const cleanDesc = desc.split('|')[0];
      dbPayload = {
        ...payload,
        description: `${cleanDesc}|${payload.fee_ud || 0}|${payload.fee_outside || 0}|${payload.fee_freelance || 0}`
      };
      delete dbPayload.fee_ud;
      delete dbPayload.fee_outside;
      delete dbPayload.fee_freelance;
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
    if (tableName === 'instructors' && result) {
        return { ...result, fullName: result.full_name };
    }
    if (tableName === 'certificates' && result) {
        const parts = (result.description || '').split('|');
        return {
          ...result,
          description: parts[0] || result.description,
          fee_ud: parseInt(parts[1]) || 0,
          fee_outside: parseInt(parts[2]) || 0,
          fee_freelance: parseInt(parts[3]) || 0
        };
    }
    return result;
  },
  async delete(id) {
    if (!supabase) {
      const rows = getLocalTable(tableName);
      saveLocalTable(tableName, rows.filter(item => String(item.id) !== String(id)));
      return true;
    }
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
    } catch {
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
    const isChangingEmail = payload.email && payload.email !== 'Đã ẩn bảo mật';
    if (payload.password || isChangingEmail) {
      if (!supabaseAdmin) throw new Error('Chưa cấu hình Service Role Key để cập nhật mật khẩu/email bảo mật!');
      const updateAuth = {};
      if (payload.password) updateAuth.password = payload.password;
      if (isChangingEmail) {
        // Kiểm tra đuôi email nếu có ràng buộc
        if (payload.email !== 'admin@sdc.udn.vn' && !payload.email.endsWith('@sdc.udn.vn')) {
          throw new Error('Email nhân viên phải có đuôi @sdc.udn.vn');
        }
        updateAuth.email = payload.email;
        updateAuth.email_confirm = true;
      }
      
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateAuth);
      if (authError) throw new Error("Lỗi cập nhật bảo mật: " + authError.message);
    }
    
    // Sử dụng supabaseAdmin để cập nhật profile nhằm bỏ qua RLS (cho phép Admin này sửa Admin khác)
    const client = supabaseAdmin || supabase;
    const { error } = await client.from('user_profiles').update({
      full_name: payload.fullName,
      phone: payload.phone,
      role: payload.role,
      status: payload.status
    }).eq('id', id);
    if (error) throw error;
    return { ...payload, id };
  },
  async delete(id) {
    if (!supabase) return true;
    if (!supabaseAdmin || !serviceRoleKey) {
      throw new Error('Thiếu VITE_SUPABASE_SERVICE_ROLE_KEY trong file .env !!');
    }

    // 1. Xóa trong Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError && !authError.message.includes('User not found')) throw authError;
    
    // 2. Xóa trong table user_profiles
    const { error: profileError } = await supabaseAdmin.from('user_profiles').delete().eq('id', id);
    if (profileError) throw profileError;

    return true;
  }
};

