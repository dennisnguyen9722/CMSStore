'use client';

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      console.log(res.data);  // Kiểm tra xem có dữ liệu trả về không
      // Đảm bảo rằng response chứa token
      if (res.data && res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);  // Lưu token vào 'accessToken'
        router.push("/dashboard");
      } else {
        alert("Không có token trong phản hồi từ server");
      }
    } catch (err: any) {
      alert("Đăng nhập thất bại");
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-4 p-8 rounded-xl shadow-xl bg-white">
        <h2 className="text-2xl font-bold text-center">Đăng nhập</h2>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button className="w-full" onClick={handleLogin}>
          Đăng nhập
        </Button>
      </div>
    </div>
  );
}
