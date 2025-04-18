// app/(store)/layout.tsx
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">CMSStore</h1>
        <nav className="mt-2">
          <a href="/" className="mr-4 text-sm hover:underline">Trang chủ</a>
          <a href="/products" className="mr-4 text-sm hover:underline">Sản phẩm</a>
          <a href="/cart" className="text-sm hover:underline">Giỏ hàng</a>
        </nav>
      </header>

      {/* Main content */}
      <main className="min-h-screen p-6">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-4">
        <p>© 2025 CMSStore. All rights reserved.</p>
      </footer>
    </div>
  );
}
