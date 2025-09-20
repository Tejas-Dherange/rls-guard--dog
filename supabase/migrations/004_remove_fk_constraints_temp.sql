-- Temporarily remove foreign key constraints for seed data
-- WARNING: This is for development/testing only - not for production!

-- Drop foreign key constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE classrooms DROP CONSTRAINT IF EXISTS classrooms_teacher_id_fkey;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_user_id_fkey;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_class_id_fkey;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_school_id_fkey;
ALTER TABLE classrooms DROP CONSTRAINT IF EXISTS classrooms_school_id_fkey;
ALTER TABLE progress DROP CONSTRAINT IF EXISTS progress_student_id_fkey;
ALTER TABLE progress DROP CONSTRAINT IF EXISTS progress_class_id_fkey;
ALTER TABLE progress DROP CONSTRAINT IF EXISTS progress_school_id_fkey;

-- Note: These constraints should be re-added after seed data insertion
-- See migration 005_restore_fk_constraints.sql