import { requireRole } from '@/lib/auth-safe';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClassAveragesDisplay } from '@/components/class-averages-display';
import { AddProgressForm } from '@/components/add-progress-form';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  student_number: string;
  [key: string]: unknown;
}

interface Classroom {
  id: string;
  name: string;
  grade_level: number;
  schools?: { name: string };
  [key: string]: unknown;
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
    student_number: string;
  };
  classrooms?: {
    name: string;
  };
  [key: string]: unknown;
}

interface StudentProgressGroup {
  student: {
    name: string;
    student_number: string;
  };
  records: Progress[];
}

async function getTeacherClassrooms(userId: string) {
  const supabase = await createClient();
  
  // Debug logging
  console.log('Getting classrooms for teacher ID:', userId);
  
  // Get classrooms assigned to this teacher (simplified query)
  const { data: classrooms, error: classroomsError } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', userId);

  console.log('Teacher classrooms query result:', { classrooms, classroomsError });

  // Get schools separately
  const { data: schools, error: schoolsError } = await supabase
    .from('schools')
    .select('*');

  // Get students in those classrooms (simplified query)
  const classroomIds = classrooms?.map(c => c.id) || [];
  let students: Student[] = [];
  let studentsError = null;
  
  if (classroomIds.length > 0) {
    const { data: studentsData, error: studentsErr } = await supabase
      .from('students')
      .select('*')
      .in('class_id', classroomIds);
    
    students = studentsData || [];
    studentsError = studentsErr;
  }

  console.log('Teacher students query result:', { students, studentsError });

  // Enhance classrooms with school info
  const classroomsWithSchools = classrooms?.map(classroom => ({
    ...classroom,
    schools: schools?.find(s => s.id === classroom.school_id)
  })) || [];

  return { 
    classrooms: classroomsWithSchools, 
    students: students,
    errors: { classroomsError, studentsError, schoolsError }
  };
}

async function getTeacherProgress(userId: string) {
  const supabase = await createClient();
  
  // Get classrooms for this teacher first
  const { data: teacherClassrooms } = await supabase
    .from('classrooms')
    .select('id')
    .eq('teacher_id', userId);
    
  const classroomIds = teacherClassrooms?.map(c => c.id) || [];
  
  if (classroomIds.length === 0) {
    return [];
  }
  
  // Get progress records for students in teacher's classrooms (simplified)
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .in('class_id', classroomIds)
    .order('assessment_date', { ascending: false });

  return progress || [];
}

export default async function TeacherPage() {
  const user = await requireRole(['teacher', 'head_teacher']);
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need teacher privileges to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { classrooms, students, errors } = await getTeacherClassrooms(user.id);
  const progress = await getTeacherProgress(user.id);

  // Debug logging
  console.log('Teacher page - User:', user);
  console.log('Teacher page - Classrooms:', classrooms);
  console.log('Teacher page - Students:', students);
  console.log('Teacher page - Errors:', errors);

  // Group progress by student for easier display
  const studentProgress = progress.reduce((acc: Record<string, StudentProgressGroup>, record: Progress) => {
    const studentId = record.student_id;
    if (!acc[studentId]) {
      acc[studentId] = {
        student: record.students!,
        records: []
      };
    }
    acc[studentId].records.push(record);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teacher Panel</h1>
          <p className="text-muted-foreground">Manage your classes and student progress (RLS Protected)</p>
          <Badge variant="default" className="mt-2">
            {user.role.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <form action="/auth/sign-out" method="post">
            <Button type="submit" variant="outline">Sign Out</Button>
          </form>
        </div>
      </div>

      {classrooms.length === 0 ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>No Classrooms Assigned</CardTitle>
              <CardDescription>Contact your administrator to get classroom assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You need to be assigned to classrooms before you can manage student progress.
              </p>
            </CardContent>
          </Card>

          {/* Debug Information */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>User Email:</strong> {user.email}</p>
                <p><strong>User Role:</strong> {user.role}</p>
                <p><strong>Classrooms Found:</strong> {classrooms?.length || 0}</p>
                <p><strong>Students Found:</strong> {students?.length || 0}</p>
                {errors?.classroomsError && (
                  <p className="text-red-600"><strong>Classrooms Error:</strong> {JSON.stringify(errors.classroomsError)}</p>
                )}
                {errors?.studentsError && (
                  <p className="text-red-600"><strong>Students Error:</strong> {JSON.stringify(errors.studentsError)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">My Classrooms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{classrooms.length}</p>
                <p className="text-sm text-muted-foreground">RLS: Only your classes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">My Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">RLS: Only your students</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{progress.length}</p>
                <p className="text-sm text-muted-foreground">RLS: Only your records</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Class Average</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {progress.length > 0 
                    ? (progress.reduce((acc: number, p: Progress) => acc + (p.marks / p.max_marks * 100), 0) / progress.length).toFixed(1) + '%'
                    : 'N/A'
                  }
                </p>
                <p className="text-sm text-muted-foreground">RLS: Your data only</p>
              </CardContent>
            </Card>
          </div>

          {/* Add New Progress Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Student Assessment</CardTitle>
              <CardDescription>Record new student progress (RLS: Only for your students)</CardDescription>
            </CardHeader>
            <CardContent>
              <AddProgressForm students={students} classrooms={classrooms} />
            </CardContent>
          </Card>

          {/* Classrooms Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Classrooms</CardTitle>
                <CardDescription>Classes you are teaching (RLS filtered)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classrooms.map((classroom: Classroom) => (
                    <div key={classroom.id} className="p-3 border rounded">
                      <h3 className="font-semibold">{classroom.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Grade {classroom.grade_level} • {classroom.schools?.name || 'Unknown School'}
                      </p>
                      <p className="text-sm mt-1">
                        Students: {students.filter((s: Student) => s.class_id === classroom.id).length}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Students</CardTitle>
                <CardDescription>Students in your classes (RLS filtered)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {students.map((student: Student) => {
                    const studentClassroom = classrooms.find((c: Classroom) => c.id === student.class_id);
                    return (
                      <div key={student.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.student_number} • {studentClassroom?.name || 'Unknown Class'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {studentProgress[student.id]?.records.length || 0} records
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Progress Records */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Latest student progress records (RLS: Only your student&apos;s data)</CardDescription>
            </CardHeader>
            <CardContent>
              {progress.length > 0 ? (
                <div className="space-y-3">
                  {progress.slice(0, 10).map((record: Progress) => (
                    <div key={record.id} className="flex justify-between items-center p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{record.students?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {record.students?.student_number} • {record.classrooms?.name}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">{record.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(record.assessment_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
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
                  {progress.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground">
                      + {progress.length - 10} more records
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">No progress records found.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add your first assessment using the form above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics Section */}
          <ClassAveragesDisplay />
        </div>
      )}
    </div>
  );
}