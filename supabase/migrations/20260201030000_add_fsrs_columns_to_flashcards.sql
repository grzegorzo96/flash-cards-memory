-- =====================================================
-- Migration: Add FSRS columns to flashcards table
-- =====================================================
-- Purpose: Add stability and difficulty columns to flashcards table
--          to support FSRS (Free Spaced Repetition Scheduler) algorithm
-- Rationale: These columns are needed to track the current FSRS state
--            of each flashcard for spaced repetition scheduling
-- =====================================================

-- Add stability column (tracks memory stability in days)
-- NULL for new cards that haven't been reviewed yet
ALTER TABLE flashcards 
ADD COLUMN stability numeric(6,2) NULL;

-- Add difficulty column (tracks card difficulty, range 0-10)
-- NULL for new cards that haven't been reviewed yet
ALTER TABLE flashcards 
ADD COLUMN difficulty numeric(5,2) NULL;

-- Add comment to document the columns
COMMENT ON COLUMN flashcards.stability IS 'FSRS stability parameter: estimated number of days until retrievability drops to 90%';
COMMENT ON COLUMN flashcards.difficulty IS 'FSRS difficulty parameter: represents the inherent difficulty of the card (0-10 scale)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
--   - Added stability column to flashcards table
--   - Added difficulty column to flashcards table
--   - Both columns are nullable (NULL for new/unreviewed cards)
--   - Existing flashcards will have NULL values initially
--   - Values will be populated after first review
-- =====================================================
