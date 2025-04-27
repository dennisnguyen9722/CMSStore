"use client";

import { useState, useMemo } from "react";

interface Product {
  id: number;
  name: string;
  price: string;
  is_featured: number;
  images: string[];
}

interface CategoryWithProducts {
  category: { id: number; name: string };
  products: Product[];
}

export default function ProductShowcase({
  featuredProducts,
  groupedData,
}: {
  featuredProducts: Product[];
  groupedData: CategoryWithProducts[];
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFeatured = useMemo(() => {
    return featuredProducts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [featuredProducts, searchTerm]);

  const filteredGrouped = useMemo(() => {
    return groupedData.map(({ category, products }) => ({
      category,
      products: products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }));
  }, [groupedData, searchTerm]);

  return (
    <main className="store">
      <div className="container mx-auto px-4 py-4 max-w-[1200px]">
        {/* Thanh tìm kiếm */}
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-md text-black bg-white placeholder-gray-500 mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {/* Sản phẩm nổi bật */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Sản phẩm nổi bật</h2>
          {filteredFeatured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredFeatured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Không tìm thấy sản phẩm nổi bật.</p>
          )}
        </div>
      </div>

      {/* Sản phẩm theo danh mục */}
      <div className="container mx-auto px-4 py-8 space-y-12 max-w-[1200px]">
        {filteredGrouped.map(({ category, products }) =>
          products.length > 0 ? (
            <div key={category.id}>
              <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    </main>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all">
      <img
        src={`http://localhost:5000${product.images[0]}`}
        alt={product.name}
        className="w-full h-60 object-contain rounded-lg mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {product.name}
      </h3>
      <p className="text-xl font-bold text-gray-600">
        {Number(product.price).toLocaleString("vi-VN")} VNĐ
      </p>
    </div>
  );
}
