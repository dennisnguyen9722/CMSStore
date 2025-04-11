"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getUserRole, isAuthenticated } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
    } else {
      setRole(getUserRole());
      setReady(true);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi fetch users:", err);
    }
  };

  useEffect(() => {
    if (ready) {
      fetchUsers();
    }
  }, [ready]);

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post("http://localhost:5000/api/users", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "staff" });
      fetchUsers();
    } catch (err) {
      console.error("Lỗi thêm người dùng:", err);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `http://localhost:5000/api/users/${editingUser.id}`,
        editingUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi sửa người dùng:", err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    const confirm = window.confirm("Bạn có chắc muốn xoá người dùng này?");
    if (!confirm) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Lỗi xoá người dùng:", err);
    }
  };

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      { header: "ID", accessorKey: "id" },
      { header: "Tên", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      { header: "Quyền", accessorKey: "role" },
      {
        header: "Thao tác",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditingUser(user);
                  setEditModalOpen(true);
                }}
                size="sm"
              >
                Sửa
              </Button>
              <Button
                onClick={() => handleDeleteUser(user.id)}
                variant="destructive"
                size="sm"
              >
                Xoá
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!ready || role === null) return <div>Đang tải...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
        {role === "admin" && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>Thêm người dùng</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm người dùng</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Tên người dùng</label>
                  <Input
                    placeholder="Tên người dùng"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mật khẩu</label>
                  <Input
                    type="password"
                    placeholder="Mật khẩu"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Chức vụ</label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="p-2 border rounded w-full"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button onClick={handleAddUser} className="mt-4 w-full">
                  Thêm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border rounded-md">
        <table className="w-full">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="text-left p-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {role === "admin" && (
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sửa người dùng</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Tên người dùng</label>
                  <Input
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Chức vụ</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                    className="p-2 border rounded w-full"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button onClick={handleUpdateUser} className="mt-4 w-full">
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
