"use client";

import { useState, useEffect } from "react";
import { Menu } from "@headlessui/react";  // Menu của Headless UI
import { HiOutlineUser, HiLogout } from "react-icons/hi"; // Icon tài khoản và đăng xuất
import axios from "axios";

interface CurrentUser {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function UserInfo() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy user", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Hiển thị avatar và tên người dùng */}
      {user.avatar && (
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 cursor-pointer">
            <img
              src={`http://localhost:5000${user.avatar}`}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
            <span>{user.name}</span>
          </Menu.Button>

          {/* Dropdown menu */}
          <Menu.Items className="absolute bg-white shadow-md rounded-md mt-2 w-48 right-0 z-20">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/dashboard/profile"
                  className={`${
                    active ? 'bg-gray-200' : ''
                  } flex items-center gap-2 p-2`}
                >
                  <HiOutlineUser className="w-5 h-5" /> Thông tin cá nhân
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-gray-200' : ''
                  } flex items-center gap-2 p-2`}
                >
                  <HiLogout className="w-5 h-5" /> Đăng xuất
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )}
    </div>
  );
}
