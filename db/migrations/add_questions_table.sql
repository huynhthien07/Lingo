-- Add questions table for exercises
-- Each exercise can have multiple questions
-- Each question can have multiple options/answers

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Modify challenge_options to reference questions instead of challenges
-- First, add the new column
ALTER TABLE challenge_options ADD COLUMN question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_questions_challenge_id ON questions(challenge_id);
CREATE INDEX idx_challenge_options_question_id ON challenge_options(question_id);

-- Note: We keep challenge_id in challenge_options for backward compatibility
-- New exercises will use question_id, old exercises will use challenge_id

