// src/server/auth.ts
import { cookies } from 'next/headers';

export const isAuthenticatedServer = async (): Promise<boolean> => {
    const cookieStore = await cookies(); // ✅ dùng await
    const token = cookieStore.get('accessToken');
    return !!token;
  };
  
