import { redirect } from 'next/navigation';

export default async function SimpleDashboard() {
  // Redirect to main dashboard
  redirect('/dashboard');
}