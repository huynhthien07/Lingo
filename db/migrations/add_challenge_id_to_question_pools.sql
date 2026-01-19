-- Add challenge_id to question_labels and question_items
-- This allows scoping labels/items to a specific exercise (challenge)
-- instead of sharing across the entire lesson

-- Add challenge_id to question_labels
ALTER TABLE question_labels 
ADD COLUMN IF NOT EXISTS challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE;

-- Add challenge_id to question_items
ALTER TABLE question_items 
ADD COLUMN IF NOT EXISTS challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_question_labels_challenge_id ON question_labels(challenge_id);
CREATE INDEX IF NOT EXISTS idx_question_items_challenge_id ON question_items(challenge_id);

-- Note: lesson_id and test_id are kept for backward compatibility
-- New code should use challenge_id for exercises

