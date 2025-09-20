import { getCurrentUser } from '@/lib/auth-safe';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Settings, Users, BookOpen, GraduationCap, BarChart3 } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  student_number: string;
  class_id: string;
  user_id: string;
  classroom?: {
    name: string;
    grade_level: number;
    school?: {
      name: string;
    };
  };
}

interface Classroom {
  id: string;
  name: string;
  grade_level: number;
  schools?: {
    name: string;
  };
}

interface Progress {
  id: string;
  student_id: string;
  subject: string;
  marks: number;
  max_marks: number;
  assessment_date: string;
  students?: {
    name: string;
  };
  classrooms?: {
    name: string;
  };
}

interface StudentDashboardData {
  student: Student[];
  progress: Progress[];
  allStudents: Student[];
}

interface TeacherDashboardData {
  teacher?: unknown;
  classrooms?: unknown[];
  students: Student[];
  progress: Progress[];
}

async function getStudentData(userId: string) {
  const supabase = await createClient();
  
  console.log('Getting student data for user ID:', userId);
  
  // Get student info (simplified query) - handle multiple students
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId);

  console.log('Student query result:', { students, studentError });

  // Use the first student if multiple exist
  const student = students && students.length > 0 ? students[0] : null;

  // Get classroom and school info separately
  let classroomInfo = null;
  if (student?.class_id) {
    const { data: classroom, error: classroomError } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', student.class_id)
      .single();
      
    console.log('Classroom query result:', { classroom, classroomError });
      
    if (classroom?.school_id) {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', classroom.school_id)
        .single();
        
      console.log('School query result:', { school, schoolError });
        
      classroomInfo = { ...classroom, school };
    }
  }

  // Get student progress (simplified) - only if we have a valid student
  let progress = null;
  let progressError = null;
  if (student?.id) {
    const { data: progressData, error: progressErr } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', student.id)
      .order('assessment_date', { ascending: false });

    progress = progressData;
    progressError = progressErr;
  }

  console.log('Progress query result:', { progress, progressError });

  const result = { 
    student: student ? { ...student, classroom: classroomInfo } : null, 
    progress: progress || [],
    allStudents: students || [] // Include all students for debugging
  };
  
  console.log('Final student data result:', result);

  return result;
}

async function getTeacherData(userId: string) {
  const supabase = await createClient();
  
  // Get teacher's classrooms (simplified query)
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', userId);

  // Get schools separately
  const { data: schools } = await supabase
    .from('schools')
    .select('*');

  // Enhance classrooms with school info
  const classroomsWithSchools = classrooms?.map(classroom => ({
    ...classroom,
    schools: schools?.find(s => s.id === classroom.school_id)
  })) || [];

  // Get students in teacher's classes (simplified)
  const classroomIds = classrooms?.map(c => c.id) || [];
  let students: unknown[] = [];
  
  if (classroomIds.length > 0) {
    const { data: studentsData } = await supabase
      .from('students')
      .select('*')
      .in('class_id', classroomIds);
    students = studentsData || [];
  }

  // Get progress for teacher's students (simplified)
  let progress: unknown[] = [];
  if (classroomIds.length > 0) {
    const { data: progressData } = await supabase
      .from('progress')
      .select('*')
      .in('class_id', classroomIds)
      .order('assessment_date', { ascending: false });
    progress = progressData || [];
  }

  return { classrooms: classroomsWithSchools, students, progress };
}

async function getHeadTeacherData() {
  const supabase = await createClient();
  
  // Get all schools (simplified)
  const { data: schools } = await supabase
    .from('schools')
    .select('*');

  // Get all classrooms (simplified)
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('*');

  // Get all profiles for teacher names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'teacher');

  // Enhance classrooms with school and teacher info
  const classroomsWithInfo = classrooms?.map(classroom => ({
    ...classroom,
    schools: schools?.find(s => s.id === classroom.school_id),
    profiles: profiles?.find(p => p.id === classroom.teacher_id)
  })) || [];

  // Get all students (simplified)
  const { data: students } = await supabase
    .from('students')
    .select('*');

  // Enhance students with classroom info
  const studentsWithClassrooms = students?.map(student => ({
    ...student,
    classrooms: classrooms?.find(c => c.id === student.class_id)
  })) || [];

  // Get all progress records (simplified)
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .order('assessment_date', { ascending: false });

  // Enhance progress with student and classroom info
  const progressWithInfo = progress?.map(p => ({
    ...p,
    students: students?.find(s => s.id === p.student_id),
    classrooms: classrooms?.find(c => c.id === p.class_id)
  })) || [];

  return { schools, classrooms: classroomsWithInfo, students: studentsWithClassrooms, progress: progressWithInfo };
}

export default async function Dashboard() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  let dashboardData = null;
  let hasDatabase = false;

  // Try to check if database tables exist and get data
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (!error) {
      hasDatabase = true;
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        user.role = profile.role;
        user.full_name = profile.full_name;

        // Get role-specific data
        if (user.role === 'student') {
          dashboardData = await getStudentData(user.id);
        } else if (user.role === 'teacher') {
          dashboardData = await getTeacherData(user.id);
        } else if (user.role === 'head_teacher') {
          dashboardData = await getHeadTeacherData();
        }
      }
    }
  } catch (error) {
    console.log('Database tables not ready yet:', error);
  }

  if (!hasDatabase) {
    // Show setup instructions if database isn't ready
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome to School Management System</h1>
              <p className="text-gray-600 mt-2">Please complete the database setup to continue</p>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-xl text-gray-800">Database Setup Required</CardTitle>
                <CardDescription>Complete the following steps to access the system</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Account Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Email: {user.email}</p>
                      <p>Role: {user.role?.replace('_', ' ').toUpperCase()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Setup Instructions</h4>
                    <ol className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                        Open <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Supabase Dashboard</a>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                        Navigate to SQL Editor
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                        Run the migration files from supabase/migrations/
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                        Refresh this page
                      </li>
                    </ol>
                  </div>

                  <div className="pt-4 border-t">
                    <form action="/auth/sign-out" method="post">
                      <Button type="submit" variant="outline" className="w-full">
                        Sign Out
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If database is ready, show role-based dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">School Management System</h1>
              <p className="text-gray-600">Welcome back, {user.full_name || user.email}</p>
              <Badge variant="secondary" className="mt-1">
                {user.role?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="flex gap-3">
              {user.role === 'teacher' && (
                <Link href="/teacher">
                  <Button variant="outline">Teacher Panel</Button>
                </Link>
              )}
              <form action="/auth/sign-out" method="post">
                <Button type="submit" variant="outline">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">{user.role === 'student' && dashboardData && (
        <StudentDashboard data={dashboardData as StudentDashboardData} />
      )}

      {user.role === 'teacher' && dashboardData && (
        <TeacherDashboard data={dashboardData as TeacherDashboardData} />
      )}

      {user.role === 'head_teacher' && dashboardData && (
        <HeadTeacherDashboard data={dashboardData as HeadTeacherDashboardData} />
      )}
      </main>
    </div>
  );
}

function StudentDashboard({ data }: { data: unknown }) {
  const { student, progress, allStudents } = data as StudentDashboardData;
  const currentStudent = student?.[0]; // Get first student from array

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {currentStudent?.name}</p>
              <p><strong>Student Number:</strong> {currentStudent?.student_number}</p>
              <p><strong>Class:</strong> {currentStudent?.classroom?.name}</p>
              <p><strong>Grade Level:</strong> {currentStudent?.classroom?.grade_level}</p>
              <p><strong>School:</strong> {currentStudent?.classroom?.school?.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {progress && progress.length > 0 ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold">
                  {(progress.reduce((acc: number, p: Progress) => acc + (p.marks / p.max_marks * 100), 0) / progress.length).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-sm">Total Assessments: {progress.length}</p>
              </div>
            ) : (
              <p>No assessments yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>� Debug Information</CardTitle>
          <CardDescription>Student account debugging details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>Student Records Found:</strong> {allStudents?.length || 0}</p>
            <p><strong>Active Student ID:</strong> {currentStudent?.id || 'Not found'}</p>
            <p><strong>User ID:</strong> {currentStudent?.user_id || 'Not found'}</p>
            <p><strong>Class ID:</strong> {currentStudent?.class_id || 'Not found'}</p>
            <p><strong>Progress Records:</strong> {progress ? progress.length : 'null'}</p>
            
            {allStudents && allStudents.length > 1 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-semibold text-yellow-800">Warning: Multiple Student Records Found:</p>
                <div className="mt-2 space-y-1">
                  {allStudents.map((s: Student, index: number) => (
                    <p key={s.id} className="text-xs">
                      {index + 1}. {s.name} (ID: {s.id}, Class: {s.class_id})
                    </p>
                  ))}
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  Using the first record. Contact admin to clean up duplicate entries.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>�📈 Recent Progress</CardTitle>
          <CardDescription>Your recent assessment results (RLS: Only your records)</CardDescription>
        </CardHeader>
        <CardContent>
          {progress && progress.length > 0 ? (
            <div className="space-y-4">
              {progress.slice(0, 10).map((record: Progress) => (
                <div key={record.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{record.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.assessment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {record.marks}/{record.max_marks}
                    </p>
                    <Badge variant={((record.marks / record.max_marks) * 100) >= 80 ? "default" : "secondary"}>
                      {((record.marks / record.max_marks) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No progress records found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TeacherDashboard({ data }: { data: unknown }) {
  const { classrooms, students, progress } = data as TeacherDashboardData;

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Classrooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{classrooms?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Classes Teaching</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{students?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Students in Classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{progress?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Assessments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Classrooms</CardTitle>
            <CardDescription>Classes you are teaching (RLS: Only your classes)</CardDescription>
          </CardHeader>
          <CardContent>
            {classrooms && classrooms.length > 0 ? (
              <div className="space-y-3">
                {(classrooms as Classroom[]).map((classroom: Classroom) => (
                  <div key={classroom.id} className="p-3 border rounded">
                    <p className="font-medium">{classroom.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Grade {classroom.grade_level} • {classroom.schools?.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No classrooms assigned.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Progress</CardTitle>
            <CardDescription>Latest student assessments (RLS: Only your students)</CardDescription>
          </CardHeader>
          <CardContent>
            {progress && progress.length > 0 ? (
              <div className="space-y-3">
                {progress.slice(0, 8).map((record: Progress) => (
                  <div key={record.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{record.students?.name}</p>
                      <p className="text-muted-foreground">{record.subject}</p>
                    </div>
                    <Badge variant={((record.marks / record.max_marks) * 100) >= 80 ? "default" : "secondary"}>
                      {((record.marks / record.max_marks) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p>No progress records found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface School {
  id: string;
  name: string;
  address: string;
}

interface HeadTeacherDashboardData {
  schools: School[];
  classrooms: Classroom[];
  students: Student[];
  progress: Progress[];
}

function HeadTeacherDashboard({ data }: { data: HeadTeacherDashboardData }) {
  const { schools, classrooms, students, progress } = data;

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{schools?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Classrooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{classrooms?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{students?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{progress?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Panel Quick Access */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              School Administration
            </div>
            <Link href="/admin">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Access Admin Panel
              </Button>
            </Link>
          </CardTitle>
          <CardDescription>
            Manage classroom assignments, teacher roles, and school operations
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schools Overview</CardTitle>
            <CardDescription>All schools in the system (RLS: Full access)</CardDescription>
          </CardHeader>
          <CardContent>
            {schools && schools.length > 0 ? (
              <div className="space-y-3">
                {schools.map((school: School) => (
                  <div key={school.id} className="p-3 border rounded">
                    <p className="font-medium">{school.name}</p>
                    <p className="text-sm text-muted-foreground">{school.address}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No schools found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Overall system statistics (RLS: All data visible)</CardDescription>
          </CardHeader>
          <CardContent>
            {progress && progress.length > 0 ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-2xl font-bold">
                    {(progress.reduce((acc: number, p: Progress) => acc + (p.marks / p.max_marks * 100), 0) / progress.length).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">System Average</p>
                </div>
                <div className="space-y-2">
                  {progress.slice(0, 5).map((record: Progress) => (
                    <div key={record.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{record.students?.name}</p>
                        <p className="text-muted-foreground">{record.classrooms?.name} • {record.subject}</p>
                      </div>
                      <Badge variant={((record.marks / record.max_marks) * 100) >= 80 ? "default" : "secondary"}>
                        {((record.marks / record.max_marks) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No progress data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}