"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <header className="bg-black text-white py-4 shadow-sm border-b border-blue-700">
      <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* Logo + Search */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4">
          <Link
            href="/"
            className="text-3xl font-bold tracking-wide hover:text-yellow-300 transition shrink-0"
          >
            CMS<span className="text-yellow-300">Store</span>
          </Link>

          <form onSubmit={handleSearch} className="w-full sm:w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-md text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </form>
        </div>

        {/* Menu + Cart */}
        <div className="flex justify-between items-center w-full md:w-full">
          <nav className="hidden md:block">
            <ul className="flex space-x-6 text-lg font-medium">
              <li>
                <Link href="/" className="hover:text-yellow-300 transition">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link href="/product" className="hover:text-yellow-300 transition">
                  Sản phẩm
                </Link>
              </li>
            </ul>
          </nav>

          <Link
            href="/cart"
            className="ml-4 relative hover:text-yellow-300 transition"
          >
            <ShoppingCart size={28} />
          </Link>
        </div>
      </div>
    </header>
  );
}
