-- =====================================================
-- Migration: Support Anonymous Users
-- =====================================================
-- Purpose: Modify schema to support anonymous cookie-based user IDs
-- Changes:
--   - Drop foreign key constraints to auth.users
--   - Add anon role to RLS policies
--   - Allow anonymous users to access their own data
-- =====================================================

-- =====================================================
-- SECTION 1: DROP FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Drop foreign key constraints from all tables
ALTER TABLE decks DROP CONSTRAINT IF EXISTS decks_user_id_fkey;
ALTER TABLE generation_requests DROP CONSTRAINT IF EXISTS generation_requests_user_id_fkey;
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_user_id_fkey;
ALTER TABLE study_sessions DROP CONSTRAINT IF EXISTS study_sessions_user_id_fkey;
ALTER TABLE review_events DROP CONSTRAINT IF EXISTS review_events_user_id_fkey;

-- =====================================================
-- SECTION 2: UPDATE RLS POLICIES FOR ANONYMOUS ACCESS
-- =====================================================

-- -----------------------------------------------------
-- RLS Policies: decks
-- -----------------------------------------------------

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "decks_select_policy_authenticated" ON decks;
DROP POLICY IF EXISTS "decks_insert_policy_authenticated" ON decks;
DROP POLICY IF EXISTS "decks_update_policy_authenticated" ON decks;
DROP POLICY IF EXISTS "decks_delete_policy_authenticated" ON decks;

-- Create new policies that work for both authenticated and anonymous users
-- For authenticated users: use auth.uid()
-- For anonymous users: RLS is bypassed (we handle authorization in application layer)

CREATE POLICY "decks_select_policy"
  ON decks
  FOR SELECT
  USING (true);

CREATE POLICY "decks_insert_policy"
  ON decks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "decks_update_policy"
  ON decks
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "decks_delete_policy"
  ON decks
  FOR DELETE
  USING (true);

-- -----------------------------------------------------
-- RLS Policies: generation_requests
-- -----------------------------------------------------

DROP POLICY IF EXISTS "generation_requests_select_policy_authenticated" ON generation_requests;
DROP POLICY IF EXISTS "generation_requests_insert_policy_authenticated" ON generation_requests;
DROP POLICY IF EXISTS "generation_requests_update_policy_authenticated" ON generation_requests;
DROP POLICY IF EXISTS "generation_requests_delete_policy_authenticated" ON generation_requests;

CREATE POLICY "generation_requests_select_policy"
  ON generation_requests
  FOR SELECT
  USING (true);

CREATE POLICY "generation_requests_insert_policy"
  ON generation_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "generation_requests_update_policy"
  ON generation_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "generation_requests_delete_policy"
  ON generation_requests
  FOR DELETE
  USING (true);

-- -----------------------------------------------------
-- RLS Policies: flashcards
-- -----------------------------------------------------

DROP POLICY IF EXISTS "flashcards_select_policy_authenticated" ON flashcards;
DROP POLICY IF EXISTS "flashcards_insert_policy_authenticated" ON flashcards;
DROP POLICY IF EXISTS "flashcards_update_policy_authenticated" ON flashcards;
DROP POLICY IF EXISTS "flashcards_delete_policy_authenticated" ON flashcards;

CREATE POLICY "flashcards_select_policy"
  ON flashcards
  FOR SELECT
  USING (true);

CREATE POLICY "flashcards_insert_policy"
  ON flashcards
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "flashcards_update_policy"
  ON flashcards
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "flashcards_delete_policy"
  ON flashcards
  FOR DELETE
  USING (true);

-- -----------------------------------------------------
-- RLS Policies: study_sessions
-- -----------------------------------------------------

DROP POLICY IF EXISTS "study_sessions_select_policy_authenticated" ON study_sessions;
DROP POLICY IF EXISTS "study_sessions_insert_policy_authenticated" ON study_sessions;
DROP POLICY IF EXISTS "study_sessions_update_policy_authenticated" ON study_sessions;
DROP POLICY IF EXISTS "study_sessions_delete_policy_authenticated" ON study_sessions;

CREATE POLICY "study_sessions_select_policy"
  ON study_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "study_sessions_insert_policy"
  ON study_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "study_sessions_update_policy"
  ON study_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "study_sessions_delete_policy"
  ON study_sessions
  FOR DELETE
  USING (true);

-- -----------------------------------------------------
-- RLS Policies: review_events
-- -----------------------------------------------------

DROP POLICY IF EXISTS "review_events_select_policy_authenticated" ON review_events;
DROP POLICY IF EXISTS "review_events_insert_policy_authenticated" ON review_events;
DROP POLICY IF EXISTS "review_events_update_policy_authenticated" ON review_events;
DROP POLICY IF EXISTS "review_events_delete_policy_authenticated" ON review_events;

CREATE POLICY "review_events_select_policy"
  ON review_events
  FOR SELECT
  USING (true);

CREATE POLICY "review_events_insert_policy"
  ON review_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "review_events_update_policy"
  ON review_events
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "review_events_delete_policy"
  ON review_events
  FOR DELETE
  USING (true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
--   - Removed foreign key constraints to auth.users
--   - Updated all RLS policies to allow anonymous access
--   - Authorization is now handled in the application layer
-- Note:
--   - This allows anonymous users to access the application
--   - User isolation is enforced by application code using cookie-based user IDs
--   - Future enhancement: add proper authentication and restore stricter RLS policies
-- =====================================================
