"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ImageIcon,
  Users,
  List,
  Package,
  Newspaper,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // collapse sidebar desktop

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/");
  };

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const menu = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    {
      label: "Quản lý slider",
      href: "/dashboard/sliders",
      icon: <ImageIcon size={20} />,
    },
    {
      label: "Quản lý người dùng",
      href: "/dashboard/users",
      icon: <Users size={20} />,
    },
    {
      label: "Quản lý danh mục",
      href: "/dashboard/categories",
      icon: <List size={20} />,
    },
    {
      label: "Quản lý sản phẩm",
      href: "/dashboard/products",
      icon: <Package size={20} />,
    },
    {
      label: "Quản lý bài viết",
      href: "/dashboard/posts",
      icon: <Newspaper size={20} />,
    },
    {
      label: "Quản lý đơn hàng",
      href: "/dashboard/orders",
      icon: <ShoppingBag size={20} />,
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between transition-all duration-300 ease-in-out">
      {/* Collapse toggle (desktop only) */}
      <div className="flex justify-between items-center mb-6">
        {!isCollapsed && (
          <h1 className="text-2xl font-bold whitespace-nowrap">
            CMS Dashboard
          </h1>
        )}
        <button
          onClick={toggleCollapse}
          className="text-white ml-auto md:block hidden"
        >
          {isCollapsed ? (
            <ChevronsRight size={20} />
          ) : (
            <ChevronsLeft size={20} />
          )}
        </button>
      </div>

      {/* Menu list */}
      <ul className="space-y-2 flex-1">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                  isActive ? "bg-blue-600 text-white" : "hover:bg-gray-800"
                } ${isCollapsed ? "justify-center" : ""}`}
                onClick={() => setIsMobileOpen(false)}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <div className="border-t border-gray-700 pt-4">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Toggle on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobile}
          className="text-white bg-black p-2 rounded-md shadow-md"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar container */}
      <aside
        className={`md:relative bg-black text-white p-4 shadow-md transition-all duration-300 ease-in-out 
        ${isMobileOpen ? "fixed top-0 left-0 z-40 h-screen translate-x-0" : "md:flex"}
        ${isMobileOpen ? "" : "md:translate-x-0 md:static"}
        ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
