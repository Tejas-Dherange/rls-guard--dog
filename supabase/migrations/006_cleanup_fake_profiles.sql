-- Clean up fake profiles that don't have corresponding auth users
-- Keep only your actual profile that exists in auth.users

-- Delete fake profiles (except your real one)
DELETE FROM profiles WHERE id != '37d5c7aa-8429-4471-9d28-fd30fd607dce';

-- Clean up dependent data
DELETE FROM students WHERE user_id NOT IN (SELECT id FROM profiles);
DELETE FROM classrooms WHERE teacher_id NOT IN (SELECT id FROM profiles);

-- Note: After running this, you'll need to:
-- 1. Sign up the test users via your app (john.teacher@school.edu, alice.student@school.edu, etc.)
-- 2. The auth trigger will create their profiles automatically
-- 3. Then update their roles manually in the profiles table