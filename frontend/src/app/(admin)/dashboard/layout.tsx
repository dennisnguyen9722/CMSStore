'use client';

import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import Sidebar from "@/components/Sidebar";
import UserInfo from "@/components/UserInfo";

interface DecodedToken {
  id: number;
  name: string;
  email: string;
  role: string;
  exp: number;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwt_decode<DecodedToken>(token);
        if (decoded.exp > Date.now() / 1000) {
          setIsLoggedIn(true);
        }
      } catch {
        setIsLoggedIn(false);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen">
      {isLoggedIn && <Sidebar />}
      <main className="flex-1 p-6 overflow-y-auto">
        {isLoggedIn && (
          <div className="flex justify-end mb-4">
            <UserInfo />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
