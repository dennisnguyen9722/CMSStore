"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
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

import axios from "axios";
import { useEffect, useMemo, useState } from "react";

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      const res = await axios.get<Category[]>(
        "http://localhost:5000/api/categories"
      );
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await axios.put(
          `http://localhost:5000/api/categories/${editingCategory.id}`,
          formData
        );
      } else {
        await axios.post("http://localhost:5000/api/categories", formData);
      }

      setFormData({ name: "", description: "" });
      setEditingCategory(null);
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Lỗi xử lý danh mục:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xoá danh mục này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error("Lỗi xoá danh mục:", err);
    }
  };

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
      },
      {
        header: "Tên",
        accessorKey: "name",
      },
      {
        header: "Mô tả",
        accessorKey: "description",
      },
      {
        header: "Hành động",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const category = row.original;
                setEditingCategory(category);
                setFormData({
                  name: category.name,
                  description: category.description,
                });
                setModalOpen(true);
              }}
            >
              Sửa
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              Xoá
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý Danh mục</h2>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: "", description: "" });
            setModalOpen(true);
          }}
        >
          Thêm danh mục
        </Button>
      </div>

      <div className="rounded border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tên danh mục
              </label>
              <input
                type="text"
                placeholder="Tên danh mục"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border rounded p-2 mb-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Mô tả danh mục
              </label>
              <textarea
                placeholder="Mô tả"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border rounded p-2 mb-4"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleSubmit}>
              {editingCategory ? "Lưu" : "Thêm"}
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
