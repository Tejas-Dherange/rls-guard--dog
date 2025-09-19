-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role can manage all profiles (for admin functions)
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Schools policies
-- All authenticated users can view schools
CREATE POLICY "Authenticated users can view schools" ON schools
  FOR SELECT TO authenticated USING (true);

-- Only head teachers can manage schools
CREATE POLICY "Head teachers can manage schools" ON schools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'head_teacher'
    )
  );

-- Classrooms policies
-- All authenticated users can view classrooms
CREATE POLICY "Authenticated users can view classrooms" ON classrooms
  FOR SELECT TO authenticated USING (true);

-- Teachers can manage their own classrooms
CREATE POLICY "Teachers can manage own classrooms" ON classrooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('teacher', 'head_teacher')
    )
    AND (
      teacher_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'head_teacher'
      )
    )
  );

-- Head teachers can manage all classrooms in their school
CREATE POLICY "Head teachers can manage school classrooms" ON classrooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'head_teacher'
    )
  );

-- Students policies
-- Students can view their own record
CREATE POLICY "Students can view own record" ON students
  FOR SELECT USING (user_id = auth.uid());

-- Teachers can view students in their classes
CREATE POLICY "Teachers can view class students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      INNER JOIN profiles p ON p.id = auth.uid()
      WHERE c.id = students.class_id 
      AND c.teacher_id = auth.uid()
      AND p.role = 'teacher'
    )
  );

-- Head teachers can view all students in their school
CREATE POLICY "Head teachers can view school students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'head_teacher'
    )
  );

-- Teachers and head teachers can manage students
CREATE POLICY "Teachers can manage class students" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('teacher', 'head_teacher')
    )
    AND (
      EXISTS (
        SELECT 1 FROM classrooms c
        WHERE c.id = students.class_id 
        AND c.teacher_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'head_teacher'
      )
    )
  );

-- Progress policies
-- Students can only view their own progress
CREATE POLICY "Students can view own progress" ON progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = progress.student_id 
      AND s.user_id = auth.uid()
    )
  );

-- Teachers can view and manage progress for students in their classes
CREATE POLICY "Teachers can manage class progress" ON progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classrooms c
      INNER JOIN profiles p ON p.id = auth.uid()
      WHERE c.id = progress.class_id 
      AND c.teacher_id = auth.uid()
      AND p.role IN ('teacher', 'head_teacher')
    )
  );

-- Head teachers can view and manage all progress in their school
CREATE POLICY "Head teachers can manage school progress" ON progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'head_teacher'
    )
  );

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();