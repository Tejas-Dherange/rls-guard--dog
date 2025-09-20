import { redirect } from 'next/navigation';

export default async function FixDataPage() {
  // Redirect to main dashboard as debug functionality is removed
  redirect('/dashboard');
}