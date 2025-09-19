import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type UserRole = 'student' | 'teacher' | 'head_teacher';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      console.log('No user or auth error:', error);
      return null;
    }

    // Try to get profile, but don't fail if profiles table doesn't exist yet
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('Profile error (table might not exist yet):', profileError);
        // Return a default profile if the table doesn't exist
        return {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          role: 'student' as UserRole
        };
      }

      return profile as UserProfile;
    } catch (profileError) {
      console.log('Profile fetch failed, returning basic user info:', profileError);
      // Return basic user info if profiles table doesn't exist
      return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        role: 'student' as UserRole
      };
    }
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<UserProfile> {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard?error=unauthorized');
  }
  
  return user;
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
  redirect('/auth/login');
}