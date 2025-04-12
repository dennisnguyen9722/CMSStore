// src/app/dashboard/layout.tsx
import Sidebar from "@/components/Sidebar";
import UserInfo from "@/components/UserInfo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar /> {/* Sidebar luôn hiển thị */}
      <main className="flex-1 p-6">
        <div className="flex justify-end">
          <UserInfo />
        </div>
        {children} {/* Các trang con như UsersPage, CategoriesPage sẽ được hiển thị ở đây */}
      </main>
    </div>
  );
}
