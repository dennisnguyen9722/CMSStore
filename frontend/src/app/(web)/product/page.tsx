"use client";

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

// Định nghĩa interface cho Product
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category_id: number;
  description?: string;
  is_featured: boolean;
  images: string[];
}

// Định nghĩa interface cho Category
interface Category {
  id: number;
  name: string;
}

export default function ProductPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");
  const initialPriceRange = searchParams.get("priceRange");

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [priceFilters, setPriceFilters] = useState<string[]>(initialPriceRange ? [initialPriceRange] : []);

  // Xử lý thay đổi checkbox
  const handlePriceFilterChange = (value: string) => {
    setPriceFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        if (!response.ok) throw new Error("Lỗi khi lấy danh mục");
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const queryParams: Record<string, string> = {};
        if (category) queryParams.category_id = category;
        if (priceFilters.length > 0) queryParams.priceRange = priceFilters[0];

        const queryString = new URLSearchParams(queryParams).toString();
        console.log("Sending request with query:", queryString);

        const response = await fetch(`http://localhost:5000/api/products?${queryString}`);
        if (!response.ok) throw new Error(`Lỗi khi lấy sản phẩm: ${response.status}`);
        const data: Product[] = await response.json();
        console.log("Received products:", data);

        setFilteredProducts(data);
        setError(null);
      } catch (err) {
        const error = err as Error;
        console.error("Fetch error:", error);
        setError(error.message);
      }
    };

    fetchFilteredProducts();
  }, [category, priceFilters]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-12 max-w-[1200px]">
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex space-x-4">
          <div className="w-1/4">
            <h3 className="text-xl font-semibold">Danh mục</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/product?category=${cat.id}`}
                    className={`block text-gray-700 hover:text-blue-500 ${category === String(cat.id) ? "font-bold text-blue-500" : ""}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold mt-6">Giá</h3>
            <div className="space-y-2">
              <Link
                href="/product"
                className="block text-blue-500 hover:underline"
                onClick={() => setPriceFilters([])}
              >
                Hiển thị tất cả
              </Link>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={priceFilters.includes("under-1m")}
                  onChange={() => handlePriceFilterChange("under-1m")}
                  className="form-checkbox h-5 w-5 text-blue-500"
                />
                <span>Dưới 1 triệu</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={priceFilters.includes("1m-5m")}
                  onChange={() => handlePriceFilterChange("1m-5m")}
                  className="form-checkbox h-5 w-5 text-blue-500"
                />
                <span>Từ 1 triệu đến 5 triệu</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={priceFilters.includes("above-5m")}
                  onChange={() => handlePriceFilterChange("above-5m")}
                  className="form-checkbox h-5 w-5 text-blue-500"
                />
                <span>Trên 5 triệu</span>
              </label>
            </div>
          </div>

          <div className="w-3/4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="bg-white border rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={
                          product.images && product.images[0]
                            ? `http://localhost:5000${product.images[0]}`
                            : "/placeholder.jpg"
                        }
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="text-base font-semibold text-gray-800 line-clamp-2 overflow-hidden">
                        {product.name}
                      </h2>
                      <p className="text-sm font-bold text-gray-600">
                        {Number(product.price).toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p>Không có sản phẩm nào phù hợp với bộ lọc.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
