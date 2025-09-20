-- Insert auth users for seed profiles
-- WARNING: This directly manipulates Supabase Auth tables - use with caution!

-- Insert fake auth users that correspond to your seed profiles
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  aud,
  role
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440101',
    'john.teacher@school.edu',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    'authenticated',
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440103',
    'alice.student@school.edu',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    'authenticated',
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440104',
    'bob.student@school.edu',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    'authenticated',
    'authenticated'
  );

-- Also insert into auth.identities
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  created_at,
  updated_at
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440101',
    '{"sub": "550e8400-e29b-41d4-a716-446655440101", "email": "john.teacher@school.edu"}',
    'email',
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440103',
    '550e8400-e29b-41d4-a716-446655440103',
    '550e8400-e29b-41d4-a716-446655440103',
    '{"sub": "550e8400-e29b-41d4-a716-446655440103", "email": "alice.student@school.edu"}',
    'email',
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440104',
    '550e8400-e29b-41d4-a716-446655440104',
    '{"sub": "550e8400-e29b-41d4-a716-446655440104", "email": "bob.student@school.edu"}',
    'email',
    NOW(),
    NOW()
  );

-- Note: Password for all test users is 'password123'