-- Update user roles after they sign up via the app
-- Run this AFTER the users have signed up through your application

UPDATE profiles SET role = 'teacher' WHERE email = 'john.teacher@school.edu';
UPDATE profiles SET role = 'student' WHERE email = 'alice.student@school.edu';
UPDATE profiles SET role = 'student' WHERE email = 'bob.student@school.edu';

-- Update full names
UPDATE profiles SET full_name = 'John Smith' WHERE email = 'john.teacher@school.edu';
UPDATE profiles SET full_name = 'Alice Brown' WHERE email = 'alice.student@school.edu';
UPDATE profiles SET full_name = 'Bob Wilson' WHERE email = 'bob.student@school.edu';