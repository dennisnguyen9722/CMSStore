"use client";

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

interface CheckoutData {
  orderId: number;
  cartItems: CartItem[];
  fullName: string;
  address: string;
  phone: string;
  userId: string;
}

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank" | "wallet" | "">("");
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem('checkoutData');
    if (data) {
      const parsedData: CheckoutData = JSON.parse(data);
      setCheckoutData(parsedData);
    } else {
      toast.error("Không tìm thấy thông tin đơn hàng");
      router.push("/cart");
    }
  }, [router]);

  const handlePayment = async () => {
    if (!checkoutData) {
      toast.error("Không có thông tin đơn hàng");
      return;
    }
    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    try {
      const newStatus = paymentMethod === "cash" ? "pending" : "paid";
      const response = await fetch(`http://localhost:5000/api/orders/${checkoutData.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi cập nhật trạng thái đơn hàng");
      }
      toast.success(`Thanh toán thành công! Mã đơn: ${checkoutData.orderId}`);
      localStorage.removeItem('checkoutData'); // Xóa dữ liệu sau khi thanh toán
      window.dispatchEvent(new Event("cartUpdated"));
      router.push("/orders");
    } catch (err) {
      const error = err as Error;
      console.error("Payment error:", error);
      toast.error(error.message || "Lỗi khi thanh toán");
    }
  };

  if (!checkoutData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Đang tải...</p>
        </div>
      </Layout>
    );
  }

  const totalPrice = checkoutData.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        <h1 className="text-3xl font-bold mb-6">Thanh toán đơn hàng #{checkoutData.orderId}</h1>
        {checkoutData.cartItems.length === 0 ? (
          <p>Không có sản phẩm trong đơn hàng</p>
        ) : (
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
              {checkoutData.cartItems.map(item => (
                <div key={item.id} className="flex items-center mb-4">
                  <Image
                    src={item.image.startsWith("http") ? item.image : `http://localhost:5000${item.image}`}
                    alt={item.name}
                    width={60}
                    height={60}
                    style={{ objectFit: "contain" }}
                    className="rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-600">
                      {Number(item.price).toLocaleString("vi-VN")} VNĐ x {item.quantity}
                    </p>
                    <p className="text-gray-600">Màu: {item.color || "Không có"}</p>
                  </div>
                </div>
              ))}
              <h3 className="text-lg font-semibold">
                Tổng cộng: {Number(totalPrice).toLocaleString("vi-VN")} VNĐ
              </h3>
            </div>
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
              <div className="space-y-4">
                <p><strong>Họ và tên:</strong> {checkoutData.fullName}</p>
                <p><strong>Địa chỉ:</strong> {checkoutData.address}</p>
                <p><strong>Số điện thoại:</strong> {checkoutData.phone}</p>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                    className="mr-2"
                  />
                  Tiền mặt (Thanh toán khi nhận hàng)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={() => setPaymentMethod("bank")}
                    className="mr-2"
                  />
                  Chuyển khoản ngân hàng
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={() => setPaymentMethod("wallet")}
                    className="mr-2"
                  />
                  Ví điện tử
                </label>
              </div>
            </div>
            <button
              onClick={handlePayment}
              className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Xác nhận thanh toán
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}