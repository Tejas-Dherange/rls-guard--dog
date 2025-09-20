-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policies that cause recursion

DROP POLICY IF EXISTS "Head teachers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Head teachers can update profiles" ON profiles;

-- Add a simpler policy that doesn't cause recursion
-- Use a direct role check from auth metadata instead of profiles table lookup
CREATE POLICY "Head teachers can view all profiles" ON profiles
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'head_teacher'
    OR
    (auth.jwt() ->> 'role' = 'authenticated' AND 
     auth.jwt() ->> 'user_metadata' ->> 'role' = 'head_teacher')
    OR
    auth.uid() = id
  );

-- Also allow head teachers to update other profiles for role management
CREATE POLICY "Head teachers can manage profiles" ON profiles
  FOR ALL USING (
    auth.jwt() ->> 'user_role' = 'head_teacher'
    OR
    (auth.jwt() ->> 'role' = 'authenticated' AND 
     auth.jwt() ->> 'user_metadata' ->> 'role' = 'head_teacher')
    OR
    auth.uid() = id
  );