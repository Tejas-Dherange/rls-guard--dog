import { redirect } from 'next/navigation';

export default async function TeacherDebugPage() {
  // Redirect to main dashboard as debug functionality is removed
  redirect('/dashboard');
}