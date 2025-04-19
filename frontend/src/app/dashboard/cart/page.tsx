"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface CartProduct {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  images: string[];
}

export default function CartPage() {
  const [cart, setCart] = useState<CartProduct[]>([]);
  const userId = 1; // Giả sử userId là 1, bạn có thể thay đổi theo cách quản lý người dùng của mình

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
        setCart(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy giỏ hàng:", err);
      }
    };

    fetchCart();
  }, [userId]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Giỏ hàng của bạn</h2>
      <div className="rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.map((product) => (
              <TableRow key={product.product_id}>
                <TableCell>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <div className="flex gap-2">
                      {product.images.map((image, index) => (
                        <img key={index} src={`http://localhost:5000${image}`} alt={product.name} width={50} />
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.price} VND</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.price * product.quantity} VND</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Button onClick={() => alert('Thanh toán giỏ hàng!')}>Thanh toán</Button>
      </div>
    </div>
  );
}
