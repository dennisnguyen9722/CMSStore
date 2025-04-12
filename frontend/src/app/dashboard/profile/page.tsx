"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng", err);
      }
    };
    fetchUser();
  }, []);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage("❌ Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ Mật khẩu mới không khớp.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      await axios.put(
        "http://localhost:5000/api/users/change-password",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("✅ Mật khẩu đã được thay đổi thành công.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "❌ Đổi mật khẩu thất bại.");
      console.error("Lỗi đổi mật khẩu:", err);
    }
    setIsLoading(false);
  };

  if (!user) return <p className="text-center mt-10">Đang tải thông tin...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user.avatar && (
              <Image
                src={`http://localhost:5000${user.avatar}`}
                alt="Avatar"
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="font-medium">Chức vụ: <span className="capitalize">{user.role}</span></p>
            <p className="text-sm text-muted-foreground">Bạn có thể thay đổi mật khẩu tại đây.</p>
          </div>

          <div className="grid gap-2">
            <Input
              type="password"
              placeholder="Mật khẩu hiện tại"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button onClick={handleChangePassword} disabled={isLoading}>
              {isLoading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            </Button>
            {message && <p className="text-sm text-red-500">{message}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
