import { redirect } from 'next/navigation';

export default async function FixRLSPage() {
  // Redirect to main dashboard as debug functionality is removed
  redirect('/dashboard');
}