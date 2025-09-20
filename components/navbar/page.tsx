//navbar with login and sign up buttons if we are logout else with user avatar and dropdown
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth-safe";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeSwitcher } from "../theme-switcher";

export default async function Navbar() {
  const user = await getCurrentUser();
    return (
        <>
        {/* //make a navbar with border shadow and outline and bg blur  */}
    <div className="w-full   border-2 outline shadow-sm backdrop-blur-md">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">RLS Guard Dog</Link>
        <div></div>
          {user ? (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Hello, {user.email}</span>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Link href="/fix-data">
                  <Button variant="outline" size="sm" className="bg-green-50 hover:bg-green-100">Fix Data</Button>
                </Link>
                <Link href="/debug">
                  <Button variant="outline" size="sm">Debug</Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
                <Link href="/auth/logout">
                  <Button variant="ghost">Logout</Button>
                </Link>
                <ThemeSwitcher />
            </div>
          ) : (
            <div className="flex items-center gap-4">
                <Link href="/auth/login">
                    <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                    <Button variant="ghost">Sign Up</Button>
                </Link>
                <ThemeSwitcher />
            </div>
            )}
        </div>
        </div>
    </>
  );
}
// If user is not logged in, show login and sign up buttons
// If user is logged in, show user avatar and dropdown with logout button
// Use getCurrentUser from auth-safe.ts to get the current user
