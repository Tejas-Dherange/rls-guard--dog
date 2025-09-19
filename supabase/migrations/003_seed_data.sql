-- Insert sample schools
INSERT INTO schools (id, name, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Greenwood Elementary', '123 Oak Street, Springfield'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Riverside High School', '456 River Road, Riverside');

-- Insert sample profiles (these would normally be created via Supabase Auth)
-- Note: In production, these would be created through the auth trigger
INSERT INTO profiles (id, email, full_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440101', 'john.teacher@school.edu', 'John Smith', 'teacher'),
  ('550e8400-e29b-41d4-a716-446655440102', 'mary.head@school.edu', 'Mary Johnson', 'head_teacher'),
  ('550e8400-e29b-41d4-a716-446655440103', 'alice.student@school.edu', 'Alice Brown', 'student'),
  ('550e8400-e29b-41d4-a716-446655440104', 'bob.student@school.edu', 'Bob Wilson', 'student');

-- Insert sample classrooms
INSERT INTO classrooms (id, name, school_id, teacher_id, grade_level) VALUES
  ('550e8400-e29b-41d4-a716-446655440201', 'Math 101', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 5),
  ('550e8400-e29b-41d4-a716-446655440202', 'Science 101', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 5);

-- Insert sample students
INSERT INTO students (id, user_id, name, class_id, school_id, student_number) VALUES
  ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440103', 'Alice Brown', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'STU001'),
  ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440104', 'Bob Wilson', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'STU002');

-- Insert sample progress records
INSERT INTO progress (student_id, class_id, school_id, subject, marks, max_marks, assessment_date) VALUES
  ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 85.5, 100, '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 78.0, 100, '2024-02-15'),
  ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 92.0, 100, '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 88.5, 100, '2024-02-15');