import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function signOut() {
  const supabase = await createClient();
  
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
  
  redirect('/auth/login');
}

export async function POST() {
  return await signOut();
}

export async function GET() {
  return await signOut();
}