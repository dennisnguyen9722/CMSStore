"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  color: string;
}

export default function Header() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const userId = "1"; // TODO: Thay bằng logic lấy user_id thực tế
  const BASE_URL = "http://localhost:5000";

  // Lấy dữ liệu giỏ hàng
  const fetchCart = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/cart/${userId}`);
      if (!response.ok) throw new Error("Lỗi khi lấy giỏ hàng");
      const data = await response.json();
      console.log("Cart fetched:", data);
      setCartItems(data);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setCartItems([]);
    }
  };

  useEffect(() => {
    fetchCart(); // Lấy giỏ hàng khi mount

    // Lắng nghe sự kiện cartUpdated
    const handleCartUpdate = () => {
      console.log("Cart updated, fetching new data...");
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    // Cleanup listener
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  // Tính tổng số lượng sản phẩm
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

          <div
            className="ml-4 relative"
            onMouseEnter={() => setIsCartOpen(true)}
            onMouseLeave={() => setIsCartOpen(false)}
          >
            <Link href="/cart" className="hover:text-yellow-300 transition flex items-center">
              <ShoppingCart size={28} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Dropdown giỏ hàng */}
            {isCartOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-black shadow-lg rounded-lg z-50">
                {cartItems.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Giỏ hàng trống</div>
                ) : (
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-2">Giỏ hàng</h3>
                    {cartItems.map((item) => (
                      <div key={item.product_id} className="flex items-center mb-4">
                        <Image
                          src={item.image ? `${BASE_URL}${item.image}` : "/placeholder.jpg"}
                          alt={item.name}
                          width={50}
                          height={50}
                          objectFit="contain"
                          className="rounded"
                        />
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-semibold truncate">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {Number(item.price).toLocaleString("vi-VN")} VNĐ
                          </p>
                          <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Màu: {item.color}</p>
                        </div>
                      </div>
                    ))}
                    <Link
                      href="/cart"
                      className="block w-full py-2 text-center bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Xem giỏ hàng
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}