"use client";

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  color: string;
  image: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const userId = "1"; // TODO: Thay bằng logic lấy user_id thực tế

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/cart/${userId}`);
        if (!response.ok) throw new Error("Lỗi khi lấy giỏ hàng");
        const data: CartItem[] = await response.json();
        console.log("Cart fetched:", data);
        data.forEach(item => console.log(`Image URL for ${item.name}: ${item.image}`));
        setCartItems(data);
      } catch (err) {
        const error = err as Error;
        console.error("Fetch cart error:", error);
        setError(error.message);
      }
    };

    fetchCart();
  }, []);

  const getImageUrl = (image: string) => {
    if (!image) return "/placeholder.jpg";
    return image.startsWith("http") ? image : `http://localhost:5000${image}`;
  };

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi cập nhật số lượng");
      }
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Cập nhật số lượng thành công!");
    } catch (err) {
      const error = err as Error;
      console.error("Update quantity error:", error);
      toast.error(error.message || "Lỗi khi cập nhật số lượng");
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi xóa sản phẩm");
      }
      setCartItems(cartItems.filter(item => item.id !== itemId));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Xóa sản phẩm thành công!");
    } catch (err) {
      const error = err as Error;
      console.error("Remove item error:", error);
      toast.error(error.message || "Lỗi khi xóa sản phẩm");
    }
  };

  const handleCancelItem = async (item: CartItem) => {
    if (!fullName || !address || !phone) {
      toast.error("Vui lòng nhập họ tên, địa chỉ và số điện thoại trước khi hủy");
      return;
    }

    const orderData = {
      user_id: userId,
      full_name: fullName,
      address,
      phone,
      items: [{ product_id: item.product_id, quantity: item.quantity }],
      status: 'cancelled',
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi hủy sản phẩm");
      }
      await handleRemoveItem(item.id);
      toast.success(`Hủy sản phẩm ${item.name} thành công!`);
    } catch (err) {
      const error = err as Error;
      console.error("Cancel item error:", error);
      toast.error(error.message || "Lỗi khi hủy sản phẩm");
    }
  };

  const handleProceedToCheckout = () => {
    if (!fullName || !address || !phone) {
      toast.error("Vui lòng nhập họ tên, địa chỉ và số điện thoại");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    localStorage.setItem('checkoutData', JSON.stringify({
      cartItems,
      fullName,
      address,
      phone,
      userId,
    }));
    router.push("/checkout");
  };

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>
        {cartItems.length === 0 ? (
          <p>Giỏ hàng trống</p>
        ) : (
          <div className="space-y-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center border rounded-lg p-4">
                <Image
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  width={80}
                  height={80}
                  style={{ objectFit: "contain" }}
                  className="rounded"
                  onError={() => console.log(`Failed to load image: ${item.image}`)}
                />
                <div className="ml-4 flex-1">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">{Number(item.price).toLocaleString("vi-VN")} VNĐ</p>
                  <p className="text-gray-600">Màu: {item.color || "Không có"}</p>
                  <div className="flex items-center mt-2">
                    <label className="mr-2">Số lượng:</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      min="1"
                      className="w-16 p-1 border rounded"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => handleCancelItem(item)}
                    className="text-orange-500 hover:text-orange-700"
                  >
                    Hủy sản phẩm
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold">
                Tổng cộng: {Number(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)).toLocaleString("vi-VN")} VNĐ
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block font-semibold">Họ và tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label className="block font-semibold">Địa chỉ</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Nhập địa chỉ giao hàng"
                  />
                </div>
                <div>
                  <label className="block font-semibold">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Tiến hành thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}