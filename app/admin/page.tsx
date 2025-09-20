import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClassroomAssignmentForm } from '@/components/classroom-assignment-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

interface Classroom {
  id: string;
  name: string;
  grade_level: number;
  teacher_id?: string;
  school?: { name: string };
  teacher?: { full_name: string; email: string };
}

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Check if user is head teacher
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'head_teacher') {
    redirect('/dashboard')
  }

  // Fetch all data separately for better reliability  
  const { data: teachers, error: teachersError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('role', 'teacher')

  const { data: classrooms, error: classroomsError } = await supabase
    .from('classrooms')
    .select('*')

  const { data: schools, error: schoolsError } = await supabase
    .from('schools')
    .select('id, name')

  // Create enhanced classroom data with teacher and school info
  const classroomsWithDetails = classrooms ? classrooms.map(classroom => {
    const teacher = teachers?.find(t => t.id === classroom.teacher_id)
    const school = schools?.find(s => s.id === classroom.school_id)
    return {
      ...classroom,
      teacher,
      school
    }
  }) : []

  // Debug logging
  console.log('Teachers:', teachers?.length || 0, teachers)
  console.log('Classrooms:', classrooms?.length || 0, classrooms)
  console.log('Schools:', schools?.length || 0, schools)
  console.log('Errors:', { teachersError, classroomsError, schoolsError })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">
          Dashboard / Admin Panel
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">School Administration</h1>
        <p className="text-muted-foreground">Manage classroom assignments and school operations</p>
      </div>

      <div className="grid gap-6">
        {/* Current Classroom Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Current Classroom Assignments</CardTitle>
            <CardDescription>
              Overview of all classrooms and their assigned teachers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Classroom</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">School</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Grade</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Assigned Teacher</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Teacher Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classroomsWithDetails?.map((classroom: Classroom) => (
                    <tr key={classroom.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {classroom.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {classroom.school?.name || 'Unknown School'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Grade {classroom.grade_level}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {classroom.teacher?.full_name || 'Unassigned'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {classroom.teacher?.email || '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          classroom.teacher_id 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {classroom.teacher_id ? 'Assigned' : 'Unassigned'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!classroomsWithDetails || classroomsWithDetails.length === 0) && (
                    <tr>
                      <td colSpan={6} className="border border-gray-300 px-4 py-8 text-center text-muted-foreground">
                        No classrooms found. Please check if the database has been seeded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Classroom Assignment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Assign/Reassign Classrooms</CardTitle>
            <CardDescription>
              Change teacher assignments for classrooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClassroomAssignmentForm 
              classrooms={classroomsWithDetails || []}
              teachers={teachers || []}
            />
          </CardContent>
        </Card>

        {/* Teacher Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Overview</CardTitle>
            <CardDescription>
              All teachers and their assigned classrooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teachers?.map((teacher: Teacher) => {
                const assignedClasses = classroomsWithDetails?.filter((c: Classroom) => c.teacher_id === teacher.id) || []
                return (
                  <div key={teacher.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{teacher.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {assignedClasses.length} Classroom{assignedClasses.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {assignedClasses.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Assigned Classes:</p>
                        <div className="flex flex-wrap gap-2">
                          {assignedClasses.map((cls: Classroom) => (
                            <span 
                              key={cls.id}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                            >
                              {cls.name} (Grade {cls.grade_level})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {(!teachers || teachers.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No teachers found. Please check if the database has been seeded.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}