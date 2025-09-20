-- =====================================================
-- Fix All Table RLS Policies for Head Teachers
-- =====================================================
-- Extend the security definer approach to all tables

-- STEP 1: Create helper functions for all role checks
CREATE OR REPLACE FUNCTION is_teacher_or_head_teacher()
RETURNS boolean AS $$
BEGIN
    RETURN check_user_role(auth.uid(), 'teacher') OR check_user_role(auth.uid(), 'head_teacher');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_teacher()
RETURNS boolean AS $$
BEGIN
    RETURN check_user_role(auth.uid(), 'teacher');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- STEP 2: Fix STUDENTS table policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Students can view own record" ON students;
DROP POLICY IF EXISTS "Teachers can view class students" ON students;
DROP POLICY IF EXISTS "Head teachers can view school students" ON students;
DROP POLICY IF EXISTS "Teachers can manage class students" ON students;

-- Create new safe policies for students table
CREATE POLICY "students_own_view_safe" ON students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "students_teacher_view_safe" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    ) OR is_head_teacher()
  );

CREATE POLICY "students_teacher_manage_safe" ON students
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    ) OR is_head_teacher()
  );

-- STEP 3: Fix CLASSROOMS table policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated users can view classrooms" ON classrooms;
DROP POLICY IF EXISTS "Teachers can manage own classrooms" ON classrooms;
DROP POLICY IF EXISTS "Head teachers can manage school classrooms" ON classrooms;

-- Create new safe policies for classrooms table
CREATE POLICY "classrooms_view_all_safe" ON classrooms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "classrooms_teacher_manage_safe" ON classrooms
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    teacher_id = auth.uid() OR
    is_head_teacher()
  );

-- STEP 4: Fix PROGRESS table policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Students can view own progress" ON progress;
DROP POLICY IF EXISTS "Teachers can manage class progress" ON progress;
DROP POLICY IF EXISTS "Head teachers can manage school progress" ON progress;

-- Create new safe policies for progress table
CREATE POLICY "progress_student_view_safe" ON progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = progress.student_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "progress_teacher_manage_safe" ON progress
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = progress.class_id AND c.teacher_id = auth.uid()
    ) OR is_head_teacher()
  );

-- STEP 5: Fix SCHOOLS table policies (head teachers should see all schools)
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated users can view schools" ON schools;
DROP POLICY IF EXISTS "Head teachers can manage schools" ON schools;

-- Create new safe policies for schools table
CREATE POLICY "schools_view_all_safe" ON schools
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "schools_head_teacher_manage_safe" ON schools
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    is_head_teacher()
  );

-- STEP 6: Verify all policies are in place
SELECT 
  'All Table Policies Summary' as summary,
  tablename,
  COUNT(policyname) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')
GROUP BY tablename
ORDER BY tablename;

-- STEP 7: Test functions
-- Uncomment these to test the functions:
-- SELECT 'Role Check Tests' as test_type;
-- SELECT is_head_teacher() as am_i_head_teacher;
-- SELECT is_teacher() as am_i_teacher;
-- SELECT is_teacher_or_head_teacher() as am_i_teacher_or_head;