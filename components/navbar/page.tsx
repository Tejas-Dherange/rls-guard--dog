//navbar with login and sign up buttons if we are logout else with user avatar and dropdown
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth-safe";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Navbar() {
  const user = await getCurrentUser();
    return (
        <>
    <div className="w-full bg-white border-b shadow-sm"></div>
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">RLS Guard Dog</Link>
        <div></div>
          {user ? (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Hello, {user.email}</span>
                <Link href="/dashboard-simple">
                  <Button variant="outline">Dashboard</Button>
                </Link> 
                <Link href="/auth/logout">
                  <Button variant="ghost">Logout</Button>
                </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
                <Link href="/auth/login">
                    <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/register">
                    <Button variant="ghost">Sign Up</Button>
                </Link>
            </div>
            )}
        </div>
    </>
  );
}
// If user is not logged in, show login and sign up buttons
// If user is logged in, show user avatar and dropdown with logout button
// Use getCurrentUser from auth-safe.ts to get the current user
