import { getCurrentUser } from '@/lib/auth-safe';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function Dashboard() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  let dashboardContent;
  let hasDatabase = false;

  // Try to check if database tables exist
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (!error) {
      hasDatabase = true;
      // Try to get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        user.role = profile.role;
        user.full_name = profile.full_name;
      }
    }
  } catch (error) {
    console.log('Database tables not ready yet:', error);
  }

  if (!hasDatabase) {
    // Show setup instructions if database isn't ready
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome to RLS Guard Dog! 🐕‍🦺</h1>
          <p className="text-muted-foreground">You are successfully logged in!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>⚠️ Database Setup Required</CardTitle>
            <CardDescription>Set up the database to access full features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p><strong>Your Info:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Email: {user.email}</li>
                <li>Role: {user.role}</li>
                <li>ID: {user.id}</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800">Setup Instructions:</h3>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a></li>
                <li>Navigate to <strong>SQL Editor</strong></li>
                <li>Run the migration files from the <code>supabase/migrations/</code> folder</li>
                <li>Refresh this page</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <form action="/auth/sign-out" method="post">
                <Button type="submit" variant="outline">Sign Out</Button>
              </form>
              <Link href="/login-test">
                <Button variant="secondary">Test Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If database is ready, show role-based dashboard
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome, {user.full_name || user.email}</h1>
        <p className="text-muted-foreground">Role: {user.role.replace('_', ' ').toUpperCase()}</p>
      </div>

      {user.role === 'student' && <StudentDashboard user={user} />}
      {user.role === 'teacher' && <TeacherDashboard user={user} />}
      {user.role === 'head_teacher' && <HeadTeacherDashboard user={user} />}

      <div className="mt-6">
        <form action="/auth/sign-out" method="post">
          <Button type="submit" variant="outline">Sign Out</Button>
        </form>
      </div>
    </div>
  );
}

function StudentDashboard({ user }: { user: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Dashboard</CardTitle>
        <CardDescription>Your academic progress and information</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Welcome to your student dashboard! Database is set up and ready.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Full student features will be available once you're enrolled in classes.
        </p>
      </CardContent>
    </Card>
  );
}

function TeacherDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Dashboard</CardTitle>
          <CardDescription>Manage your classes and students</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Welcome to your teacher dashboard! Database is set up and ready.</p>
          <div className="mt-4">
            <Link href="/teacher">
              <Button>Go to Teacher Management</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HeadTeacherDashboard({ user }: { user: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Head Teacher Dashboard</CardTitle>
        <CardDescription>School-wide overview and management</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Welcome to your head teacher dashboard! Database is set up and ready.</p>
        <p className="text-sm text-muted-foreground mt-2">
          You have access to all school data and analytics.
        </p>
      </CardContent>
    </Card>
  );
}