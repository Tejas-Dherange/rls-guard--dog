-- Clear all existing data for fresh start
-- Run this migration to reset the database completely

-- Disable RLS temporarily to allow deletion
ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;

-- Delete all data in the correct order (respecting foreign keys)
DELETE FROM progress;
DELETE FROM students;
DELETE FROM classrooms;
DELETE FROM profiles;
DELETE FROM schools;

-- Reset sequences to start from 1
-- Note: Only reset if you have sequences. Most tables use UUIDs, so this might not be needed
-- But it's good practice for any auto-incrementing fields

-- Re-enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Clear any auth users (this might require manual deletion in Supabase Dashboard)
-- Note: You'll need to manually delete users from the Supabase Auth dashboard
-- as SQL cannot directly delete from auth.users table