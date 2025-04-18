import Sidebar from "@/components/Sidebar";
import UserInfo from "@/components/UserInfo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-end mb-4">
          <UserInfo />
        </div>
        {children}
      </main>
    </div>
  );
}
