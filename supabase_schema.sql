-- =====================================================
-- SDC Web - Supabase Database Schema
-- Run this in Supabase SQL Editor to set up tables
-- =====================================================

-- 1. CERTIFICATES table
CREATE TABLE IF NOT EXISTS certificates (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  fee INTEGER DEFAULT 350000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REGISTRATIONS table (main: online registrations from public)
CREATE TABLE IF NOT EXISTS registrations (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  dob DATE,
  gender TEXT DEFAULT 'Nam',
  ethnicity TEXT DEFAULT 'Kinh',
  birth_place TEXT,
  phone TEXT,
  email TEXT,
  cccd TEXT,
  cccd_date DATE,
  cccd_place TEXT,
  school TEXT,
  class_group TEXT,
  certificate_id BIGINT REFERENCES certificates(id),
  exam_module TEXT,
  other_request TEXT,
  photo_base64 TEXT,
  status TEXT DEFAULT 'pending',       -- pending | approved
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NOTIFICATIONS table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'general',         -- exam | class | guide | general
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXAM_SESSIONS table
CREATE TABLE IF NOT EXISTS exam_sessions (
  id BIGSERIAL PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  exam_date DATE,
  deadline DATE,
  status TEXT DEFAULT 'upcoming',      -- upcoming | active | completed
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. UNITS table
CREATE TABLE IF NOT EXISTS units (
  id BIGSERIAL PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ROLES table
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PERMISSIONS table
CREATE TABLE IF NOT EXISTS permissions (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  module TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SCHEDULES table
CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  class_id BIGINT,
  class_name TEXT,
  subject_id BIGINT,
  subject_name TEXT,
  room_id BIGINT,
  room_name TEXT,
  instructor TEXT,
  day_of_week INTEGER,
  start_time TEXT,
  end_time TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USERS table (admin/staff accounts)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'staff',          -- admin | staff | viewer
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BANNERS table
CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT,
  link TEXT,
  "order" INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CATEGORIES table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  parent_id BIGINT,
  status TEXT DEFAULT 'active',
  "order" INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - IMPORTANT for Supabase
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;


-- Public READ on certificates, notifications, exam_sessions
CREATE POLICY "Public read certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Public read exam_sessions" ON exam_sessions FOR SELECT USING (true);
CREATE POLICY "Public read units" ON units FOR SELECT USING (true);

-- Public INSERT on registrations (anyone can register)
CREATE POLICY "Anyone can register" ON registrations FOR INSERT WITH CHECK (true);

-- Public READ registrations by CCCD or phone (for lookup)
CREATE POLICY "Self lookup registrations" ON registrations FOR SELECT USING (true);

-- Full access with anon key (for admin - use service_role in production)
CREATE POLICY "Full access registrations" ON registrations FOR ALL USING (true);
CREATE POLICY "Full access certificates" ON certificates FOR ALL USING (true);
CREATE POLICY "Full access notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Full access exam_sessions" ON exam_sessions FOR ALL USING (true);
CREATE POLICY "Full access units" ON units FOR ALL USING (true);
CREATE POLICY "Full access roles" ON roles FOR ALL USING (true);
CREATE POLICY "Full access permissions" ON permissions FOR ALL USING (true);
CREATE POLICY "Full access schedules" ON schedules FOR ALL USING (true);
CREATE POLICY "Full access users" ON users FOR ALL USING (true);
CREATE POLICY "Full access banners" ON banners FOR ALL USING (true);
CREATE POLICY "Full access categories" ON categories FOR ALL USING (true);


-- =====================================================
-- SEED DATA - Insert initial data
-- =====================================================

-- Certificates
INSERT INTO certificates (code, name, description, status, fee) VALUES
  ('CNTT_CB', 'Chứng chỉ ứng dụng CNTT cơ bản', 'Chứng chỉ tin học cơ bản theo TT03', 'active', 350000),
  ('CNTT_NC', 'Chứng chỉ ứng dụng CNTT nâng cao', 'Chứng chỉ tin học nâng cao', 'active', 500000),
  ('AV_B1', 'Chứng chỉ Tiếng Anh B1', 'Chứng chỉ ngoại ngữ B1', 'active', 400000),
  ('AV_B2', 'Chứng chỉ Tiếng Anh B2', 'Chứng chỉ ngoại ngữ B2', 'active', 600000)
ON CONFLICT DO NOTHING;

-- Notifications
INSERT INTO notifications (title, content, type, date, status) VALUES
  ('Thông báo lịch thi CNTT đợt tháng 4/2026', 'Trung tâm Phát triển Phần mềm thông báo lịch thi chứng chỉ ứng dụng CNTT đợt 3...', 'exam', '2026-04-10', 'active'),
  ('Khai giảng lớp Tin học cơ bản K25.01', 'Thông báo khai giảng lớp Tin học cơ bản khóa 25 vào ngày 20/04/2026...', 'class', '2026-04-08', 'active')
ON CONFLICT DO NOTHING;

-- Exam Sessions
INSERT INTO exam_sessions (code, name, exam_date, deadline, status, location) VALUES
  ('DT01.26', 'Đợt thi tháng 1/2026', '2026-01-10', '2026-01-05', 'completed', 'Cơ sở 1'),
  ('DT03.26', 'Đợt thi tháng 3/2026', '2026-03-21', '2026-03-15', 'completed', 'Cơ sở 1'),
  ('DT04.26', 'Đợt thi tháng 4/2026', '2026-04-18', '2026-04-13', 'active', 'Cơ sở 2'),
  ('DT05.26', 'Đợt thi tháng 5/2026', '2026-05-16', '2026-05-10', 'active', 'Cơ sở 1'),
  ('DT06.26', 'Đợt thi tháng 6/2026', '2026-06-20', '2026-06-15', 'upcoming', 'Cơ sở 1')
ON CONFLICT DO NOTHING;

-- Units
INSERT INTO units (code, name, status) VALUES
  ('DV01', 'Đại học Bách Khoa', 'active'),
  ('DV02', 'Đại học Kinh Tế', 'active'),
  ('DV03', 'Đại học Sư Phạm', 'active'),
  ('DV04', 'Đại học Ngoại Ngữ', 'active'),
  ('DV05', 'Đại học Công Nghệ TT&TT', 'active'),
  ('DV07', 'Thí sinh tự do', 'active')
ON CONFLICT DO NOTHING;

-- Admin users (CHANGE PASSWORDS IN PRODUCTION!)
INSERT INTO users (username, password, full_name, email, role, status) VALUES
  ('admin', 'admin123', 'Nguyễn Văn An', 'admin@sdc.edu.vn', 'admin', 'active'),
  ('staff1', 'staff123', 'Trần Thị Bình', 'binh@sdc.edu.vn', 'staff', 'active')
ON CONFLICT (username) DO NOTHING;

-- Banners
INSERT INTO banners (title, link, "order", status) VALUES
  ('Tuyển sinh lớp CNTT cơ bản K25', '#', 1, 'active'),
  ('Lịch thi chứng chỉ CNTT tháng 5/2026', '#', 2, 'active')
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO categories (code, name, status, "order") VALUES
  ('CERT_TYPE', 'Loại chứng chỉ', 'active', 1),
  ('GENDER', 'Giới tính', 'active', 2),
  ('ETHNICITY', 'Dân tộc', 'active', 3),
  ('EXAM_STATUS', 'Trạng thái thi', 'active', 4)
ON CONFLICT DO NOTHING;
