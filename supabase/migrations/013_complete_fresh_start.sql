-- Complete fresh start with your actual auth user IDs
-- Clear all existing data and rebuild with proper UUIDs

-- Step 1: Clear all existing data
DELETE FROM progress;
DELETE FROM students;
DELETE FROM classrooms;
DELETE FROM profiles;
DELETE FROM schools;

-- Step 2: Insert fresh schools
INSERT INTO schools (id, name, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Tech Valley Academy', '123 Innovation Drive, Silicon Valley, CA'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Future Leaders School', '456 Learning Lane, Austin, TX');

-- Step 3: Insert profiles with your ACTUAL auth user IDs
INSERT INTO profiles (id, email, full_name, role) VALUES
  -- Tejas Dherange - Head Teacher (tejudherange2182@gmail.com)
  ('1c13b722-697e-42fa-b82c-7ab727ccc289', 'tejudherange2182@gmail.com', 'Tejas Dherange', 'head_teacher'),
  
  -- John - Teacher (one@gmail.com) 
  ('34548558-6ef1-4a26-a420-5680b23ecf15', 'one@gmail.com', 'John', 'teacher'),
  
  -- Karan - Student (tejas@gmail.com)
  ('88eabe5c-eb8d-4cba-91e8-48bf5c8711e4', 'tejas@gmail.com', 'Karan', 'student'),
  
  -- Tej - Student (tejasdhernage0099@gmail.com)
  ('3c8330c1-f326-471a-a249-a62fcf2bba0f', 'tejasdhernage0099@gmail.com', 'Tej', 'student');

-- Step 4: Insert classrooms (assign to John the teacher)
INSERT INTO classrooms (id, name, school_id, teacher_id, grade_level) VALUES
  ('650e8400-e29b-41d4-a716-446655440201', 'Advanced Mathematics', '550e8400-e29b-41d4-a716-446655440001', '34548558-6ef1-4a26-a420-5680b23ecf15', 10),
  ('650e8400-e29b-41d4-a716-446655440202', 'Computer Science Fundamentals', '550e8400-e29b-41d4-a716-446655440001', '34548558-6ef1-4a26-a420-5680b23ecf15', 10),
  ('650e8400-e29b-41d4-a716-446655440203', 'English Literature', '550e8400-e29b-41d4-a716-446655440001', NULL, 10);

-- Step 5: Insert students (link to actual auth users)
INSERT INTO students (id, user_id, name, class_id, school_id, student_number) VALUES
  -- Karan (tejas@gmail.com) in Math class
  ('750e8400-e29b-41d4-a716-446655440301', '88eabe5c-eb8d-4cba-91e8-48bf5c8711e4', 'Karan', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'STU2024001'),
  
  -- Tej (tejasdhernage0099@gmail.com) in Math class
  ('750e8400-e29b-41d4-a716-446655440302', '3c8330c1-f326-471a-a249-a62fcf2bba0f', 'Tej', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'STU2024002'),
  
  -- Karan in Computer Science class
  ('750e8400-e29b-41d4-a716-446655440303', '88eabe5c-eb8d-4cba-91e8-48bf5c8711e4', 'Karan', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'STU2024003'),
  
  -- Tej in Computer Science class
  ('750e8400-e29b-41d4-a716-446655440304', '3c8330c1-f326-471a-a249-a62fcf2bba0f', 'Tej', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'STU2024004');

-- Step 6: Insert sample progress records
INSERT INTO progress (student_id, class_id, school_id, subject, marks, max_marks, assessment_date) VALUES
  -- Karan's Mathematics progress
  ('750e8400-e29b-41d4-a716-446655440301', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Algebra', 88.5, 100, '2024-09-01'),
  ('750e8400-e29b-41d4-a716-446655440301', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Geometry', 92.0, 100, '2024-09-08'),
  ('750e8400-e29b-41d4-a716-446655440301', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Calculus', 85.0, 100, '2024-09-15'),
  
  -- Tej's Mathematics progress
  ('750e8400-e29b-41d4-a716-446655440302', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Algebra', 76.5, 100, '2024-09-01'),
  ('750e8400-e29b-41d4-a716-446655440302', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Geometry', 82.0, 100, '2024-09-08'),
  ('750e8400-e29b-41d4-a716-446655440302', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Calculus', 79.5, 100, '2024-09-15'),
  
  -- Karan's Computer Science progress
  ('750e8400-e29b-41d4-a716-446655440303', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Programming Basics', 95.0, 100, '2024-09-02'),
  ('750e8400-e29b-41d4-a716-446655440303', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Data Structures', 89.5, 100, '2024-09-09'),
  ('750e8400-e29b-41d4-a716-446655440303', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Algorithms', 91.0, 100, '2024-09-16'),
  
  -- Tej's Computer Science progress
  ('750e8400-e29b-41d4-a716-446655440304', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Programming Basics', 87.0, 100, '2024-09-02'),
  ('750e8400-e29b-41d4-a716-446655440304', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Data Structures', 84.5, 100, '2024-09-09'),
  ('750e8400-e29b-41d4-a716-446655440304', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Algorithms', 86.0, 100, '2024-09-16');

-- Step 7: Add some older progress records for trend analysis
INSERT INTO progress (student_id, class_id, school_id, subject, marks, max_marks, assessment_date) VALUES
  -- August progress
  ('750e8400-e29b-41d4-a716-446655440301', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Pre-Algebra Review', 82.0, 100, '2024-08-15'),
  ('750e8400-e29b-41d4-a716-446655440302', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Pre-Algebra Review', 74.0, 100, '2024-08-15'),
  ('750e8400-e29b-41d4-a716-446655440303', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Introduction to Programming', 90.0, 100, '2024-08-20'),
  ('750e8400-e29b-41d4-a716-446655440304', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Introduction to Programming', 83.0, 100, '2024-08-20');

-- Verification query
SELECT 'Database setup complete!' as status;
SELECT 'Schools:' as table_name, count(*) as count FROM schools
UNION ALL
SELECT 'Profiles:' as table_name, count(*) as count FROM profiles
UNION ALL
SELECT 'Classrooms:' as table_name, count(*) as count FROM classrooms
UNION ALL
SELECT 'Students:' as table_name, count(*) as count FROM students
UNION ALL
SELECT 'Progress:' as table_name, count(*) as count FROM progress;