-- =====================================================
-- Migration: Allow NULL user_id in generation_requests
-- =====================================================
-- Purpose: Enable guest users to create generation requests
-- Changes:
--   - Make user_id nullable in generation_requests table
--   - This allows anonymous users to test flashcard generation
--   - Saving flashcards to decks still requires authentication
-- =====================================================

-- Make user_id nullable in generation_requests
ALTER TABLE generation_requests
ALTER COLUMN user_id DROP NOT NULL;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
--   - Guest users can now create generation requests
--   - User isolation for generation requests is handled in application layer
--   - Saving flashcards to decks (via accept endpoint) still requires auth
-- =====================================================
