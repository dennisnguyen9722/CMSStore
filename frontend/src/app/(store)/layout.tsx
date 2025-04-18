// layout.tsx (store)
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="p-4 shadow">
        <h1 className="text-xl font-bold">CMSStore</h1>
      </header>
      <main className="min-h-screen p-4">{children}</main>
      <footer className="p-4 text-center text-sm text-gray-500">
        © 2025 CMSStore. All rights reserved.
      </footer>
    </div>
  );
}
