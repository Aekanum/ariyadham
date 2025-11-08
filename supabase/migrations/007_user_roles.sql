-- Migration 007: User Roles & Permissions
-- Story 2.2: Implement role-based access control
-- Created: 2025-11-08

-- ============================================================================
-- 1. CREATE ROLE ENUM TYPE
-- ============================================================================

-- Create user_role enum type (reader, author, admin)
CREATE TYPE user_role AS ENUM ('reader', 'author', 'admin');

COMMENT ON TYPE user_role IS 'User role types: reader (default), author (can create content), admin (full access)';

-- ============================================================================
-- 2. ADD ROLE COLUMN TO USER_PROFILES
-- ============================================================================

-- Add role column with default 'reader'
ALTER TABLE user_profiles
ADD COLUMN role user_role DEFAULT 'reader' NOT NULL;

COMMENT ON COLUMN user_profiles.role IS 'User role determining access permissions';

-- Create index for efficient role lookups
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- ============================================================================
-- 3. CREATE ROLE CHANGE AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE role_change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_role user_role,
  new_role user_role NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE role_change_logs IS 'Audit log for all user role changes';
COMMENT ON COLUMN role_change_logs.user_id IS 'User whose role was changed';
COMMENT ON COLUMN role_change_logs.old_role IS 'Previous role (NULL for initial assignment)';
COMMENT ON COLUMN role_change_logs.new_role IS 'New role assigned';
COMMENT ON COLUMN role_change_logs.changed_by IS 'Admin who made the change';
COMMENT ON COLUMN role_change_logs.reason IS 'Optional reason for the change';

-- Create index for efficient log queries
CREATE INDEX idx_role_change_logs_user_id ON role_change_logs(user_id);
CREATE INDEX idx_role_change_logs_changed_by ON role_change_logs(changed_by);
CREATE INDEX idx_role_change_logs_created_at ON role_change_logs(created_at DESC);

-- ============================================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on role_change_logs
ALTER TABLE role_change_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view role change logs
CREATE POLICY "Admins can view role change logs"
  ON role_change_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Only admins can insert role change logs
CREATE POLICY "Admins can insert role change logs"
  ON role_change_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- No UPDATE or DELETE policies - logs are immutable

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(check_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION has_role IS 'Check if current user has specific role';

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION has_any_role(check_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = ANY(check_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION has_any_role IS 'Check if current user has any of the specified roles';

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  user_role_value user_role;
BEGIN
  SELECT role INTO user_role_value
  FROM user_profiles
  WHERE user_id = auth.uid();

  RETURN COALESCE(user_role_value, 'reader'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_role IS 'Get current user role (defaults to reader)';

-- ============================================================================
-- 6. UPDATE EXISTING RLS POLICIES
-- ============================================================================

-- Note: These are example policies that would be added to content tables
-- Actual implementation will be done when creating articles table

-- Example: Policy for articles table (will be created in future migration)
-- CREATE POLICY "Authors can create articles"
--   ON articles FOR INSERT
--   WITH CHECK (has_any_role(ARRAY['author'::user_role, 'admin'::user_role]));

-- CREATE POLICY "Authors can update own articles"
--   ON articles FOR UPDATE
--   USING (
--     author_id = auth.uid()
--     AND has_any_role(ARRAY['author'::user_role, 'admin'::user_role])
--   );

-- CREATE POLICY "Admins can update any article"
--   ON articles FOR UPDATE
--   USING (has_role('admin'::user_role));

-- ============================================================================
-- 7. SEED DEFAULT ADMIN (Optional - for development)
-- ============================================================================

-- Note: In production, the first admin should be created manually
-- This is commented out for security - enable only in development

-- UPDATE user_profiles
-- SET role = 'admin'
-- WHERE user_id = (
--   SELECT id FROM auth.users
--   ORDER BY created_at ASC
--   LIMIT 1
-- );

-- ============================================================================
-- 8. GRANTS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON role_change_logs TO authenticated;
GRANT INSERT ON role_change_logs TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION has_role(user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION has_any_role(user_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;

-- ============================================================================
-- ROLLBACK (For reference - do not execute)
-- ============================================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS get_user_role();
-- DROP FUNCTION IF EXISTS has_any_role(user_role[]);
-- DROP FUNCTION IF EXISTS has_role(user_role);
-- DROP TABLE IF EXISTS role_change_logs;
-- DROP INDEX IF EXISTS idx_user_profiles_role;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS role;
-- DROP TYPE IF EXISTS user_role;
