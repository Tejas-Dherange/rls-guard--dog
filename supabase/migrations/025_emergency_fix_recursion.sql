-- =====================================================
-- EMERGENCY FIX: Stop All Recursion in Profiles RLS
-- =====================================================
-- This completely eliminates recursion by removing all complex policies

-- STEP 1: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Head teachers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Head teachers can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Users can access own profile" ON profiles;

-- STEP 2: Create the most basic, non-recursive policy
-- Only allow users to access their own profile - NO role checking
CREATE POLICY "basic_own_profile_access" ON profiles
  FOR ALL USING (auth.uid() = id);

-- STEP 3: Allow service role full access (for system operations)
CREATE POLICY "service_role_full_access" ON profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- STEP 4: Check if we have any other policies causing issues
-- List all current policies on profiles
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- STEP 5: For debugging - let's also check what's in the JWT
-- You can run this to see what data is available in auth.jwt()
-- SELECT auth.jwt();

-- STEP 6: Verify RLS is still enabled but simplified
SELECT 
  tablename,
  rowsecurity,
  'Profiles table RLS status' as note
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';