-- 1. Tạo hàm SECURITY DEFINER để check quyền admin (bỏ qua RLS để tránh đệ quy)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Chạy với quyền của owner (Postgres), bỏ qua RLS
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Thêm policy cho phép Admin quản lý toàn bộ user_profiles
DROP POLICY IF EXISTS "Admin full access profiles" ON user_profiles;
CREATE POLICY "Admin full access profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING ( is_admin() );

-- Tương tự cho staff nếu cần (Ví dụ: đọc tất cả hồ sơ người dùng)
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
END;
$$;
