// ===== MOCK DATA - Remove when connecting to real Supabase =====

export const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', fullName: 'Nguyễn Văn An', email: 'admin@sdc.edu.vn', phone: '0901234567', role: 'admin', status: 'active', createdAt: '2026-01-15' },
  { id: 2, username: 'staff1', password: 'staff123', fullName: 'Trần Thị Bình', email: 'binh@sdc.edu.vn', phone: '0912345678', role: 'staff', status: 'active', createdAt: '2026-02-20' },
  { id: 3, username: 'staff2', password: 'staff123', fullName: 'Lê Văn Cường', email: 'cuong@sdc.edu.vn', phone: '0923456789', role: 'staff', status: 'active', createdAt: '2026-03-10' },
];

export const mockRoles = [
  { id: 1, name: 'admin', displayName: 'Quản trị viên', description: 'Toàn quyền quản trị hệ thống', status: 'active', permissions: [1,2,3,4,5,6,7,8,9,10] },
  { id: 2, name: 'staff', displayName: 'Nhân viên', description: 'Quản lý dữ liệu đào tạo', status: 'active', permissions: [1,2,3,5,6,7] },
  { id: 3, name: 'viewer', displayName: 'Xem báo cáo', description: 'Chỉ xem báo cáo và thống kê', status: 'active', permissions: [1,9] },
];

export const mockPermissions = [
  { id: 1, code: 'VIEW_DASHBOARD', name: 'Xem Dashboard', module: 'Dashboard' },
  { id: 2, code: 'MANAGE_USERS', name: 'Quản lý người dùng', module: 'Hệ thống' },
  { id: 3, code: 'MANAGE_ROLES', name: 'Quản lý vai trò', module: 'Hệ thống' },
  { id: 4, code: 'MANAGE_PERMISSIONS', name: 'Quản lý quyền', module: 'Hệ thống' },
  { id: 5, code: 'MANAGE_CATALOG', name: 'Quản lý danh mục', module: 'Danh mục' },
  { id: 6, code: 'MANAGE_CLASSES', name: 'Quản lý lớp', module: 'Lớp học' },
  { id: 7, code: 'MANAGE_STUDENTS', name: 'Quản lý học viên', module: 'Học viên' },
  { id: 8, code: 'MANAGE_EXAMS', name: 'Quản lý thi', module: 'Thi' },
  { id: 9, code: 'VIEW_REPORTS', name: 'Xem báo cáo', module: 'Báo cáo' },
  { id: 10, code: 'MANAGE_SETTINGS', name: 'Quản lý thiết lập', module: 'Thiết lập' },
];

export const mockCategories = [
  { id: 1, code: 'CERT_TYPE', name: 'Loại chứng chỉ', parentId: null, status: 'active', order: 1 },
  { id: 2, code: 'GENDER', name: 'Giới tính', parentId: null, status: 'active', order: 2 },
  { id: 3, code: 'ETHNICITY', name: 'Dân tộc', parentId: null, status: 'active', order: 3 },
  { id: 4, code: 'EXAM_STATUS', name: 'Trạng thái thi', parentId: null, status: 'active', order: 4 },
];

export const mockCertificates = [
  { id: 1, code: 'CNTT_CB', name: 'Chứng chỉ ứng dụng CNTT cơ bản', description: 'Chứng chỉ tin học cơ bản theo TT03', status: 'active', fee: 350000 },
  { id: 2, code: 'CNTT_NC', name: 'Chứng chỉ ứng dụng CNTT nâng cao', description: 'Chứng chỉ tin học nâng cao', status: 'active', fee: 500000 },
  { id: 3, code: 'AV_B1', name: 'Chứng chỉ Tiếng Anh B1', description: 'Chứng chỉ ngoại ngữ B1', status: 'active', fee: 400000 },
  { id: 4, code: 'AV_B2', name: 'Chứng chỉ Tiếng Anh B2', description: 'Chứng chỉ ngoại ngữ B2', status: 'active', fee: 600000 },
];

export const mockSubjects = [
  { id: 1, code: 'TH01', name: 'Tin học đại cương', credits: 3, certificateId: 1, status: 'active' },
  { id: 2, code: 'TH02', name: 'Xử lý văn bản', credits: 2, certificateId: 1, status: 'active' },
  { id: 3, code: 'TH03', name: 'Bảng tính điện tử', credits: 2, certificateId: 1, status: 'active' },
  { id: 4, code: 'NC01', name: 'Cơ sở dữ liệu', credits: 3, certificateId: 2, status: 'active' },
];

export const mockClassrooms = [
  { id: 1, code: 'PM101', name: 'Phòng máy 101', building: 'Nhà A', capacity: 40, type: 'computer', status: 'active' },
  { id: 2, code: 'PM102', name: 'Phòng máy 102', building: 'Nhà A', capacity: 35, type: 'computer', status: 'active' },
  { id: 3, code: 'PM201', name: 'Phòng máy 201', building: 'Nhà A', capacity: 45, type: 'computer', status: 'active' },
];

export const mockUnits = [
  { id: 1, code: 'DV01', name: 'Đại học Bách Khoa', status: 'active' },
  { id: 2, code: 'DV02', name: 'Đại học Kinh Tế', status: 'active' },
  { id: 3, code: 'DV03', name: 'Đại học Sư Phạm', status: 'active' },
  { id: 4, code: 'DV04', name: 'Đại học Ngoại Ngữ', status: 'active' },
  { id: 5, code: 'DV05', name: 'Đại học Công Nghệ TT&TT', status: 'active' },
  { id: 6, code: 'DV06', name: 'Trường Sư Phạm Kỹ Thuật', status: 'active' },
  { id: 7, code: 'DV07', name: 'Thí sinh tự do', status: 'active' },
];

export const mockBanners = [
  { id: 1, title: 'Tuyển sinh lớp CNTT cơ bản K25', image: '', link: '#', order: 1, status: 'active' },
  { id: 2, title: 'Lịch thi chứng chỉ CNTT tháng 5/2026', image: '', link: '#', order: 2, status: 'active' },
];

export const mockNotifications = [
  { id: 1, title: 'Thông báo lịch thi CNTT đợt tháng 4/2026', content: 'Trung tâm Phát triển Phần mềm thông báo lịch thi chứng chỉ ứng dụng CNTT đợt 3...', type: 'exam', date: '2026-04-10', status: 'active' },
  { id: 2, title: 'Khai giảng lớp Tin học cơ bản K25.01', content: 'Thông báo khai giảng lớp Tin học cơ bản khóa 25 vào ngày 20/04/2026...', type: 'class', date: '2026-04-08', status: 'active' },
];

export const mockCertificateClasses = [
  { id: 1, code: 'LCB25.01', name: 'Lớp CNTT cơ bản K25.01', certificateId: 1, startDate: '2026-04-20', endDate: '2026-06-20', maxStudents: 40, currentStudents: 35, status: 'active', fee: 350000 },
  { id: 2, code: 'LCB25.02', name: 'Lớp CNTT cơ bản K25.02', certificateId: 1, startDate: '2026-04-25', endDate: '2026-06-25', maxStudents: 40, currentStudents: 28, status: 'active', fee: 350000 },
  { id: 3, code: 'LNC25.01', name: 'Lớp CNTT nâng cao K25', certificateId: 2, startDate: '2026-05-01', endDate: '2026-07-01', maxStudents: 35, currentStudents: 20, status: 'upcoming', fee: 500000 },
  { id: 4, code: 'LAV25.01', name: 'Lớp Tiếng Anh B1 K25', certificateId: 3, startDate: '2026-03-01', endDate: '2026-05-01', maxStudents: 30, currentStudents: 30, status: 'completed', fee: 400000 },
];

export const mockStudents = [
  { id: 1, code: 'HV26.001', fullName: 'Nguyễn Thị Mai', dob: '2003-05-15', birthPlace: 'Đà Nẵng', gender: 'Nữ', phone: '0901111111', email: 'mai@gmail.com', cccd: '123456789012', school: 'ĐH Bách Khoa', classGroup: 'K20', classId: 1, examSessionId: 1, registrationDate: '2026-04-01', tuitionPaid: true, feePaid: true, status: 'active' },
  { id: 2, code: 'HV26.002', fullName: 'Trần Văn Hùng', dob: '2002-08-20', birthPlace: 'Quảng Nam', gender: 'Nam', phone: '0902222222', email: 'hung@gmail.com', cccd: '234567890123', school: 'ĐH Kinh Tế', classGroup: 'K21', classId: 1, examSessionId: 1, registrationDate: '2026-04-02', tuitionPaid: true, feePaid: false, status: 'active' },
  { id: 3, code: 'HV26.003', fullName: 'Lê Thị Hoa', dob: '2003-12-10', birthPlace: 'Huế', gender: 'Nữ', phone: '0903333333', email: 'hoa@gmail.com', cccd: '345678901234', school: 'ĐH Sư Phạm', classGroup: 'K20', classId: 1, examSessionId: 1, registrationDate: '2026-04-03', tuitionPaid: false, feePaid: false, status: 'active' },
  { id: 4, code: 'HV26.004', fullName: 'Phạm Minh Tuấn', dob: '2001-03-25', birthPlace: 'Quảng Ngãi', gender: 'Nam', phone: '0904444444', email: 'tuan@gmail.com', cccd: '456789012345', school: 'ĐH Công Nghệ TT&TT', classGroup: 'K22', classId: 2, examSessionId: 4, registrationDate: '2026-04-05', tuitionPaid: true, feePaid: true, status: 'active' },
  { id: 5, code: 'HV26.005', fullName: 'Hoàng Thị Linh', dob: '2003-07-08', birthPlace: 'Bình Định', gender: 'Nữ', phone: '0905555555', email: 'linh@gmail.com', cccd: '567890123456', school: 'ĐH Ngoại Ngữ', classGroup: 'K20', classId: 2, examSessionId: 4, registrationDate: '2026-04-06', tuitionPaid: false, feePaid: false, status: 'pending' },
  { id: 6, code: 'HV26.006', fullName: 'Bùi Quang Anh', dob: '2002-01-12', birthPlace: 'Đà Nẵng', gender: 'Nam', phone: '0906666666', email: 'anh@gmail.com', cccd: '678901234567', school: 'ĐH Sư Phạm Kỹ Thuật', classGroup: 'K21', classId: 1, examSessionId: 3, registrationDate: '2026-04-07', tuitionPaid: true, feePaid: true, status: 'active' },
  { id: 7, code: 'HV26.007', fullName: 'Vũ Thị Tuyết', dob: '2003-11-20', birthPlace: 'Gia Lai', gender: 'Nữ', phone: '0907777777', email: 'tuyet@gmail.com', cccd: '789012345678', school: 'ĐH Công Nghệ TT&TT', classGroup: 'K20', classId: 2, examSessionId: 4, registrationDate: '2026-04-08', tuitionPaid: true, feePaid: false, status: 'active' },
  { id: 8, code: 'HV26.008', fullName: 'Đỗ Văn Nam', dob: '2004-04-05', birthPlace: 'Kon Tum', gender: 'Nam', phone: '0908888888', email: 'nam@gmail.com', cccd: '890123456789', school: 'ĐH Bách Khoa', classGroup: 'K23', classId: 1, examSessionId: 3, registrationDate: '2026-04-09', tuitionPaid: false, feePaid: false, status: 'active' },
  { id: 9, code: 'HV26.009', fullName: 'Ngô Thu Trang', dob: '2003-09-18', birthPlace: 'Đà Nẵng', gender: 'Nữ', phone: '0909999999', email: 'trang@gmail.com', cccd: '901234567890', school: 'Bên ngoài', classGroup: '', classId: 2, examSessionId: 4, registrationDate: '2026-04-10', tuitionPaid: true, feePaid: true, status: 'active' },
  { id: 10, code: 'HV26.010', fullName: 'Hồ Lê Bảo', dob: '2002-12-30', birthPlace: 'Quảng Trị', gender: 'Nam', phone: '0911000111', email: 'bao@gmail.com', cccd: '012345678901', school: 'ĐH Kinh Tế', classGroup: 'K20', classId: 1, examSessionId: 3, registrationDate: '2026-04-11', tuitionPaid: true, feePaid: true, status: 'active' }
];

export const mockOnlineRegistrations = [
  { id: 1, fullName: 'Đặng Văn Khoa', dob: '2003-01-15', birthPlace: 'Đà Nẵng', gender: 'Nam', ethnicity: 'Kinh', phone: '0911222333', email: 'khoa@gmail.com', cccd: '111222333444', cccdDate: '2021-05-10', cccdPlace: 'Đà Nẵng', school: 'ĐH Bách Khoa', classGroup: 'K21', certificateId: 1, certificateName: 'Chứng chỉ ứng dụng CNTT cơ bản', examModule: '', otherRequest: 'Thi ca sáng', photo: '', submittedAt: '2026-04-10 08:30:00', status: 'pending', confirmed: false },
  { id: 2, fullName: 'Võ Thị Hương', dob: '2002-11-20', birthPlace: 'Quảng Nam', gender: 'Nữ', ethnicity: 'Kinh', phone: '0922333444', email: 'huong@gmail.com', cccd: '222333444555', cccdDate: '2020-08-15', cccdPlace: 'Quảng Nam', school: 'ĐH Kinh Tế', classGroup: 'K20', certificateId: 2, certificateName: 'Chứng chỉ ứng dụng CNTT nâng cao', examModule: 'Cơ sở dữ liệu', otherRequest: '', photo: '', submittedAt: '2026-04-11 10:00:00', status: 'confirmed', confirmed: true },
];

export const mockSchedules = [
  { id: 1, classId: 1, className: 'Lớp CNTT cơ bản K25.01', subjectId: 1, subjectName: 'Tin học đại cương', roomId: 1, roomName: 'PM101', instructor: 'ThS. Nguyễn Văn A', dayOfWeek: 2, startTime: '07:30', endTime: '09:30', startDate: '2026-04-20', endDate: '2026-05-20' },
];

export const mockInstructors = [
  { id: 1, code: 'GV001', fullName: 'ThS. Nguyễn Văn A', phone: '0901001001', email: 'gv.a@sdc.edu.vn', specialization: 'Tin học', status: 'active' },
];

export const mockExamSessions = [
  { id: 1, code: 'DT01.26', name: 'Đợt thi tháng 1/2026', exam_date: '2026-01-10', deadline: '2026-01-05', status: 'completed', location: 'Cơ sở 1' },
  { id: 2, code: 'DT03.26', name: 'Đợt thi tháng 3/2026', exam_date: '2026-03-21', deadline: '2026-03-15', status: 'completed', location: 'Cơ sở 1' },
  { id: 3, code: 'DT04.26', name: 'Đợt thi tháng 4/2026', exam_date: '2026-04-18', deadline: '2026-04-13', status: 'active', location: 'Cơ sở 2' },
  { id: 4, code: 'DT05.26', name: 'Đợt thi tháng 5/2026', exam_date: '2026-05-16', deadline: '2026-05-10', status: 'active', location: 'Cơ sở 1' },
  { id: 5, code: 'DT06.26', name: 'Đợt thi tháng 6/2026', exam_date: '2026-06-20', deadline: '2026-06-15', status: 'upcoming', location: 'Cơ sở 1' },
];

export const getNextId = (items) => {
  if (!items || !items.length) return 1;
  return Math.max(...items.map(i => i.id)) + 1;
};
