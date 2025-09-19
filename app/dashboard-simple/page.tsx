import { getCurrentUser } from '@/lib/auth-safe';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function SimpleDashboard() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome to RLS Guard Dog! 🐕‍🦺</h1>
        <p className="text-muted-foreground">You are successfully logged in!</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Current user information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.full_name || 'Not set'}</p>
              <p><strong>Role:</strong> {user.role.replace('_', ' ').toUpperCase()}</p>
              <p><strong>User ID:</strong> {user.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Complete the setup to access all features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800">⚠️ Database Setup Required</h3>
              <p className="text-sm text-yellow-700 mt-2">
                To access the full dashboard with student/teacher features, you need to set up the database tables.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a></li>
                <li>Navigate to <strong>SQL Editor</strong></li>
                <li>Run these migration files in order:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li><code>supabase/migrations/001_initial_schema.sql</code></li>
                    <li><code>supabase/migrations/002_rls_policies.sql</code></li>
                    <li><code>supabase/migrations/003_seed_data.sql</code></li>
                  </ul>
                </li>
                <li>Refresh this page to see the full dashboard</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <Link href="/login-test">
                <Button variant="outline">Test Authentication</Button>
              </Link>
              <Link href="/test-auth">
                <Button variant="outline">Test Connection</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="secondary">Back to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Test Pages</CardTitle>
            <CardDescription>Test different parts of the application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/login-test">
                <Button variant="outline" className="w-full">
                  🔐 Login Test
                </Button>
              </Link>
              <Link href="/test-auth">
                <Button variant="outline" className="w-full">
                  🔍 Auth Test
                </Button>
              </Link>
              <Link href="/teacher" className="pointer-events-none opacity-50">
                <Button variant="outline" className="w-full" disabled>
                  👨‍🏫 Teacher Page (Requires DB)
                </Button>
              </Link>
              <Link href="/protected" className="pointer-events-none opacity-50">
                <Button variant="outline" className="w-full" disabled>
                  🔒 Protected Page (Requires DB)
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sign Out</CardTitle>
            <CardDescription>End your session</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/auth/sign-out" method="post">
              <Button type="submit" variant="destructive">
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}