// app/(web)/page.tsx
import { getFeaturedProducts } from "@/lib/products";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import SwiperSlider from "@/components/SwiperSlider";
import { getCategoriesWithProducts } from "@/lib/products";
import { ShoppingCart } from "lucide-react";
interface Product {
  id: number;
  name: string;
  price: string;
  is_featured: number;
  images: string[];
}

export default async function StoreHomePage() {
  const featuredProducts = await getFeaturedProducts();
  const groupedData = await getCategoriesWithProducts();

  return (
    <div>
      {/* Header */}
      <header className="bg-black text-white py-4 shadow-sm border-b border-blue-700">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          {/* Top Row: Logo + Search */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="text-3xl font-bold tracking-wide hover:text-yellow-300 transition shrink-0"
            >
              CMS<span className="text-yellow-300">Store</span>
            </Link>

            {/* Search */}
            <div className="w-full sm:w-full max-w-md">
              <form
                action="/search"
                method="GET"
                className="w-full sm:w-full max-w-md"
              >
                <input
                  type="text"
                  name="q"
                  placeholder="Tìm sản phẩm..."
                  className="w-full px-4 py-2 rounded-md text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </form>
            </div>
          </div>

          {/* Bottom Row: Menu + Cart */}
          <div className="flex justify-between items-center w-full md:w-full">
            {/* Navigation */}
            <nav className="hidden md:block">
              <ul className="flex space-x-6 text-lg font-medium">
                <li>
                  <Link href="/" className="hover:text-yellow-300 transition">
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/product"
                    className="hover:text-yellow-300 transition"
                  >
                    Sản phẩm
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="ml-4 relative hover:text-yellow-300 transition"
            >
              <ShoppingCart size={28} />
              {/* Badge nếu cần hiển thị số lượng */}
              {/* <span className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">2</span> */}
            </Link>
          </div>
        </div>
      </header>

      {/* Slider Section */}
      <section className="slider">
        <SwiperSlider />
      </section>

      {/* Store Content */}
      <main className="store">
        <div className="container mx-auto px-4 py-8 max-w-[1200px]">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Sản phẩm nổi bật</h2>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {featuredProducts.map((product: Product) => (
                  <div
                    key={product.id}
                    className="product-item bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <img
                      src={`http://localhost:5000${product.images[0]}`}
                      alt={product.name}
                      className="w-full h-60 object-contain rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-600">
                      {Number(product.price).toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">
                Không có sản phẩm nào.
              </p>
            )}
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 space-y-12 max-w-[1200px]">
          {groupedData.map(({ category, products }) => (
            <div key={category.id}>
              <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                  {products.map((product: any) => (
                    <div
                      key={product.id}
                      className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <img
                        src={`http://localhost:5000${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-60 object-contain rounded-lg mb-4"
                      />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-sm font-bold text-gray-600">
                        {Number(product.price).toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Không có sản phẩm nào.</p>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-yellow-400 text-black py-8 mt-12">
        <div className="container mx-auto px-4 max-w-[1200px] grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Về CMSStore</h3>
            <p>Chuyên cung cấp sản phẩm chất lượng với giá cả hợp lý.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Liên hệ</h3>
            <p>Email: contact@cmsstore.vn</p>
            <p>Hotline: 0123 456 789</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Chính sách</h3>
            <ul className="space-y-1">
              <li>Chính sách bảo hành</li>
              <li>Chính sách đổi trả</li>
              <li>Chính sách vận chuyển</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
