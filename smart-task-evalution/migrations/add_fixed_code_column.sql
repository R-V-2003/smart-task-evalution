-- Add fixed_code column to evaluations table
-- This column stores the AI-generated fixed/improved version of the user's code

ALTER TABLE evaluations
ADD COLUMN IF NOT EXISTS fixed_code TEXT;

-- Add comment to column
COMMENT ON COLUMN evaluations.fixed_code IS 'Complete rewritten code with all bugs fixed, refactoring applied, and performance optimizations';
