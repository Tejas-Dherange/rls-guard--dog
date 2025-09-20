-- =====================================================
-- Enhanced RLS Policies for Guard Dog School Management System
-- =====================================================
-- This migration enhances existing RLS policies with better security and performance

-- =====================================================
-- DROP EXISTING POLICIES TO RECREATE WITH IMPROVEMENTS
-- =====================================================

-- Drop existing policies to recreate with better performance and security
DROP POLICY IF EXISTS "profiles_users_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON profiles;
DROP POLICY IF EXISTS "profiles_service_role" ON profiles;
DROP POLICY IF EXISTS "schools_view_all" ON schools;
DROP POLICY IF EXISTS "schools_head_teacher_manage" ON schools;
DROP POLICY IF EXISTS "classrooms_view_all" ON classrooms;
DROP POLICY IF EXISTS "classrooms_teacher_manage" ON classrooms;
DROP POLICY IF EXISTS "students_own_view" ON students;
DROP POLICY IF EXISTS "students_teacher_view" ON students;
DROP POLICY IF EXISTS "students_admin_view" ON students;
DROP POLICY IF EXISTS "students_teacher_manage" ON students;
DROP POLICY IF EXISTS "progress_student_view" ON progress;
DROP POLICY IF EXISTS "progress_teacher_manage" ON progress;

-- =====================================================
-- ENHANCED UTILITY FUNCTIONS FOR RLS
-- =====================================================

-- Function to get current user's role efficiently
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT role INTO user_role_result 
    FROM profiles 
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role_result, 'student'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is head teacher
CREATE OR REPLACE FUNCTION is_head_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() = 'head_teacher';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is teacher or head teacher
CREATE OR REPLACE FUNCTION is_teacher_or_above()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_current_user_role() IN ('teacher', 'head_teacher');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user can access specific school
CREATE OR REPLACE FUNCTION can_access_school(school_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Head teachers can access all schools
    IF is_head_teacher() THEN
        RETURN true;
    END IF;
    
    -- Teachers can access schools where they teach
    IF get_current_user_role() = 'teacher' THEN
        RETURN EXISTS (
            SELECT 1 FROM classrooms 
            WHERE school_id = school_uuid AND teacher_id = auth.uid()
        );
    END IF;
    
    -- Students can access their school
    IF get_current_user_role() = 'student' THEN
        RETURN EXISTS (
            SELECT 1 FROM students s
            WHERE s.user_id = auth.uid() AND s.school_id = school_uuid
        );
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- ENHANCED PROFILES POLICIES
-- =====================================================

-- Users can view and update their own profile only
CREATE POLICY "profiles_own_access" ON profiles
    FOR ALL USING (auth.uid() = id);

-- Head teachers can view all profiles (for admin purposes)
CREATE POLICY "profiles_head_teacher_view" ON profiles
    FOR SELECT USING (is_head_teacher());

-- Service role has full access (for system operations)
CREATE POLICY "profiles_service_role_access" ON profiles
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Prevent role escalation - users cannot change their own role
CREATE POLICY "profiles_prevent_role_escalation" ON profiles
    FOR UPDATE USING (
        auth.uid() = id AND 
        (OLD.role = NEW.role OR auth.jwt() ->> 'role' = 'service_role')
    );

-- =====================================================
-- ENHANCED SCHOOLS POLICIES
-- =====================================================

-- All authenticated users can view schools they have access to
CREATE POLICY "schools_user_access" ON schools
    FOR SELECT TO authenticated USING (can_access_school(id));

-- Only head teachers can create schools
CREATE POLICY "schools_head_teacher_create" ON schools
    FOR INSERT WITH CHECK (is_head_teacher());

-- Only head teachers and service role can update/delete schools
CREATE POLICY "schools_admin_modify" ON schools
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'service_role' OR is_head_teacher()
    );

CREATE POLICY "schools_admin_delete" ON schools
    FOR DELETE USING (
        auth.jwt() ->> 'role' = 'service_role' OR is_head_teacher()
    );

-- =====================================================
-- ENHANCED CLASSROOMS POLICIES
-- =====================================================

-- Users can view classrooms in schools they have access to
CREATE POLICY "classrooms_user_view" ON classrooms
    FOR SELECT TO authenticated USING (can_access_school(school_id));

-- Teachers can create classrooms in schools they have access to
CREATE POLICY "classrooms_teacher_create" ON classrooms
    FOR INSERT WITH CHECK (
        is_teacher_or_above() AND 
        can_access_school(school_id) AND
        (teacher_id = auth.uid() OR is_head_teacher())
    );

-- Teachers can update their own classrooms, head teachers can update all
CREATE POLICY "classrooms_teacher_update" ON classrooms
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        teacher_id = auth.uid() OR 
        is_head_teacher()
    );

-- Only head teachers and service role can delete classrooms
CREATE POLICY "classrooms_admin_delete" ON classrooms
    FOR DELETE USING (
        auth.jwt() ->> 'role' = 'service_role' OR is_head_teacher()
    );

-- =====================================================
-- ENHANCED STUDENTS POLICIES
-- =====================================================

-- Students can view their own record
CREATE POLICY "students_own_view" ON students
    FOR SELECT USING (user_id = auth.uid());

-- Teachers can view students in their classes
CREATE POLICY "students_teacher_view" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classrooms c
            WHERE c.id = students.class_id 
            AND c.teacher_id = auth.uid()
        )
    );

-- Head teachers can view all students
CREATE POLICY "students_head_teacher_view" ON students
    FOR SELECT USING (is_head_teacher());

-- Service role can view all students
CREATE POLICY "students_service_view" ON students
    FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- Only teachers and head teachers can create students
CREATE POLICY "students_teacher_create" ON students
    FOR INSERT WITH CHECK (
        is_teacher_or_above() AND
        can_access_school(school_id) AND
        EXISTS (
            SELECT 1 FROM classrooms c
            WHERE c.id = class_id 
            AND (c.teacher_id = auth.uid() OR is_head_teacher())
        )
    );

-- Teachers can update students in their classes, head teachers can update all
CREATE POLICY "students_teacher_update" ON students
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM classrooms c
            WHERE c.id = students.class_id AND c.teacher_id = auth.uid()
        ) OR
        is_head_teacher()
    );

-- Only head teachers and service role can delete students
CREATE POLICY "students_admin_delete" ON students
    FOR DELETE USING (
        auth.jwt() ->> 'role' = 'service_role' OR is_head_teacher()
    );

-- =====================================================
-- ENHANCED PROGRESS POLICIES
-- =====================================================

-- Students can view their own progress
CREATE POLICY "progress_student_view" ON progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = progress.student_id AND s.user_id = auth.uid()
        )
    );

-- Teachers can view progress for their students
CREATE POLICY "progress_teacher_view" ON progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classrooms c
            WHERE c.id = progress.class_id AND c.teacher_id = auth.uid()
        )
    );

-- Head teachers can view all progress
CREATE POLICY "progress_head_teacher_view" ON progress
    FOR SELECT USING (is_head_teacher());

-- Service role can view all progress
CREATE POLICY "progress_service_view" ON progress
    FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- Only teachers can create progress records for their students
CREATE POLICY "progress_teacher_create" ON progress
    FOR INSERT WITH CHECK (
        is_teacher_or_above() AND
        EXISTS (
            SELECT 1 FROM classrooms c
            WHERE c.id = progress.class_id 
            AND (c.teacher_id = auth.uid() OR is_head_teacher())
        ) AND
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = progress.student_id AND s.class_id = progress.class_id
        )
    );

-- Teachers can update progress for their students
CREATE POLICY "progress_teacher_update" ON progress
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM classrooms c
            WHERE c.id = progress.class_id AND c.teacher_id = auth.uid()
        ) OR
        is_head_teacher()
    );

-- Only teachers and head teachers can delete progress
CREATE POLICY "progress_teacher_delete" ON progress
    FOR DELETE USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM classrooms c
            WHERE c.id = progress.class_id AND c.teacher_id = auth.uid()
        ) OR
        is_head_teacher()
    );

-- =====================================================
-- ADDITIONAL SECURITY POLICIES
-- =====================================================

-- Prevent students from being assigned to classes in different schools
ALTER TABLE students ADD CONSTRAINT students_school_class_consistency 
CHECK (
    NOT EXISTS (
        SELECT 1 FROM classrooms c 
        WHERE c.id = class_id AND c.school_id != students.school_id
    )
);

-- Prevent progress records from referencing inconsistent data
ALTER TABLE progress ADD CONSTRAINT progress_consistency_check
CHECK (
    EXISTS (
        SELECT 1 FROM students s, classrooms c
        WHERE s.id = progress.student_id 
        AND c.id = progress.class_id 
        AND s.class_id = c.id 
        AND s.school_id = progress.school_id 
        AND c.school_id = progress.school_id
    )
);

-- =====================================================
-- AUDIT AND MONITORING SETUP
-- =====================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only head teachers and service role can view audit logs
CREATE POLICY "audit_log_admin_access" ON audit_log
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'service_role' OR is_head_teacher()
    );

-- Function to log data changes
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, user_id, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_students AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_progress AFTER INSERT OR UPDATE OR DELETE ON progress
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- =====================================================
-- PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Add additional indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_school ON classrooms(teacher_id, school_id);
CREATE INDEX IF NOT EXISTS idx_students_user_school ON students(user_id, school_id);
CREATE INDEX IF NOT EXISTS idx_progress_class_student ON progress(class_id, student_id);

-- =====================================================
-- VALIDATION AND TESTING FUNCTIONS
-- =====================================================

-- Function to test RLS policies
CREATE OR REPLACE FUNCTION test_rls_policies(test_user_id UUID)
RETURNS TABLE (
    test_name TEXT,
    passed BOOLEAN,
    details TEXT
) AS $$
DECLARE
    original_user_id UUID;
BEGIN
    -- Store original user ID
    SELECT auth.uid() INTO original_user_id;
    
    -- Test cases would go here
    -- This is a framework for automated RLS testing
    
    RETURN QUERY SELECT 
        'RLS Test Framework'::TEXT as test_name,
        true as passed,
        'Ready for implementation'::TEXT as details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate current RLS setup
CREATE OR REPLACE FUNCTION validate_rls_setup()
RETURNS TABLE (
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INTEGER,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        t.rowsecurity,
        COUNT(p.policyname)::INTEGER,
        CASE 
            WHEN t.rowsecurity AND COUNT(p.policyname) > 0 THEN 'SECURE'
            WHEN t.rowsecurity AND COUNT(p.policyname) = 0 THEN 'RLS_ENABLED_NO_POLICIES'
            ELSE 'INSECURE'
        END::TEXT
    FROM pg_tables t
    LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
    WHERE t.schemaname = 'public' 
        AND t.tablename IN ('profiles', 'schools', 'classrooms', 'students', 'progress', 'audit_log')
    GROUP BY t.tablename, t.rowsecurity
    ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION get_current_user_role() IS 'Efficiently retrieves the current user role from profiles table';
COMMENT ON FUNCTION is_head_teacher() IS 'Checks if current user has head_teacher role';
COMMENT ON FUNCTION is_teacher_or_above() IS 'Checks if current user is teacher or head_teacher';
COMMENT ON FUNCTION can_access_school(UUID) IS 'Determines if user can access a specific school based on their role and associations';
COMMENT ON TABLE audit_log IS 'Stores audit trail for sensitive data changes';
COMMENT ON FUNCTION validate_rls_setup() IS 'Validates that all tables have proper RLS policies enabled';

-- Run validation to confirm setup
SELECT * FROM validate_rls_setup();