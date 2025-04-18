import { redirect } from 'next/navigation';
import { isAuthenticatedServer } from '@/server/auth';

export default function AdminIndex() {
  if (!isAuthenticatedServer()) {
    redirect('/login');
  }

  redirect('/admin/dashboard');
}
