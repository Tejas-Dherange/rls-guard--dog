-- =====================================================
-- Check RLS Status and Apply Basic Policies
-- =====================================================
-- This script checks if your basic RLS policies are already applied

-- First, let's check if RLS is enabled on all tables
SELECT 
  'RLS Status Check' as check_type,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')
ORDER BY tablename;

-- Check how many policies exist on each table
SELECT 
  'Policy Count' as check_type,
  tablename,
  COUNT(policyname) as policy_count,
  CASE 
    WHEN COUNT(policyname) > 0 THEN '✅ HAS POLICIES'
    ELSE '❌ NO POLICIES'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')
GROUP BY tablename
ORDER BY tablename;

-- List all existing policies
SELECT 
  'Policy Details' as check_type,
  tablename,
  policyname,
  cmd as operation,
  permissive as is_permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')
ORDER BY tablename, policyname;

-- Check if the new user trigger exists
SELECT 
  'Trigger Check' as check_type,
  trigger_name,
  event_manipulation,
  action_statement,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Summary report
SELECT 
  'Summary' as report_type,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress') AND rowsecurity = true) as tables_with_rls,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')) as tables_with_policies,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress') AND rowsecurity = true) = 5 
    AND (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress')) = 5
    THEN '✅ RLS FULLY CONFIGURED'
    ELSE '⚠️ RLS NEEDS CONFIGURATION'
  END as overall_status;