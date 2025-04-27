"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
    };

    fetchData();
  }, [query]);

  if (!query) {
    return (
      <p className="text-center py-8 text-gray-500">
        Không có từ khóa tìm kiếm.
      </p>
    );
  }

  if (loading) return <p className="py-8">Đang tìm kiếm...</p>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">
        Kết quả tìm kiếm cho: <span className="text-yellow-500">"{query}"</span>
      </h2>
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map((product: any) => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow">
              <img
                src={
                  product.images?.length > 0
                    ? `http://localhost:5000${product.images[0]}`
                    : "/no-image.png" // <-- ảnh mặc định nếu không có
                }
                alt={product.name}
                className="w-full h-60 object-contain rounded mb-2"
              />
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-sm text-gray-600">
                {Number(product.price).toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Không tìm thấy sản phẩm nào phù hợp.</p>
      )}
    </div>
  );
}
