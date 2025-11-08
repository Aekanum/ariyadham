-- Migration 016: User Action Logs
-- Story 6.2: User Management - Audit trail for user actions
-- Created: 2025-11-08

-- ============================================================================
-- CREATE USER ACTION LOGS TABLE
-- ============================================================================

CREATE TABLE user_action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE user_action_logs IS 'Audit log for all user management actions (activate, deactivate, etc.)';
COMMENT ON COLUMN user_action_logs.user_id IS 'User who was affected by the action';
COMMENT ON COLUMN user_action_logs.action_type IS 'Type of action performed (activated, deactivated, etc.)';
COMMENT ON COLUMN user_action_logs.performed_by IS 'Admin who performed the action';
COMMENT ON COLUMN user_action_logs.metadata IS 'Additional metadata about the action (reason, previous state, etc.)';

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_user_action_logs_user_id ON user_action_logs(user_id);
CREATE INDEX idx_user_action_logs_performed_by ON user_action_logs(performed_by);
CREATE INDEX idx_user_action_logs_action_type ON user_action_logs(action_type);
CREATE INDEX idx_user_action_logs_created_at ON user_action_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_action_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view user action logs
CREATE POLICY "Admins can view user action logs"
  ON user_action_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Only admins can insert user action logs
CREATE POLICY "Admins can insert user action logs"
  ON user_action_logs
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
-- GRANTS
-- ============================================================================

GRANT SELECT ON user_action_logs TO authenticated;
GRANT INSERT ON user_action_logs TO authenticated;
