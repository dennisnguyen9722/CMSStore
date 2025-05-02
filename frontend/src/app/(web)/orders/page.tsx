"use client";

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import Image from "next/image";

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  product_price: number;
  image: string;
}

interface Order {
  id: number;
  user_id: string;
  total_price: number;
  address: string;
  phone: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userId = "1"; // TODO: Thay bằng logic lấy user_id thực tế

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${userId}`);
        if (!response.ok) throw new Error("Lỗi khi lấy danh sách đơn hàng");
        const data = await response.json();
        console.log("Orders fetched:", data);
        setOrders(data.orders); // Lấy mảng orders từ response
      } catch (err) {
        const error = err as Error;
        console.error("Fetch orders error:", error);
        setError(error.message);
      }
    };

    fetchOrders();
  }, []);

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
        <h1 className="text-3xl font-bold mb-6">Đơn hàng của bạn</h1>
        {orders.length === 0 ? (
          <p>Chưa có đơn hàng nào</p>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold">Mã đơn: {order.id}</h2>
                <p className="text-gray-600">Địa chỉ: {order.address}</p>
                <p className="text-gray-600">Số điện thoại: {order.phone}</p>
                <p className="text-gray-600">Trạng thái: {order.status}</p>
                <p className="text-gray-600">
                  Ngày đặt: {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </p>
                <p className="text-gray-600">
                  Tổng tiền: {Number(order.total_price).toLocaleString("vi-VN")} VNĐ
                </p>
                <div className="mt-2">
                  <h3 className="font-semibold">Sản phẩm:</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <Image
                          src={item.image ? `http://localhost:5000${item.image}` : "/placeholder.jpg"}
                          alt={item.name}
                          width={50}
                          height={50}
                          objectFit="contain"
                          className="rounded"
                        />
                        <div className="ml-4">
                          <p>{item.name}</p>
                          <p>
                            Số lượng: {item.quantity} x {Number(item.product_price).toLocaleString("vi-VN")} VNĐ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}