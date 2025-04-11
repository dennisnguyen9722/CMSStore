// lib/auth.ts
import jwt_decode from 'jwt-decode';

// Định nghĩa kiểu cho decoded token
interface DecodedToken {
  id: number;
  name: string;
  email: string;
  role: string;
  exp: number; // Thêm trường exp nếu có trong token
}

// Hàm kiểm tra tính hợp lệ của token
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false; // Chỉ chạy trên client

  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  try {
    const decoded = jwt_decode<DecodedToken>(token); // Giải mã token
    return decoded.exp > Date.now() / 1000; // Kiểm tra nếu token còn hiệu lực
  } catch (err) {
    console.error("Token invalid:", err);
    return false;
  }
};

// Hàm lấy role người dùng
export const getUserRole = (): string | null => {
  if (typeof window === 'undefined') return null; // Chỉ chạy trên client

  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    const decoded = jwt_decode<DecodedToken>(token); // Giải mã token
    return decoded.role;
  } catch (err) {
    return null;
  }
};
