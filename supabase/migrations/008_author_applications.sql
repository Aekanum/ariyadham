-- Migration 008: Author Applications System
-- This migration creates the author application workflow tables and policies

-- Create application status enum
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');

-- Create author_applications table
CREATE TABLE author_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Application details
  bio TEXT NOT NULL,
  credentials TEXT NOT NULL,
  writing_samples TEXT,
  motivation TEXT,

  -- Status tracking
  status application_status DEFAULT 'pending' NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT one_application_per_user UNIQUE (user_id)
);

-- Create indexes for performance
CREATE INDEX idx_author_applications_user_id ON author_applications(user_id);
CREATE INDEX idx_author_applications_status ON author_applications(status);
CREATE INDEX idx_author_applications_created_at ON author_applications(created_at DESC);

-- Enable RLS
ALTER TABLE author_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON author_applications FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own applications (if no existing application)
CREATE POLICY "Users can create own applications"
  ON author_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM author_applications
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can withdraw their pending applications
CREATE POLICY "Users can withdraw pending applications"
  ON author_applications FOR UPDATE
  USING (
    auth.uid() = user_id AND
    status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id AND
    status = 'withdrawn'
  );

-- RLS Policy: Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON author_applications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- RLS Policy: Admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications"
  ON author_applications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_author_applications_updated_at
  BEFORE UPDATE ON author_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE author_applications IS 'Stores author role applications for approval workflow';
COMMENT ON COLUMN author_applications.bio IS 'Applicant bio (100-1000 chars)';
COMMENT ON COLUMN author_applications.credentials IS 'Applicant credentials and experience (50-2000 chars)';
COMMENT ON COLUMN author_applications.writing_samples IS 'Optional writing samples or links';
COMMENT ON COLUMN author_applications.motivation IS 'Why applicant wants to become author (100-1000 chars)';
COMMENT ON COLUMN author_applications.status IS 'Application status: pending, approved, rejected, withdrawn';
COMMENT ON COLUMN author_applications.reviewed_by IS 'Admin user who reviewed the application';
COMMENT ON COLUMN author_applications.reviewed_at IS 'Timestamp of review';
COMMENT ON COLUMN author_applications.rejection_reason IS 'Optional reason provided when rejecting';
