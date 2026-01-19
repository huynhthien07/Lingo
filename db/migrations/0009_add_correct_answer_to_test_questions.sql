-- Migration: Add correctAnswer and explanation fields to test_questions table
-- Date: 2026-01-10
-- Purpose: Support TEXT_INPUT question validation in tests

-- Add correctAnswer field for TEXT_INPUT questions
ALTER TABLE test_questions 
ADD COLUMN IF NOT EXISTS correct_answer TEXT;

-- Add explanation field for answer explanations
ALTER TABLE test_questions 
ADD COLUMN IF NOT EXISTS explanation TEXT;

-- Add comments
COMMENT ON COLUMN test_questions.correct_answer IS 'Correct answer for TEXT_INPUT questions (e.g., fill-in-blank, short answer)';
COMMENT ON COLUMN test_questions.explanation IS 'Explanation for the correct answer';

