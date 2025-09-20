import { getCurrentUser } from "@/lib/auth-safe";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  // Check if user is already authenticated and redirect to dashboard
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
    

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
            Modern School
            <span className="text-blue-600 dark:text-blue-400"> Management</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground">
            Streamline your educational institution with our comprehensive management system. 
            Track student progress, manage classrooms, and analyze performance data all in one place.
          </p>
          <div className="mt-10">
            <Link href="/auth/login">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Student Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Efficiently track student information, enrollment, and academic progress 
                  with our intuitive student management tools.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Gain insights into student performance with detailed analytics, 
                  progress tracking, and comprehensive reporting features.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Classroom Organization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Organize classrooms, manage teacher assignments, and coordinate 
                  academic activities across your institution.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-card rounded-lg shadow-sm p-8 border">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join educational institutions already using our platform to manage their operations.
            </p>
            <div className="space-x-4">
              <Link href="/auth/login">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline" size="lg">Create Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 School Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
