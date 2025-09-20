-- Restore foreign key constraints after seed data insertion
-- Run this AFTER running the seed data (003_seed_data.sql)

-- Restore foreign key constraints
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE classrooms 
  ADD CONSTRAINT classrooms_school_id_fkey 
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE classrooms 
  ADD CONSTRAINT classrooms_teacher_id_fkey 
  FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE students 
  ADD CONSTRAINT students_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE students 
  ADD CONSTRAINT students_class_id_fkey 
  FOREIGN KEY (class_id) REFERENCES classrooms(id) ON DELETE CASCADE;

ALTER TABLE students 
  ADD CONSTRAINT students_school_id_fkey 
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE progress 
  ADD CONSTRAINT progress_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

ALTER TABLE progress 
  ADD CONSTRAINT progress_class_id_fkey 
  FOREIGN KEY (class_id) REFERENCES classrooms(id) ON DELETE CASCADE;

ALTER TABLE progress 
  ADD CONSTRAINT progress_school_id_fkey 
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;