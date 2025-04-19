import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;  // Kiểm tra token trong cookies

  console.log('Middleware triggered for path:', request.nextUrl.pathname);

  // Nếu truy cập vào /dashboard mà không có token, redirect về /login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    console.log('No token found, redirecting to /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu có token, tiếp tục vào trang yêu cầu
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các trang /dashboard và /admin
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
