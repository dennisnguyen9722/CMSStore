import jwt_decode from 'jwt-decode';
import { cookies } from 'next/headers';

interface DecodedToken {
  id: number;
  name: string;
  email: string;
  role: string;
  exp: number;
}

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  try {
    const decoded = jwt_decode<DecodedToken>(token);
    return decoded.exp > Date.now() / 1000;
  } catch (err) {
    console.error("Token invalid:", err);
    return false;
  }
};

export const getUserRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    const decoded = jwt_decode<DecodedToken>(token);
    return decoded.role;
  } catch (err) {
    return null;
  }
};
