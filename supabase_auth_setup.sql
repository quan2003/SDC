-- =====================================================================
-- SDC Web - Supabase Auth Security Setup (FIX: drop-before-create)
-- Chạy script này trong Supabase SQL Editor
-- =====================================================================

-- ──────────────────────────────────────────────────────────────────────
-- 1. BẢNG user_profiles
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'staff', 'viewer')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop tất cả policy cũ của user_profiles trước
DROP POLICY IF EXISTS "Users read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON user_profiles;

CREATE POLICY "Users read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin full access profiles"
  ON user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON user_profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────────────
-- 2. RLS cho bảng registrations
-- ──────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Full access registrations" ON registrations;
DROP POLICY IF EXISTS "Anyone can register" ON registrations;
DROP POLICY IF EXISTS "Self lookup registrations" ON registrations;
DROP POLICY IF EXISTS "Public insert registrations" ON registrations;
DROP POLICY IF EXISTS "Public read registrations" ON registrations;
DROP POLICY IF EXISTS "Admin staff update registrations" ON registrations;
DROP POLICY IF EXISTS "Admin delete registrations" ON registrations;

CREATE POLICY "Public insert registrations"
  ON registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read registrations"
  ON registrations FOR SELECT
  USING (true);

CREATE POLICY "Admin staff update registrations"
  ON registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin delete registrations"
  ON registrations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

-- ──────────────────────────────────────────────────────────────────────
-- 3. RLS cho các bảng quản trị
-- ──────────────────────────────────────────────────────────────────────

-- notifications
DROP POLICY IF EXISTS "Full access notifications" ON notifications;
DROP POLICY IF EXISTS "Public read notifications" ON notifications;
DROP POLICY IF EXISTS "Staff manage notifications" ON notifications;
CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Staff manage notifications" ON notifications FOR ALL
  USING (auth.role() = 'authenticated');

-- certificates
DROP POLICY IF EXISTS "Full access certificates" ON certificates;
DROP POLICY IF EXISTS "Public read certificates" ON certificates;
DROP POLICY IF EXISTS "Admin manage certificates" ON certificates;
CREATE POLICY "Public read certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Admin manage certificates" ON certificates FOR ALL
  USING (auth.role() = 'authenticated');

-- exam_sessions
DROP POLICY IF EXISTS "Full access exam_sessions" ON exam_sessions;
DROP POLICY IF EXISTS "Public read exam_sessions" ON exam_sessions;
DROP POLICY IF EXISTS "Staff manage exam_sessions" ON exam_sessions;
CREATE POLICY "Public read exam_sessions" ON exam_sessions FOR SELECT USING (true);
CREATE POLICY "Staff manage exam_sessions" ON exam_sessions FOR ALL
  USING (auth.role() = 'authenticated');

-- units
DROP POLICY IF EXISTS "Full access units" ON units;
DROP POLICY IF EXISTS "Public read units" ON units;
DROP POLICY IF EXISTS "Admin manage units" ON units;
CREATE POLICY "Public read units" ON units FOR SELECT USING (true);
CREATE POLICY "Admin manage units" ON units FOR ALL
  USING (auth.role() = 'authenticated');

-- banners
DROP POLICY IF EXISTS "Full access banners" ON banners;
DROP POLICY IF EXISTS "Public read banners" ON banners;
DROP POLICY IF EXISTS "Admin manage banners" ON banners;
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Admin manage banners" ON banners FOR ALL
  USING (auth.role() = 'authenticated');

-- categories
DROP POLICY IF EXISTS "Full access categories" ON categories;
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Admin manage categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON categories FOR ALL
  USING (auth.role() = 'authenticated');

-- roles
DROP POLICY IF EXISTS "Full access roles" ON roles;
DROP POLICY IF EXISTS "Authenticated manage roles" ON roles;
CREATE POLICY "Authenticated manage roles" ON roles FOR ALL
  USING (auth.role() = 'authenticated');

-- permissions
DROP POLICY IF EXISTS "Full access permissions" ON permissions;
DROP POLICY IF EXISTS "Authenticated manage permissions" ON permissions;
CREATE POLICY "Authenticated manage permissions" ON permissions FOR ALL
  USING (auth.role() = 'authenticated');

-- schedules
DROP POLICY IF EXISTS "Full access schedules" ON schedules;
DROP POLICY IF EXISTS "Authenticated manage schedules" ON schedules;
CREATE POLICY "Authenticated manage schedules" ON schedules FOR ALL
  USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────────────────────
-- HOÀN THÀNH
-- Tiếp theo: Tạo admin user trong Dashboard → Authentication → Users
-- Sau đó chạy INSERT vào user_profiles:
--
-- INSERT INTO user_profiles (id, full_name, role, status)
-- VALUES ('UUID-từ-Auth-Dashboard', 'Tên Admin', 'admin', 'active');
-- ──────────────────────────────────────────────────────────────────────
