import { redirect } from 'next/navigation';

export default async function DebugPage() {
  // Redirect to main dashboard as debug functionality is removed
  redirect('/dashboard');
}