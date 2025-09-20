-- =====================================================
-- Basic RLS Policies for Guard Dog School Management System
-- =====================================================
-- Simple, essential Row Level Security policies

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can view and update their own profile
CREATE POLICY "Users can access own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Service role can access all profiles (for admin operations)
CREATE POLICY "Service role can access all profiles" ON profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Head teachers can view all profiles
CREATE POLICY "Head teachers can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'head_teacher'
    )
  );

-- =====================================================
-- SCHOOLS TABLE POLICIES
-- =====================================================

-- All authenticated users can view schools
CREATE POLICY "All users can view schools" ON schools
  FOR SELECT TO authenticated USING (true);

-- Only head teachers can manage schools
CREATE POLICY "Head teachers can manage schools" ON schools
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'head_teacher'
    )
  );

-- =====================================================
-- CLASSROOMS TABLE POLICIES
-- =====================================================

-- All authenticated users can view classrooms
CREATE POLICY "All users can view classrooms" ON classrooms
  FOR SELECT TO authenticated USING (true);

-- Teachers can manage their own classrooms
CREATE POLICY "Teachers can manage own classrooms" ON classrooms
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'head_teacher'
    )
  );

-- =====================================================
-- STUDENTS TABLE POLICIES
-- =====================================================

-- Students can view their own record
CREATE POLICY "Students can view own record" ON students
  FOR SELECT USING (user_id = auth.uid());

-- Teachers can view students in their classes
CREATE POLICY "Teachers can view their students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

-- Head teachers can view all students
CREATE POLICY "Head teachers can view all students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'head_teacher'
    )
  );

-- Service role can access all students
CREATE POLICY "Service role can access all students" ON students
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Teachers and head teachers can manage students
CREATE POLICY "Teachers can manage students" ON students
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'head_teacher'
    )
  );

-- =====================================================
-- PROGRESS TABLE POLICIES
-- =====================================================

-- Students can view their own progress
CREATE POLICY "Students can view own progress" ON progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = progress.student_id AND s.user_id = auth.uid()
    )
  );

-- Teachers can manage progress for their students
CREATE POLICY "Teachers can manage student progress" ON progress
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = progress.class_id AND c.teacher_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'head_teacher'
    )
  );

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check if RLS is enabled on all tables
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')
ORDER BY tablename;