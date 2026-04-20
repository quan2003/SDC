-- Fix RLS user_profiles: Xóa policy bị lỗi đệ quy, thay bằng policy đơn giản
DROP POLICY IF EXISTS "Users read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON user_profiles;

-- Cho phép mọi user đã đăng nhập đọc profile của mình
CREATE POLICY "Authenticated read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Cho phép mọi user đã đăng nhập INSERT profile của mình
CREATE POLICY "Authenticated insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Cho phép mọi user đã đăng nhập UPDATE profile của mình
CREATE POLICY "Authenticated update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Xác nhận
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_profiles';
