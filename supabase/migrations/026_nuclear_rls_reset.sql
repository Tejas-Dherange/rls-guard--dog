-- =====================================================
-- NUCLEAR OPTION: Temporarily Disable RLS to Clear Cache
-- =====================================================
-- Use this if the recursion issue persists

-- STEP 1: Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Head teachers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Head teachers can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Users can access own profile" ON profiles;
DROP POLICY IF EXISTS "basic_own_profile_access" ON profiles;
DROP POLICY IF EXISTS "service_role_full_access" ON profiles;

-- STEP 3: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create ONE simple policy
CREATE POLICY "simple_profile_access" ON profiles
  FOR ALL USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role'
  );

-- STEP 5: Verify clean state
SELECT 
  'Profiles policies after cleanup' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';