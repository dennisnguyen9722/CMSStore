"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"; // Import thêm Column, Row từ react-table
import QuillWrapper from "@/app/(admin)/dashboard/products/QuillWrapper"; // Đảm bảo đường dẫn đúng

export default function PostsPage() {
  const [open, setOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    seo_description: "",
    seo_keywords: "",
    content: "",
    thumbnail: "",
  });
  const [posts, setPosts] = useState<any[]>([]);

  const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

  // Fetch danh sách bài viết từ API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/posts");
        setPosts(response.data);
      } catch (err) {
        console.error("Lỗi khi lấy bài viết:", err);
      }
    };
    fetchPosts();
  }, []);

  const handleAddOrUpdate = async () => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("seo_description", formData.seo_description);
    data.append("seo_keywords", formData.seo_keywords);
    data.append("content", formData.content);
    data.append("thumbnail", formData.thumbnail);

    try {
      if (editingPost) {
        await axios.put(
          `http://localhost:5000/api/posts/${editingPost.id}`,
          data
        );
      } else {
        await axios.post("http://localhost:5000/api/posts", data);
      }
      setFormData({
        title: "",
        seo_description: "",
        seo_keywords: "",
        content: "",
        thumbnail: "",
      });
      setEditingPost(null);
      setOpen(false);
      // Cập nhật lại danh sách bài viết
      const response = await axios.get("http://localhost:5000/api/posts");
      setPosts(response.data);
    } catch (err) {
      console.error("Lỗi xử lý bài viết:", err);
    }
  };

  const handleImageInsert = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await axios.post(
          "http://localhost:5000/api/uploads/description-image",
          formData
        );
        const imageUrl = res.data.url;
        const quill = (
          document.querySelector(".ql-editor")?.parentElement as any
        )?.__quill;
        const range = quill?.getSelection();
        if (range) {
          quill?.insertEmbed(range.index, "image", imageUrl);
        }
      } catch (err) {
        console.error("Lỗi upload ảnh mô tả:", err);
      }
    };
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      seo_description: post.seo_description,
      seo_keywords: post.seo_keywords,
      content: post.content,
      thumbnail: post.thumbnail,
    });
    setOpen(true);
  };

  const handleDelete = async (postId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`);
      // Cập nhật lại danh sách bài viết sau khi xóa
      const response = await axios.get("http://localhost:5000/api/posts");
      setPosts(response.data);
    } catch (err) {
      console.error("Lỗi xóa bài viết:", err);
    }
  };

  // Cấu hình bảng với react-table
  // columns định nghĩa theo ColumnDef<any>
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Tiêu đề",
    },
    {
      accessorKey: "seo_description",
      header: "Mô tả SEO",
    },
    {
      accessorKey: "seo_keywords",
      header: "Từ khoá SEO",
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button onClick={() => handleEdit(row.original)}>Sửa</Button>
          <Button onClick={() => handleDelete(row.original.id)}>Xóa</Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý bài viết</h2>
        <Button
          onClick={() => {
            setEditingPost(null);
            setFormData({
              title: "",
              seo_description: "",
              seo_keywords: "",
              content: "",
              thumbnail: "",
            });
            setOpen(true);
          }}
        >
          Thêm bài viết
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Sửa bài viết" : "Thêm bài viết"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full"
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mô tả SEO
              </label>
              <Textarea
                value={formData.seo_description}
                onChange={(e) =>
                  setFormData({ ...formData, seo_description: e.target.value })
                }
                className="w-full"
                placeholder="Nhập mô tả SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Từ khoá SEO
              </label>
              <Textarea
                value={formData.seo_keywords}
                onChange={(e) =>
                  setFormData({ ...formData, seo_keywords: e.target.value })
                }
                className="w-full"
                placeholder="Nhập từ khoá SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nội dung</label>
              <QuillWrapper
                value={formData.content}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, content: html }))
                }
                onImageUpload={handleImageInsert}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ảnh đại diện
              </label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files) {
                    setFormData({
                      ...formData,
                      thumbnail: URL.createObjectURL(e.target.files[0]),
                    });
                  }
                }}
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={handleAddOrUpdate}>
                {editingPost ? "Lưu" : "Thêm"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
