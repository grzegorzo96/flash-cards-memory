-- =====================================================
-- Migration: Create Domains Table
-- =====================================================
-- Purpose: Store custom user domains for flashcard generation
-- Features:
--   - User-specific custom domains
--   - RLS policies for data isolation
--   - Unique constraint per user to prevent duplicates
-- =====================================================

-- -----------------------------------------------------
-- Table: domains
-- -----------------------------------------------------
-- Purpose: Store custom domains created by users
-- Features:
--   - Links to user via user_id
--   - Unique domain names per user
--   - Minimum name length of 2 characters
-- -----------------------------------------------------
create table domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  
  -- ensure unique domain names per user
  constraint domains_user_id_name_unique unique (user_id, name),
  
  -- enforce minimum name length
  constraint domains_name_length_check check (char_length(name) >= 2 and char_length(name) <= 100)
);

-- enable row level security
alter table domains enable row level security;

-- -----------------------------------------------------
-- RLS Policies: domains
-- -----------------------------------------------------
-- Rationale: Users can only access their own domains
-- All operations (select, insert, delete) are restricted to user_id = auth.uid()
-- -----------------------------------------------------

-- policy: authenticated users can select their own domains
create policy "domains_select_policy_authenticated"
  on domains
  for select
  to authenticated
  using (user_id = auth.uid());

-- policy: authenticated users can insert their own domains
create policy "domains_insert_policy_authenticated"
  on domains
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- policy: authenticated users can delete their own domains
create policy "domains_delete_policy_authenticated"
  on domains
  for delete
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------
-- Index: domains_user_id_created_at_idx
-- -----------------------------------------------------
-- Purpose: Optimize queries for fetching user domains
create index domains_user_id_created_at_idx on domains(user_id, created_at desc);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
