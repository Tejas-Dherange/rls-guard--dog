-- Fix the missing profiles, students, and progress data
-- This addresses the empty tables issue identified in debug

-- First, let's add profiles for existing auth users
-- Note: You'll need to replace these UUIDs with your actual auth user IDs

-- Insert profiles (replace the IDs with your actual auth user IDs from /debug page)
INSERT INTO profiles (id, email, full_name, role) VALUES
  -- Replace 'YOUR_ACTUAL_USER_ID_HERE' with the ID shown in /debug page
  ('YOUR_ACTUAL_USER_ID_HERE', 'tejudherange2182@gmail.com', 'Tejas Dherange', 'head_teacher')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Add additional test profiles (you can sign up with these emails later)
INSERT INTO profiles (id, email, full_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440101', 'one@gmail.com', 'Tej Teacher', 'teacher'),
  ('550e8400-e29b-41d4-a716-446655440102', 'tejasdherange0099@gmail.com', 'Teju Student', 'student'),
  ('550e8400-e29b-41d4-a716-446655440103', 'tejas@gmail.com', 'Test Student 2', 'student')
ON CONFLICT (id) DO NOTHING;

-- Now add students linked to the profiles
INSERT INTO students (id, user_id, name, class_id, school_id, student_number) VALUES
  ('750e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440102', 'Teju Student', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'STU2024001'),
  ('750e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440103', 'Test Student 2', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'STU2024002'),
  ('750e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440102', 'Teju Student', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'STU2024003'),
  ('750e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440103', 'Test Student 2', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'STU2024004')
ON CONFLICT (id) DO NOTHING;

-- Add sample progress records
INSERT INTO progress (student_id, class_id, school_id, subject, marks, max_marks, assessment_date) VALUES
  -- Mathematics progress
  ('750e8400-e29b-41d4-a716-446655440301', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Algebra', 88.5, 100, '2024-09-01'),
  ('750e8400-e29b-41d4-a716-446655440301', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Geometry', 92.0, 100, '2024-09-08'),
  ('750e8400-e29b-41d4-a716-446655440301', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Calculus', 85.0, 100, '2024-09-15'),
  
  ('750e8400-e29b-41d4-a716-446655440302', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Algebra', 76.5, 100, '2024-09-01'),
  ('750e8400-e29b-41d4-a716-446655440302', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Geometry', 82.0, 100, '2024-09-08'),
  ('750e8400-e29b-41d4-a716-446655440302', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Calculus', 79.5, 100, '2024-09-15'),
  
  -- Computer Science progress
  ('750e8400-e29b-41d4-a716-446655440303', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Programming Basics', 95.0, 100, '2024-09-02'),
  ('750e8400-e29b-41d4-a716-446655440303', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Data Structures', 89.5, 100, '2024-09-09'),
  ('750e8400-e29b-41d4-a716-446655440303', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Algorithms', 91.0, 100, '2024-09-16'),
  
  ('750e8400-e29b-41d4-a716-446655440304', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Programming Basics', 87.0, 100, '2024-09-02'),
  ('750e8400-e29b-41d4-a716-446655440304', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Data Structures', 84.5, 100, '2024-09-09'),
  ('750e8400-e29b-41d4-a716-446655440304', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Algorithms', 86.0, 100, '2024-09-16');

-- Add some older progress records for trend analysis
INSERT INTO progress (student_id, class_id, school_id, subject, marks, max_marks, assessment_date) VALUES
  -- August progress
  ('750e8400-e29b-41d4-a716-446655440301', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Pre-Algebra Review', 82.0, 100, '2024-08-15'),
  ('750e8400-e29b-41d4-a716-446655440302', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Pre-Algebra Review', 74.0, 100, '2024-08-15'),
  ('750e8400-e29b-41d4-a716-446655440303', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Introduction to Programming', 90.0, 100, '2024-08-20'),
  ('750e8400-e29b-41d4-a716-446655440304', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Introduction to Programming', 83.0, 100, '2024-08-20');

-- Verify the data was inserted
SELECT 'Profiles inserted:' as status, count(*) as count FROM profiles
UNION ALL
SELECT 'Students inserted:' as status, count(*) as count FROM students  
UNION ALL
SELECT 'Progress records inserted:' as status, count(*) as count FROM progress;