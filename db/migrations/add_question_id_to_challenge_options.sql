-- Add question_id column to challenge_options table
ALTER TABLE challenge_options 
ADD COLUMN IF NOT EXISTS question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_challenge_options_question_id ON challenge_options(question_id);

