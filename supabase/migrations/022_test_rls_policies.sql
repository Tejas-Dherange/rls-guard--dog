-- =====================================================
-- Test Basic RLS Policies
-- =====================================================
-- Simple tests to verify RLS policies are working

-- Test 1: Check if RLS is enabled on all tables
SELECT 
  'RLS Status Check' as test_name,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN 'ENABLED' 
    ELSE 'DISABLED' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')
ORDER BY tablename;

-- Test 2: Count policies on each table
SELECT 
  'Policy Count Check' as test_name,
  tablename,
  COUNT(policyname) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')
GROUP BY tablename
ORDER BY tablename;

-- Test 3: List all policies
SELECT 
  'Policy Details' as test_name,
  tablename,
  policyname,
  cmd as operation,
  qual as condition
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')
ORDER BY tablename, policyname;

-- Note: The following tests require actual user sessions and should be run
-- through your application or Supabase dashboard with different user roles

/*
-- Test 4: Student access test (run as student user)
-- Should only see their own profile and progress
SELECT 'Student can see own profile' as test, COUNT(*) as count FROM profiles;
SELECT 'Student can see own progress' as test, COUNT(*) as count FROM progress;

-- Test 5: Teacher access test (run as teacher user)  
-- Should see their classrooms and students
SELECT 'Teacher can see classrooms' as test, COUNT(*) as count FROM classrooms;
SELECT 'Teacher can see students' as test, COUNT(*) as count FROM students;

-- Test 6: Head teacher access test (run as head_teacher user)
-- Should see all data
SELECT 'Head teacher can see all profiles' as test, COUNT(*) as count FROM profiles;
SELECT 'Head teacher can see all schools' as test, COUNT(*) as count FROM schools;
SELECT 'Head teacher can see all classrooms' as test, COUNT(*) as count FROM classrooms;
SELECT 'Head teacher can see all students' as test, COUNT(*) as count FROM students;
SELECT 'Head teacher can see all progress' as test, COUNT(*) as count FROM progress;
*/