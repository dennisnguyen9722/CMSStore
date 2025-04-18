// app/(admin)/page.tsx
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function AdminIndex() {
  // Kiểm tra đăng nhập
  if (!isAuthenticated()) {
    redirect('/login'); // Nếu chưa login thì chuyển về login
  }

  redirect('/dashboard'); // Nếu đã login thì vào dashboard
}
