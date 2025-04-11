"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useQuill } from "react-quilljs";
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
import QuillWrapper from "@/app/dashboard/products/QuillWrapper";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    category_id: 1,
    images: [] as File[],
  });
  const [keptOldImages, setKeptOldImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: () => handleImageInsert(),
        },
      },
    },
    theme: "snow",
  });

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(formData.description || "");
      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        setFormData((prev) => ({ ...prev, description: html }));
      });
    }
  }, [quill]);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products");
    setProducts(res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/categories");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleAddOrUpdate = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price.toString());
    data.append("description", formData.description);
    data.append("category_id", formData.category_id.toString());
    formData.images.forEach((file) => {
      data.append("images", file);
    });

    // thêm danh sách ảnh giữ lại khi update
    if (editingProduct) {
      data.append("keptOldImages", JSON.stringify(keptOldImages));
    }

    try {
      if (editingProduct) {
        await axios.put(
          `http://localhost:5000/api/products/${editingProduct.id}`,
          data
        );
      } else {
        await axios.post("http://localhost:5000/api/products", data);
      }

      setFormData({
        name: "",
        price: 0,
        description: "",
        category_id: 1,
        images: [],
      });
      setKeptOldImages([]);
      setEditingProduct(null);
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Lỗi xử lý sản phẩm:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) return;
    await axios.delete(`http://localhost:5000/api/products/${id}`);
    fetchProducts();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, images: Array.from(e.target.files!) }));
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
        const range = quill.getSelection();
        quill.insertEmbed(range.index, "image", imageUrl);
      } catch (err) {
        console.error("Lỗi upload ảnh mô tả:", err);
      }
    };
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category_id: product.category_id,
      images: [],
    });
    setKeptOldImages(product.images || []);
    setModalOpen(true);
  };

  const removeOldImage = (image: string) => {
    setKeptOldImages((prev) => prev.filter((img) => img !== image));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: "",
              price: 0,
              description: "",
              category_id: 1,
              images: [],
            });
            setKeptOldImages([]);
            setModalOpen(true);
          }}
        >
          Thêm sản phẩm
        </Button>
      </div>

      <div className="rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Ảnh</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.price)}
                </TableCell>
                <TableCell>
                  <div
                    className="line-clamp-2 text-sm text-gray-700"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </TableCell>
                <TableCell>
                  {product.images?.length > 0 ? (
                    <img
                      src={`http://localhost:5000${product.images[0]}`}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">Chưa có ảnh</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(product)}>Sửa</Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      Xoá
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tên sản phẩm
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Giá sản phẩm
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: +e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Nhập giá sản phẩm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mô tả sản phẩm</label>
              <QuillWrapper
                value={formData.description}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, description: html }))
                }
                onImageUpload={handleImageInsert}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Danh mục</label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: +e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ảnh sản phẩm
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {editingProduct && keptOldImages.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Ảnh cũ:</p>
                <div className="flex flex-wrap gap-2">
                  {keptOldImages.map((img) => (
                    <div key={img} className="relative">
                      <img
                        src={`http://localhost:5000${img}`}
                        alt="old"
                        className="w-20 h-20 object-cover border rounded"
                      />
                      <button
                        onClick={() => removeOldImage(img)}
                        className="absolute top-0 right-0 text-white bg-red-500 rounded-full w-5 h-5 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button onClick={handleAddOrUpdate}>
                {editingProduct ? "Lưu" : "Thêm"}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
