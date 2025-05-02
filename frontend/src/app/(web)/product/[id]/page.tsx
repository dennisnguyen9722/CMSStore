"use client";

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category_id: number;
  description?: string;
  is_featured: boolean;
  images: string[];
  colors: { name: string; code: string }[];
}

const BASE_URL = "http://localhost:5000";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");

  const userId = "1"; // TODO: Thay bằng logic lấy user_id thực tế

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (product && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!product) {
      toast.error("Sản phẩm chưa tải!");
      return;
    }
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc!");
      return;
    }
    if (quantity < 1 || quantity > product.stock) {
      toast.error("Số lượng không hợp lệ!");
      return;
    }
    if (!selectedImage) {
      toast.error("Không có ảnh sản phẩm!");
      return;
    }

    const cartItem = {
      user_id: userId,
      product_id: product.id,
      quantity,
      color: selectedColor,
      image_url: selectedImage.replace(BASE_URL, ""),
    };
    console.log("Sending to cart API:", cartItem);

    try {
      const response = await fetch(`${BASE_URL}/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartItem),
      });
      const responseText = await response.text();
      console.log("Cart API response:", {
        status: response.status,
        body: responseText,
      });

      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(
            errorData.message || `Lỗi khi thêm vào giỏ hàng: ${response.status}`
          );
        } catch (parseErr) {
          throw new Error(
            `Lỗi server: ${response.status} - ${responseText.slice(0, 100)}`
          );
        }
      }

      const data = JSON.parse(responseText);
      toast.success(data.message || "Đã thêm vào giỏ hàng!");
      
      // Dispatch custom event để thông báo giỏ hàng thay đổi
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      const error = err as Error;
      console.error("Add to cart error:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/products/${id}`);
        if (!response.ok) throw new Error(`Lỗi khi lấy sản phẩm: ${response.status}`);
        const data: Product = await response.json();
        console.log("Product fetched:", data);

        if (!Array.isArray(data.images)) {
          console.warn("data.images is not an array:", data.images);
          data.images = [];
        }
        if (!Array.isArray(data.colors)) {
          console.warn("data.colors is not an array:", data.colors);
          data.colors = [];
        }

        data.images = data.images.map((img) =>
          img.startsWith("http") ? img : `${BASE_URL}${img}`
        );
        setProduct(data);
        setSelectedImage(data.images.length > 0 ? data.images[0] : "/placeholder.jpg");
        setSelectedColor(data.colors.length > 0 ? data.colors[0].name : "");

        if (data.category_id) {
          const relatedResponse = await fetch(
            `${BASE_URL}/api/products?category_id=${data.category_id}&limit=4`
          );
          if (!relatedResponse.ok) {
            console.warn("Failed to fetch related products:", relatedResponse.status);
            setRelatedProducts([]);
            return;
          }
          const relatedData = await relatedResponse.json();
          console.log("Related data raw:", relatedData);

          let relatedArray: Product[] = [];
          if (Array.isArray(relatedData)) {
            relatedArray = relatedData;
          } else if (relatedData.products) {
            relatedArray = relatedData.products;
          } else if (relatedData.data) {
            relatedArray = relatedData.data;
          }

          relatedArray = relatedArray.map((product) => ({
            ...product,
            images: Array.isArray(product.images)
              ? product.images.map((img) =>
                  img.startsWith("http") ? img : `${BASE_URL}${img}`
                )
              : [],
            colors: Array.isArray(product.colors) ? product.colors : [],
          }));

          const filteredRelated = relatedArray.filter((p: Product) => p.id !== data.id);
          setRelatedProducts(filteredRelated);
          console.log("Related products fetched:", filteredRelated);
        }
      } catch (err) {
        const error = err as Error;
        console.error("Fetch error:", error);
        setError(error.message);
      }
    };

    fetchProduct();
  }, [id]);

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Đang tải...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ảnh sản phẩm */}
          <div>
            <div className="relative aspect-square bg-gray-100 mb-4">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                style={{ objectFit: "contain" }}
                className="rounded-lg"
                onError={() => setSelectedImage("/placeholder.jpg")}
              />
            </div>
            <div className="flex space-x-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-16 bg-gray-100 rounded ${
                    selectedImage === img ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index}`}
                    fill
                    style={{ objectFit: "contain" }}
                    onError={() => setSelectedImage("/placeholder.jpg")}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-2xl font-semibold text-gray-600">
              {Number(product.price).toLocaleString("vi-VN")} VNĐ
            </p>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-sm text-gray-500">
              Tồn kho: {product.stock > 0 ? product.stock : "Hết hàng"}
            </p>

            {/* Chọn màu sắc */}
            <div>
              <h3 className="text-lg font-semibold">Màu sắc</h3>
              <div className="flex space-x-4 mt-2">
                {product.colors.map((color) => (
                  <label key={color.name} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="color"
                      value={color.name}
                      checked={selectedColor === color.name}
                      onChange={() => setSelectedColor(color.name)}
                      className="hidden"
                    />
                    <span
                      className={`w-8 h-8 rounded-full border ${
                        selectedColor === color.name ? "ring-2 ring-blue-500" : ""
                      }`}
                      style={{ backgroundColor: color.code }}
                    />
                    <span>{color.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chọn số lượng */}
            <div>
              <h3 className="text-lg font-semibold">Số lượng</h3>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={product.stock}
                className="mt-2 w-24 p-2 border rounded"
                disabled={product.stock === 0}
              />
            </div>

            {/* Nút thêm vào giỏ hàng */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-3 rounded-lg text-white font-semibold ${
                product.stock > 0 ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {product.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
            </button>
          </div>
        </div>

        {/* Sản phẩm liên quan */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Sản phẩm liên quan</h2>
          {relatedProducts.length === 0 ? (
            <p className="text-gray-500">Không có sản phẩm liên quan</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/product/${related.id}`}>
                  <div className="border rounded-lg p-4 hover:shadow-lg transition">
                    <div className="relative aspect-square bg-gray-100 mb-2">
                      <Image
                        src={related.images[0] || "/placeholder.jpg"}
                        alt={related.name}
                        fill
                        style={{ objectFit: "contain" }}
                        className="rounded"
                        onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                      />
                    </div>
                    <h3 className="text-lg font-semibold truncate">{related.name}</h3>
                    <p className="text-gray-600">
                      {Number(related.price).toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}