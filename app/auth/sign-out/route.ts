import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST() {
  const supabase = await createClient();
  
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
  
  redirect('/auth/login');
}