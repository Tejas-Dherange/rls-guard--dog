import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ProgressForm } from '@/components/progress-form';
import { ClassAveragesDisplay } from '@/components/class-averages-display';

async function getTeacherClassrooms(userId: string) {
  const supabase = await createClient();
  
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select(`
      *,
      schools:school_id (
        name
      ),
      students (
        id,
        name,
        student_number
      )
    `)
    .eq('teacher_id', userId);

  return classrooms || [];
}

async function getClassProgress(classId: string) {
  const supabase = await createClient();
  
  const { data: progress } = await supabase
    .from('progress')
    .select(`
      *,
      students:student_id (
        name,
        student_number
      )
    `)
    .eq('class_id', classId)
    .order('assessment_date', { ascending: false });

  return progress || [];
}

export default async function TeacherPage() {
  const user = await requireRole(['teacher', 'head_teacher']);
  const classrooms = await getTeacherClassrooms(user.id);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Manage your classes and student progress</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {classrooms.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No classrooms assigned. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {classrooms.map((classroom: any) => (
            <ClassroomSection key={classroom.id} classroom={classroom} />
          ))}
          
          <ClassAveragesDisplay />
        </div>
      )}
    </div>
  );
}

async function ClassroomSection({ classroom }: { classroom: any }) {
  const progress = await getClassProgress(classroom.id);
  
  // Group progress by student
  const studentProgress = progress.reduce((acc: any, record: any) => {
    const studentId = record.student_id;
    if (!acc[studentId]) {
      acc[studentId] = {
        student: record.students,
        records: []
      };
    }
    acc[studentId].records.push(record);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            {classroom.name}
            <Badge variant="secondary" className="ml-2">
              Grade {classroom.grade_level}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {classroom.schools?.name}
          </div>
        </CardTitle>
        <CardDescription>
          {classroom.students?.length || 0} students enrolled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add Progress Form */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Add Progress Record</h3>
            <ProgressForm 
              classId={classroom.id} 
              schoolId={classroom.school_id}
              students={classroom.students} 
            />
          </div>

          {/* Students List with Progress */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Student Progress</h3>
            {classroom.students && classroom.students.length > 0 ? (
              <div className="space-y-4">
                {classroom.students.map((student: any) => {
                  const studentRecords = studentProgress[student.id]?.records || [];
                  const latestRecord = studentRecords[0];
                  
                  return (
                    <div key={student.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ID: {student.student_number}
                          </p>
                        </div>
                        {latestRecord && (
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {latestRecord.marks}/{latestRecord.max_marks}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {latestRecord.subject} • {new Date(latestRecord.assessment_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {studentRecords.length > 0 ? (
                        <div className="mt-3">
                          <details className="cursor-pointer">
                            <summary className="text-sm text-blue-600 hover:text-blue-800">
                              View all progress ({studentRecords.length} records)
                            </summary>
                            <div className="mt-2 space-y-2">
                              {studentRecords.slice(0, 5).map((record: any) => (
                                <div key={record.id} className="text-sm p-2 bg-gray-50 rounded">
                                  <div className="flex justify-between">
                                    <span>{record.subject}</span>
                                    <span>{record.marks}/{record.max_marks} ({((record.marks / record.max_marks) * 100).toFixed(1)}%)</span>
                                  </div>
                                  <div className="text-muted-foreground">
                                    {new Date(record.assessment_date).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">
                          No progress records yet
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No students enrolled in this class.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}