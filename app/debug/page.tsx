import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DebugPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Debug: Get all data from each table
  const { data: schools, error: schoolsError } = await supabase
    .from('schools')
    .select('*')

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')

  const { data: classrooms, error: classroomsError } = await supabase
    .from('classrooms')
    .select('*')

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')

  const { data: progress, error: progressError } = await supabase
    .from('progress')
    .select('*')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Database Debug Page</h1>
        <p className="text-muted-foreground">Check what data exists in the database</p>
      </div>

      <div className="grid gap-6">
        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Last Sign In:</strong> {user.last_sign_in_at}</p>
            </div>
          </CardContent>
        </Card>

        {/* Schools Data */}
        <Card>
          <CardHeader>
            <CardTitle>Schools ({schools?.length || 0})</CardTitle>
            {schoolsError && <CardDescription className="text-red-600">Error: {schoolsError.message}</CardDescription>}
          </CardHeader>
          <CardContent>
            {schools?.length > 0 ? (
              <div className="space-y-2">
                {schools.map((school: any) => (
                  <div key={school.id} className="p-2 border rounded">
                    <p className="font-medium">{school.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {school.id}</p>
                    <p className="text-sm text-muted-foreground">{school.address}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No schools found</p>
            )}
          </CardContent>
        </Card>

        {/* Profiles Data */}
        <Card>
          <CardHeader>
            <CardTitle>Profiles ({profiles?.length || 0})</CardTitle>
            {profilesError && <CardDescription className="text-red-600">Error: {profilesError.message}</CardDescription>}
          </CardHeader>
          <CardContent>
            {profiles?.length > 0 ? (
              <div className="space-y-2">
                {profiles.map((profile: any) => (
                  <div key={profile.id} className="p-2 border rounded">
                    <p className="font-medium">{profile.full_name} ({profile.role})</p>
                    <p className="text-sm text-muted-foreground">Email: {profile.email}</p>
                    <p className="text-sm text-muted-foreground">ID: {profile.id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No profiles found</p>
            )}
          </CardContent>
        </Card>

        {/* Classrooms Data */}
        <Card>
          <CardHeader>
            <CardTitle>Classrooms ({classrooms?.length || 0})</CardTitle>
            {classroomsError && <CardDescription className="text-red-600">Error: {classroomsError.message}</CardDescription>}
          </CardHeader>
          <CardContent>
            {classrooms?.length > 0 ? (
              <div className="space-y-2">
                {classrooms.map((classroom: any) => (
                  <div key={classroom.id} className="p-2 border rounded">
                    <p className="font-medium">{classroom.name} (Grade {classroom.grade_level})</p>
                    <p className="text-sm text-muted-foreground">ID: {classroom.id}</p>
                    <p className="text-sm text-muted-foreground">School ID: {classroom.school_id}</p>
                    <p className="text-sm text-muted-foreground">Teacher ID: {classroom.teacher_id || 'Unassigned'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No classrooms found</p>
            )}
          </CardContent>
        </Card>

        {/* Students Data */}
        <Card>
          <CardHeader>
            <CardTitle>Students ({students?.length || 0})</CardTitle>
            {studentsError && <CardDescription className="text-red-600">Error: {studentsError.message}</CardDescription>}
          </CardHeader>
          <CardContent>
            {students?.length > 0 ? (
              <div className="space-y-2">
                {students.map((student: any) => (
                  <div key={student.id} className="p-2 border rounded">
                    <p className="font-medium">{student.name} ({student.student_number})</p>
                    <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                    <p className="text-sm text-muted-foreground">User ID: {student.user_id}</p>
                    <p className="text-sm text-muted-foreground">Class ID: {student.class_id}</p>
                    <p className="text-sm text-muted-foreground">School ID: {student.school_id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No students found</p>
            )}
          </CardContent>
        </Card>

        {/* Progress Data */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Records ({progress?.length || 0})</CardTitle>
            {progressError && <CardDescription className="text-red-600">Error: {progressError.message}</CardDescription>}
          </CardHeader>
          <CardContent>
            {progress?.length > 0 ? (
              <div className="space-y-2">
                {progress.slice(0, 10).map((record: any) => (
                  <div key={record.id} className="p-2 border rounded">
                    <p className="font-medium">{record.subject}: {record.marks}/{record.max_marks}</p>
                    <p className="text-sm text-muted-foreground">Student ID: {record.student_id}</p>
                    <p className="text-sm text-muted-foreground">Class ID: {record.class_id}</p>
                    <p className="text-sm text-muted-foreground">Date: {record.assessment_date}</p>
                  </div>
                ))}
                {progress.length > 10 && (
                  <p className="text-sm text-muted-foreground">... and {progress.length - 10} more records</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No progress records found</p>
            )}
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Schools Table:</span>
                <span className={schools?.length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {schools?.length > 0 ? 'Has Data' : 'Empty'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Profiles Table:</span>
                <span className={profiles?.length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {profiles?.length > 0 ? 'Has Data' : 'Empty'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Classrooms Table:</span>
                <span className={classrooms?.length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {classrooms?.length > 0 ? 'Has Data' : 'Empty'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Students Table:</span>
                <span className={students?.length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {students?.length > 0 ? 'Has Data' : 'Empty'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Progress Table:</span>
                <span className={progress?.length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {progress?.length > 0 ? 'Has Data' : 'Empty'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}