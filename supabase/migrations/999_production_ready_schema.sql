-- =====================================================
-- Guard Dog School Management System - Production Schema
-- =====================================================
-- This migration consolidates all previous migrations into a clean, production-ready schema
-- Run this on a fresh database for new deployments

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for user roles
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'head_teacher');

-- =====================================================
-- TABLES
-- =====================================================

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create schools table
CREATE TABLE schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create classrooms table
CREATE TABLE classrooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  grade_level INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress table
CREATE TABLE progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  marks DECIMAL(5,2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
  max_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_classrooms_school ON classrooms(school_id);
CREATE INDEX idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_school ON students(school_id);
CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_progress_student ON progress(student_id);
CREATE INDEX idx_progress_class ON progress(class_id);
CREATE INDEX idx_progress_school ON progress(school_id);
CREATE INDEX idx_progress_subject ON progress(subject);
CREATE INDEX idx_progress_date ON progress(assessment_date);

-- =====================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON classrooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view and update their own profile
CREATE POLICY "profiles_users_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Service role and head teachers can view all profiles
CREATE POLICY "profiles_admin_access" ON profiles
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'head_teacher'
    )
  );

-- Service role can manage all profiles
CREATE POLICY "profiles_service_role" ON profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- SCHOOLS POLICIES
-- =====================================================

-- All authenticated users can view schools
CREATE POLICY "schools_view_all" ON schools
  FOR SELECT TO authenticated USING (true);

-- Only head teachers and service role can manage schools
CREATE POLICY "schools_head_teacher_manage" ON schools
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'head_teacher'
    )
  );

-- =====================================================
-- CLASSROOMS POLICIES
-- =====================================================

-- All authenticated users can view classrooms
CREATE POLICY "classrooms_view_all" ON classrooms
  FOR SELECT TO authenticated USING (true);

-- Teachers can manage their own classrooms, head teachers can manage all
CREATE POLICY "classrooms_teacher_manage" ON classrooms
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'head_teacher'
    )
  );

-- =====================================================
-- STUDENTS POLICIES
-- =====================================================

-- Students can view their own record
CREATE POLICY "students_own_view" ON students
  FOR SELECT USING (user_id = auth.uid());

-- Teachers can view students in their classes
CREATE POLICY "students_teacher_view" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
    )
  );

-- Head teachers and service role can view all students
CREATE POLICY "students_admin_view" ON students
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'head_teacher'
    )
  );

-- Teachers and head teachers can manage students in their scope
CREATE POLICY "students_teacher_manage" ON students
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
-- PROGRESS POLICIES
-- =====================================================

-- Students can view their own progress
CREATE POLICY "progress_student_view" ON progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = progress.student_id AND s.user_id = auth.uid()
    )
  );

-- Teachers can view and manage progress for their students
CREATE POLICY "progress_teacher_manage" ON progress
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
-- INITIAL SEED DATA
-- =====================================================

-- Insert sample school
INSERT INTO schools (id, name, address) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Springfield Elementary', '123 Education Street, Springfield')
ON CONFLICT (id) DO NOTHING;

-- Note: Additional sample data should be added through the application
-- to ensure proper user associations and RLS compliance

-- =====================================================
-- VALIDATION QUERIES
-- =====================================================

-- Function to validate the schema setup
CREATE OR REPLACE FUNCTION validate_guard_dog_schema()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    t.rowsecurity,
    COUNT(p.policyname)::INTEGER
  FROM pg_tables t
  LEFT JOIN pg_policies p ON p.tablename = t.tablename
  WHERE t.schemaname = 'public' 
    AND t.tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- Run validation
-- SELECT * FROM validate_guard_dog_schema();