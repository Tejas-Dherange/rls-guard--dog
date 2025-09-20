'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeSwitcher } from "../theme-switcher";
import { Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'student' | 'teacher' | 'head_teacher';
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Profile error:', error);
        // Fallback profile if profiles table doesn't exist or has issues
        setProfile({
          id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || null,
          role: 'student'
        });
      } else {
        setProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({
        id: userId,
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || null,
        role: 'student'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full border-2 border-border shadow-sm backdrop-blur-md bg-background/80">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-foreground">Guard Dog</Link>
          <div className="flex items-center gap-4">
            <div className="h-9 w-20 bg-muted animate-pulse rounded"></div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-2 border-border shadow-sm backdrop-blur-md bg-background/80">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-foreground">Guard Dog</Link>
        <div></div>
        {user && profile ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Hello, {profile.email}</span>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            {profile.role === 'head_teacher' && (
              <Link href="/admin">
                <Button variant="secondary" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
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
  );
}