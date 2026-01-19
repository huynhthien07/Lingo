-- Migration: Allow Guest Users for Admission Tests
-- Date: 2026-01-10
-- Purpose: Allow test_attempts.user_id to be NULL for guest admission test attempts

-- Drop the foreign key constraint on test_attempts.user_id
ALTER TABLE test_attempts 
DROP CONSTRAINT IF EXISTS test_attempts_user_id_users_user_id_fk;

-- Make user_id nullable
ALTER TABLE test_attempts 
ALTER COLUMN user_id DROP NOT NULL;

-- Add back the foreign key constraint with ON DELETE SET NULL
ALTER TABLE test_attempts 
ADD CONSTRAINT test_attempts_user_id_users_user_id_fk 
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- Add comment
COMMENT ON COLUMN test_attempts.user_id IS 'User ID (nullable for guest admission test attempts)';

