-- Fresh seed data with actual email addresses and proper UUIDs
-- Updated with your email addresses

-- Insert fresh school data
INSERT INTO schools (id, name, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Tech Valley Academy', '123 Innovation Drive, Silicon Valley, CA'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Future Leaders School', '456 Learning Lane, Austin, TX');

-- Insert profiles with your actual emails
-- Note: These profiles will be linked to auth users after signup
INSERT INTO profiles (id, email, full_name, role) VALUES
  -- Head Teacher (your main email)
  ('37d5c7aa-8429-4471-9d28-fd30fd607dce', 'tejudherange2182@gmail.com', 'Tejas Dherange', 'head_teacher'),
  
  -- Teacher (your teacher email)
  ('550e8400-e29b-41d4-a716-446655440101', 'one@gmail.com', 'Tej', 'teacher'),
  
  -- Student (your student email)
  ('550e8400-e29b-41d4-a716-446655440102', 'tejasdherange0099@gmail.com', 'Teju', 'student'),
  
  -- Additional test student
  ('550e8400-e29b-41d4-a716-446655440103', 'tejas@gmail.com', 'Test Student 2', 'student');

-- Insert classrooms
INSERT INTO classrooms (id, name, school_id, teacher_id, grade_level) VALUES
  ('650e8400-e29b-41d4-a716-446655440201', 'Advanced Mathematics', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 10),
  ('650e8400-e29b-41d4-a716-446655440202', 'Computer Science Fundamentals', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 10),
  ('650e8400-e29b-41d4-a716-446655440203', 'English Literature', '550e8400-e29b-41d4-a716-446655440001', NULL, 10);

-- Insert students
INSERT INTO students (id, user_id, name, class_id, school_id, student_number) VALUES
  ('750e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440102', 'Teju', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'STU2024001'),
  ('750e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440103', 'Test Student 2', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'STU2024002'),
  ('750e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440102', 'Teju', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'STU2024003'),
  ('750e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440103', 'Test Student 2', '650e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'STU2024004');

-- Insert sample progress records for realistic testing
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