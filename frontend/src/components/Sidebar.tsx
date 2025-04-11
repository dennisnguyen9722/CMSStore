"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken"); // Xóa token khỏi localStorage
    router.push("/"); // Điều hướng về trang đăng nhập
  };

  return (
    <aside className="w-64 h-screen bg-white shadow-md p-4 space-y-4">
      <h2 className="text-xl font-bold">CMS Dashboard</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/dashboard/sliders">Quản lý slider</Link>
        </li>
        <li>
          <Link href="/dashboard/users">Quản lý người dùng</Link>
        </li>
        <li>
          <Link href="/dashboard/categories">Quản lý danh mục</Link>
        </li>
        <li>
          <Link href="/dashboard/products">Quản lý sản phẩm</Link>
        </li>
        <li>
          <Link href="/dashboard/posts">Quản lý bài viết</Link>
        </li>
        <li>
          <button onClick={handleLogout}>Đăng xuất</button>
        </li>
      </ul>
    </aside>
  );
}
