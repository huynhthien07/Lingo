-- Migration: Add Course Recommendation Fields
-- Date: 2025-12-28
-- Description: Add fields for course recommendation system

-- Add fields to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS band_from REAL,
ADD COLUMN IF NOT EXISTS band_to REAL,
ADD COLUMN IF NOT EXISTS enrollment_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS course_goal TEXT;

-- Add field to tests table
ALTER TABLE tests
ADD COLUMN IF NOT EXISTS is_admission BOOLEAN NOT NULL DEFAULT FALSE;

-- Add fields to test_attempts table
ALTER TABLE test_attempts
ADD COLUMN IF NOT EXISTS reading_band_score REAL,
ADD COLUMN IF NOT EXISTS listening_band_score REAL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tests_is_admission ON tests(is_admission);
CREATE INDEX IF NOT EXISTS idx_courses_band_range ON courses(band_from, band_to);
CREATE INDEX IF NOT EXISTS idx_course_recommendations_user ON course_recommendations(user_id);

-- Update existing courses with default values (example)
UPDATE courses 
SET 
  band_from = 5.0,
  band_to = 6.0,
  course_goal = 'IELTS'
WHERE band_from IS NULL;

-- Comments
COMMENT ON COLUMN courses.band_from IS 'Minimum band score required to enroll (e.g., 5.0)';
COMMENT ON COLUMN courses.band_to IS 'Target band score after completing the course (e.g., 6.0)';
COMMENT ON COLUMN courses.enrollment_count IS 'Number of students enrolled (for popularity ranking)';
COMMENT ON COLUMN courses.course_goal IS 'Course goal: IELTS or GENERAL_ENGLISH';
COMMENT ON COLUMN tests.is_admission IS 'Whether this test is used for admission/placement (shown on marketing page)';
COMMENT ON COLUMN test_attempts.reading_band_score IS 'Reading band score (calculated from reading section)';
COMMENT ON COLUMN test_attempts.listening_band_score IS 'Listening band score (calculated from listening section)';

