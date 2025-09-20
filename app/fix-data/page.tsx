import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function FixDataPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Check if profile exists for current user
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fix Database Data</h1>
        <p className="text-muted-foreground">Automatically fix missing profiles and data</p>
      </div>

      <div className="grid gap-6">
        {/* Current User Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current User Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Profile Status:</strong> {existingProfile ? 'Profile Exists' : 'Profile Missing'}</p>
                {existingProfile && (
                  <p><strong>Role:</strong> {existingProfile.role}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Fixes */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Fixes</CardTitle>
            <CardDescription>Copy and run these SQL commands in Supabase SQL Editor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Fix 1: Add Your Profile */}
            <div className="p-4 border rounded bg-blue-50">
              <h3 className="font-semibold mb-2">1. Add Your Profile (Head Teacher)</h3>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                <pre>{`-- Add your profile as head teacher
INSERT INTO profiles (id, email, full_name, role) VALUES
  ('${user.id}', '${user.email}', 'Tejas Dherange', 'head_teacher')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;`}</pre>
              </div>
            </div>

            {/* Fix 2: Add Test Profiles */}
            <div className="p-4 border rounded bg-green-50">
              <h3 className="font-semibold mb-2">2. Add Test Profiles (Teacher & Students)</h3>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                <pre>{`-- Add test profiles for other roles
INSERT INTO profiles (id, email, full_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440101', 'one@gmail.com', 'Tej Teacher', 'teacher'),
  ('550e8400-e29b-41d4-a716-446655440102', 'tejasdherange0099@gmail.com', 'Teju Student', 'student'),
  ('550e8400-e29b-41d4-a716-446655440103', 'tejas@gmail.com', 'Test Student 2', 'student')
ON CONFLICT (id) DO NOTHING;`}</pre>
              </div>
            </div>

            {/* Fix 3: Add Students */}
            <div className="p-4 border rounded bg-yellow-50">
              <h3 className="font-semibold mb-2">3. Add Students</h3>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                <pre>{`-- Add students linked to profiles
INSERT INTO students (id, user_id, name, class_id, school_id, student_number) VALUES
  ('750e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440102', 'Teju Student', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'STU2024001'),
  ('750e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440103', 'Test Student 2', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'STU2024002')
ON CONFLICT (id) DO NOTHING;`}</pre>
              </div>
            </div>

            {/* Fix 4: Add Progress */}
            <div className="p-4 border rounded bg-purple-50">
              <h3 className="font-semibold mb-2">4. Add Sample Progress Records</h3>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                <pre>{`-- Add sample progress records
INSERT INTO progress (student_id, class_id, school_id, subject, marks, max_marks, assessment_date) VALUES
  ('750e8400-e29b-41d4-a716-446655440301', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Algebra', 88.5, 100, '2024-09-01'),
  ('750e8400-e29b-41d4-a716-446655440301', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Geometry', 92.0, 100, '2024-09-08'),
  ('750e8400-e29b-41d4-a716-446655440302', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Algebra', 76.5, 100, '2024-09-01'),
  ('750e8400-e29b-41d4-a716-446655440302', '650e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Geometry', 82.0, 100, '2024-09-08');`}</pre>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Copy each SQL block above (one at a time)</li>
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a></li>
                <li>Navigate to your project → <strong>SQL Editor</strong></li>
                <li>Paste and run each SQL command in order (1, 2, 3, 4)</li>
                <li>Come back and check <a href="/debug" className="text-blue-600 underline">/debug page</a></li>
                <li>Visit <a href="/admin" className="text-blue-600 underline">/admin page</a> to see the data</li>
              </ol>
            </div>

          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Supabase Dashboard</Button>
              </a>
              <a href="/debug">
                <Button variant="outline">Debug Page</Button>
              </a>
              <a href="/admin">
                <Button variant="outline">Admin Page</Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}