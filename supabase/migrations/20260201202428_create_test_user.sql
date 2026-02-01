-- =====================================================
-- Migration: Create Test User for Development
-- =====================================================
-- Purpose: Create a test user for local development and testing
-- User: grze963@gmail.com
-- Password: Dupa123!@#
-- Note: This migration is for development only and should NOT be used in production
-- =====================================================

-- Check if the test user already exists before inserting
DO $$
DECLARE
  test_user_id uuid;
  test_email text := 'grze963@gmail.com';
  test_password text := 'Dupa123!@#';
BEGIN
  -- Check if user exists
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = test_email;

  -- If user doesn't exist, create it
  IF test_user_id IS NULL THEN
    -- Use a fixed UUID for test user (for consistent testing)
    test_user_id := '8db7f0bc-a0a3-4cb9-9a6c-ea874aaf85bc'::uuid;

    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      test_user_id,
      'authenticated',
      'authenticated',
      test_email,
      crypt(test_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      test_user_id,
      test_user_id,
      format('{"sub":"%s","email":"%s"}', test_user_id::text, test_email)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Test user created: % with ID: %', test_email, test_user_id;
  ELSE
    RAISE NOTICE 'Test user already exists: % with ID: %', test_email, test_user_id;
  END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
