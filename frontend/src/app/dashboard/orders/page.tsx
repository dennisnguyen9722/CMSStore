"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "react-toastify"; // Import react-toastify

// Định nghĩa kiểu dữ liệu
interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  user_id: string;
  total_price: number;
  address: string;
  phone: string;
  status: "pending" | "paid" | "cancelled" | "shipped";
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 10; // Số đơn hàng mỗi trang

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders", {
        params: {
          page: currentPage,
          pageSize: pageSize,
        },
      });
      setOrders(res.data.orders); // Giả sử API trả về { orders: [...], totalPages: n }
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Lỗi khi fetch đơn hàng:", err);
    }
  };

  // Lọc đơn hàng theo trạng thái
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  });

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  // Cập nhật trạng thái trong modal
  const handleStatusUpdate = async (
    orderId: number,
    newStatus: "pending" | "paid" | "cancelled" | "shipped"
  ) => {
    try {
      // Cập nhật trạng thái đơn hàng
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        status: newStatus,
      });

      // Hiển thị thông báo thành công
      toast.success("Cập nhật trạng thái thành công");

      // Tải lại danh sách đơn hàng
      await fetchOrders();

      // Cập nhật thông tin đơn hàng trong modal
      const updated = orders.find((o) => o.id === orderId);
      if (updated) {
        setSelectedOrder({ ...updated, status: newStatus });
      }

      // Đóng modal sau khi cập nhật trạng thái thành công
      setSelectedOrder(null); // Đóng modal
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái trong modal:", err);
      toast.error("Không thể cập nhật trạng thái.");
    }
  };

  function getNextStatuses(currentStatus: string): string[] {
    switch (currentStatus) {
      case "pending":
        return ["paid", "cancelled"];
      case "paid":
        return ["shipped"];
      default:
        return []; // Không cho chuyển trạng thái nữa
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách đơn hàng</h2>
      <div className="mb-4">
        <Select onValueChange={setStatusFilter} value={statusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ thanh toán</SelectItem>
            <SelectItem value="paid">Đã thanh toán</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
            <SelectItem value="shipped">
              Đã gửi cho đơn vị vận chuyển
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded border mb-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Điện thoại</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order, index) => (
              <TableRow key={order.id}>
                <TableCell>
                  {(currentPage - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell>{order.user_id}</TableCell>
                <TableCell>{order.address}</TableCell>
                <TableCell>{order.phone}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.total_price)}
                </TableCell>
                <TableCell>
                  <span
                    className={`${
                      order.status === "pending"
                        ? "bg-yellow-400 text-black"
                        : order.status === "paid"
                        ? "bg-green-500 text-white"
                        : order.status === "cancelled"
                        ? "bg-red-500 text-white"
                        : order.status === "shipped"
                        ? "bg-blue-500 text-white"
                        : ""
                    } px-2 py-1 rounded`}
                  >
                    {order.status === "pending"
                      ? "Chờ thanh toán"
                      : order.status === "paid"
                      ? "Đã thanh toán"
                      : order.status === "cancelled"
                      ? "Đã hủy"
                      : order.status === "shipped"
                      ? "Đã gửi cho đơn vị vận chuyển"
                      : ""}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleString("vi-VN")}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Xem chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center items-center mt-4 space-x-2">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Trang trước
        </Button>
        <span>
          Trang {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Trang sau
        </Button>
      </div>
      {selectedOrder && (
        <Dialog open={true} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn hàng #{selectedOrder.id}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
              <p>
                <strong>Khách hàng:</strong> {selectedOrder.user_id}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {selectedOrder.address}
              </p>
              <p>
                <strong>Điện thoại:</strong> {selectedOrder.phone}
              </p>
              <p>
                <strong>Giá trị:</strong>{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(selectedOrder.total_price)}
              </p>
              <div className="flex items-center gap-4">
                <p>
                  <strong>Trạng thái đơn hàng:</strong>
                </p>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(status) =>
                    handleStatusUpdate(selectedOrder.id, status as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedOrder.status} />
                  </SelectTrigger>
                  <SelectContent>
                    {getNextStatuses(selectedOrder.status).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "pending"
                          ? "Chờ thanh toán"
                          : status === "paid"
                          ? "Đã thanh toán"
                          : status === "shipped"
                          ? "Đã gửi cho đơn vị vận chuyển"
                          : "Đã hủy"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
