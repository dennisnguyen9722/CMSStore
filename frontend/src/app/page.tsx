'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard'); // hoặc '/admin/users' nếu muốn
    } else {
      router.push('/login');
    }
  }, []);

  return null; // hoặc loading nếu muốn
}
