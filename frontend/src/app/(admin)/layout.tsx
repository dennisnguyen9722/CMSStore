// layout.tsx (admin)
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside className="w-64 p-4 border-r">
        {/* Sidebar menu */}
        <h2 className="font-bold mb-2">Quản trị</h2>
        <ul className="space-y-1">
          <li>
            <a href="/dashboard">Dashboard</a>
          </li>
          <li>
            <a href="/admin/users">Người dùng</a>
          </li>
          {/* ... */}
        </ul>
      </aside>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
