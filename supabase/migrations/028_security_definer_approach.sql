-- =====================================================
-- Alternative Solution: Security Definer Function Approach
-- =====================================================
-- Since JWT is null, we need to use a different approach

-- STEP 1: Drop the JWT-based policies that aren't working
DROP POLICY IF EXISTS "head_teacher_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "head_teacher_manage_profiles" ON profiles;
DROP POLICY IF EXISTS "head_teacher_create_profiles" ON profiles;

-- STEP 2: Create a security definer function that can safely check roles
-- This function runs with elevated privileges and won't cause recursion
CREATE OR REPLACE FUNCTION check_user_role(user_id UUID, required_role text)
RETURNS boolean AS $$
DECLARE
    user_role text;
BEGIN
    -- This runs as SECURITY DEFINER, so it can access profiles table safely
    SELECT role::text INTO user_role 
    FROM profiles 
    WHERE id = user_id;
    
    RETURN user_role = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- STEP 3: Create a simpler function to check if current user is head teacher
CREATE OR REPLACE FUNCTION is_head_teacher()
RETURNS boolean AS $$
BEGIN
    RETURN check_user_role(auth.uid(), 'head_teacher');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- STEP 4: Now create policies using the security definer function
CREATE POLICY "head_teacher_view_all_profiles_safe" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    is_head_teacher()
  );

CREATE POLICY "head_teacher_manage_profiles_safe" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'service_role' OR
    is_head_teacher()
  );

CREATE POLICY "head_teacher_create_profiles_safe" ON profiles
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    is_head_teacher()
  );

-- STEP 5: Also need to allow DELETE for head teachers
CREATE POLICY "head_teacher_delete_profiles_safe" ON profiles
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    is_head_teacher()
  );

-- STEP 6: Check the final policies
SELECT 
  'Final Profiles Policies' as status,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY cmd, policyname;

-- STEP 7: Test the function directly
-- This should return true for head teachers, false for others
-- SELECT is_head_teacher() as am_i_head_teacher;