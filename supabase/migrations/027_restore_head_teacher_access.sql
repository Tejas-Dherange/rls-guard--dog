-- =====================================================
-- Fix Head Teacher Access to View Teachers
-- =====================================================
-- Add back head teacher permissions without causing recursion

-- STEP 1: Add policy for head teachers to view all profiles
-- Use JWT user_metadata instead of profiles table lookup to avoid recursion
CREATE POLICY "head_teacher_view_all_profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'head_teacher' OR
    (auth.jwt() ->> 'user_role') = 'head_teacher'
  );

-- STEP 2: Allow head teachers to update other profiles (for role management)
CREATE POLICY "head_teacher_manage_profiles" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'head_teacher' OR
    (auth.jwt() ->> 'user_role') = 'head_teacher'
  );

-- STEP 3: Allow head teachers to insert new profiles (create teachers/students)
CREATE POLICY "head_teacher_create_profiles" ON profiles
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'head_teacher' OR
    (auth.jwt() ->> 'user_role') = 'head_teacher'
  );

-- STEP 4: Verify the policies are working
SELECT 
  'Current Profiles Policies' as status,
  policyname,
  cmd as operation,
  permissive
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;

-- STEP 5: Test query for debugging (to see what's in JWT)
-- Uncomment this line to see JWT contents when testing:
-- SELECT auth.jwt() as jwt_contents;

-- STEP 6: Alternative approach - Create a function to safely check if user is head teacher
CREATE OR REPLACE FUNCTION is_current_user_head_teacher()
RETURNS boolean AS $$
BEGIN
  -- Check JWT metadata first (no recursion)
  IF (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'head_teacher' THEN
    RETURN true;
  END IF;
  
  -- Check alternative JWT fields
  IF (auth.jwt() ->> 'user_role') = 'head_teacher' THEN
    RETURN true;
  END IF;
  
  -- Default to false
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- STEP 7: Alternative policy using the function (if JWT metadata isn't working)
-- Uncomment these if the above policies don't work:

/*
DROP POLICY IF EXISTS "head_teacher_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "head_teacher_manage_profiles" ON profiles;
DROP POLICY IF EXISTS "head_teacher_create_profiles" ON profiles;

CREATE POLICY "head_teacher_view_all_profiles_v2" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    is_current_user_head_teacher()
  );

CREATE POLICY "head_teacher_manage_profiles_v2" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    is_current_user_head_teacher()
  );

CREATE POLICY "head_teacher_create_profiles_v2" ON profiles
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    is_current_user_head_teacher()
  );
*/