-- =====================================================
-- Fix Infinite Recursion in RLS Policies
-- =====================================================
-- This migration fixes the circular dependency issue in profiles table RLS

-- First, drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Head teachers can manage schools" ON schools;
DROP POLICY IF EXISTS "Teachers can manage own classrooms" ON classrooms;
DROP POLICY IF EXISTS "Head teachers can manage school classrooms" ON classrooms;
DROP POLICY IF EXISTS "Teachers can view class students" ON students;
DROP POLICY IF EXISTS "Head teachers can view school students" ON students;
DROP POLICY IF EXISTS "Teachers can manage class students" ON students;
DROP POLICY IF EXISTS "Teachers can manage class progress" ON progress;
DROP POLICY IF EXISTS "Head teachers can manage school progress" ON progress;

-- =====================================================
-- PROFILES TABLE - FIXED POLICIES (NO RECURSION)
-- =====================================================

-- Users can view and update their own profile (simple, no recursion)
CREATE POLICY "Users can access own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Service role can manage all profiles (for admin functions)
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- SCHOOLS TABLE - FIXED POLICIES
-- =====================================================

-- Only head teachers can manage schools (using auth.jwt() instead of profiles table)
CREATE POLICY "Head teachers can manage schools" ON schools
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'head_teacher'
  );

-- =====================================================
-- CLASSROOMS TABLE - FIXED POLICIES
-- =====================================================

-- Teachers can manage their own classrooms (simplified logic)
CREATE POLICY "Teachers can manage own classrooms" ON classrooms
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    teacher_id = auth.uid() OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'head_teacher'
  );

-- =====================================================
-- STUDENTS TABLE - FIXED POLICIES
-- =====================================================

-- Teachers can view students in their classes (no profiles table lookup)
CREATE POLICY "Teachers can view class students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = students.class_id 
      AND c.teacher_id = auth.uid()
    ) OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'head_teacher'
  );

-- Teachers and head teachers can manage students (simplified)
CREATE POLICY "Teachers can manage class students" ON students
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = students.class_id 
      AND c.teacher_id = auth.uid()
    ) OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'head_teacher'
  );

-- =====================================================
-- PROGRESS TABLE - FIXED POLICIES
-- =====================================================

-- Teachers can manage progress for students in their classes (no profiles lookup)
CREATE POLICY "Teachers can manage class progress" ON progress
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = progress.class_id 
      AND c.teacher_id = auth.uid()
    ) OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'head_teacher'
  );

-- =====================================================
-- ALTERNATIVE: CREATE SECURITY DEFINER FUNCTION
-- =====================================================

-- Create a security definer function to get user role safely
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  -- First try to get from JWT metadata
  user_role := auth.jwt() -> 'user_metadata' ->> 'role';
  
  -- If not found in JWT, query profiles table with security definer
  IF user_role IS NULL THEN
    SELECT role::text INTO user_role 
    FROM profiles 
    WHERE id = user_id;
  END IF;
  
  RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- IMPROVED USER PROFILE CREATION FUNCTION
-- =====================================================

-- Update the handle_new_user function to set role in JWT metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
BEGIN
  -- Get role from metadata, default to student
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    user_role::user_role
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VALIDATION
-- =====================================================

-- Check that RLS is still enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress');

-- Check policies count
SELECT tablename, COUNT(policyname) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')
GROUP BY tablename;