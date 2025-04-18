"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Image from "next/image";

// ================= TYPES =================

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: string;
  avatar: File | null;
};

// =============== COMPONENT ===============

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "staff",
    avatar: null,
  });
  const [isAdmin, setIsAdmin] = useState(false); // trạng thái quyền admin

  // Kiểm tra quyền admin khi người dùng đăng nhập
  useEffect(() => {
    const checkAdminRole = () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // giải mã token
        if (decodedToken.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    };
    checkAdminRole();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi fetch users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, avatar: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    const token = localStorage.getItem("accessToken");
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        if (key === "avatar" && value instanceof File) {
          data.append("avatar", value);
        } else {
          data.append(key, value as string);
        }
      }
    });

    try {
      if (editingUser) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${editingUser.id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      fetchUsers();
      setModalOpen(false);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "staff",
        avatar: null,
      });
    } catch (error) {
      console.error("Lỗi submit user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      avatar: null,
    });
    setModalOpen(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditingUser(null);
              setFormData({
                name: "",
                email: "",
                password: "",
                role: "staff",
                avatar: null,
              });
              setModalOpen(true);
            }}
          >
            Thêm người dùng
          </Button>
        )}
      </div>

      <div className="rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.avatar && (
                    <Image
                      src={`http://localhost:5000${user.avatar}`}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {isAdmin && (
                    <Button size="sm" onClick={() => handleEdit(user)}>
                      Sửa
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl" aria-labelledby="dialog-title" aria-describedby="dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Sửa người dùng" : "Thêm người dùng"}
            </DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Tên người dùng"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="mb-2"
          />
          <Input
            type="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="mb-2"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <Input type="file" onChange={handleFileChange} className="mb-4" />

          <div className="flex justify-end gap-2">
            <Button onClick={handleSubmit}>
              {editingUser ? "Lưu" : "Thêm"}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

