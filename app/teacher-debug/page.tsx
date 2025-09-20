import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TeacherDebugPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get all relevant data for debugging
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('email')

  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('*')
    .order('name')

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('name')

  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .order('assessment_date', { ascending: false })

  // Find John's profile specifically (using correct email)
  const johnProfile = profiles?.find(p => p.email === 'one@gmail.com')
  const johnClassrooms = classrooms?.filter(c => c.teacher_id === johnProfile?.id)
  const johnStudents = students?.filter(s => 
    johnClassrooms?.some(c => c.id === s.class_id)
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Teacher Dashboard Debug</h1>
      
      {/* John's Specific Data */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">John's Profile & Assignments</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Profile:</h3>
            {johnProfile ? (
              <div className="bg-white p-3 rounded border">
                <p><strong>ID:</strong> {johnProfile.id}</p>
                <p><strong>Email:</strong> {johnProfile.email}</p>
                <p><strong>Name:</strong> {johnProfile.full_name}</p>
                <p><strong>Role:</strong> {johnProfile.role}</p>
              </div>
            ) : (
              <div className="bg-red-100 border border-red-300 rounded p-3 text-red-700">
                No profile found for one@gmail.com
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Assigned Classrooms:</h3>
            {johnClassrooms && johnClassrooms.length > 0 ? (
              <div className="space-y-2">
                {johnClassrooms.map(classroom => (
                  <div key={classroom.id} className="bg-white p-3 rounded border">
                    <p><strong>{classroom.name}</strong></p>
                    <p>Grade {classroom.grade_level}</p>
                    <p className="text-sm text-gray-600">ID: {classroom.id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-100 border border-yellow-300 rounded p-3 text-yellow-700">
                No classrooms assigned to John
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Students in John's Classes:</h3>
          {johnStudents && johnStudents.length > 0 ? (
            <div className="bg-white p-3 rounded border">
              <p>{johnStudents.length} students found</p>
              {johnStudents.slice(0, 3).map(student => (
                <p key={student.id} className="text-sm">• {student.name}</p>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-300 rounded p-3 text-yellow-700">
              No students found in John's classes
            </div>
          )}
        </div>
      </div>

      {/* All Profiles */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">All Profiles ({profiles?.length || 0})</h2>
        <div className="grid md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
          {profiles?.map(profile => (
            <div key={profile.id} className="bg-white p-3 rounded border text-sm">
              <p><strong>{profile.full_name || 'No name'}</strong></p>
              <p>Email: {profile.email}</p>
              <p>Role: <span className={`px-2 py-1 rounded text-xs ${
                profile.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                profile.role === 'head_teacher' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>{profile.role}</span></p>
              <p className="text-gray-500">ID: {profile.id}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All Classroom Assignments */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">All Classroom Assignments ({classrooms?.length || 0})</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {classrooms?.map(classroom => {
            const teacher = profiles?.find(p => p.id === classroom.teacher_id)
            return (
              <div key={classroom.id} className="bg-white p-3 rounded border text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p><strong>{classroom.name}</strong> (Grade {classroom.grade_level})</p>
                    <p className="text-gray-600">ID: {classroom.id}</p>
                  </div>
                  <div className="text-right">
                    {teacher ? (
                      <div>
                        <p className="font-medium">{teacher.full_name}</p>
                        <p className="text-gray-600">{teacher.email}</p>
                      </div>
                    ) : (
                      <span className="text-red-600">Unassigned</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <a href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Admin Panel
        </a>
        <a href="/teacher" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Teacher Dashboard
        </a>
        <a href="/debug" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          General Debug
        </a>
      </div>
    </div>
  )
}