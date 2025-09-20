import { redirect } from 'next/navigation';

// Redirect /auth/logout to /auth/sign-out for compatibility
export async function GET() {
  redirect('/auth/sign-out');
}

export async function POST() {
  redirect('/auth/sign-out');
}