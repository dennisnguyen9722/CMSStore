"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "@/lib/auth";

export default function DashboardPage() {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {  // Đảm bảo chỉ chạy trên client
      if (!isAuthenticated()) {
        router.push("/"); // Chuyển hướng về trang login nếu chưa đăng nhập
      } else {
        setRole(getUserRole()); // Lấy role từ token
        setIsAuthenticatedState(true); // Đánh dấu là đã xác thực
      }
    }
  }, []);

  if (!isAuthenticatedState) return <div>Loading...</div>;

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-4">Chào mừng đến với Dashboard!</h1>
        <p>Chọn một mục trong sidebar để bắt đầu quản lý.</p>
      </main>
    </div>
  );
}
