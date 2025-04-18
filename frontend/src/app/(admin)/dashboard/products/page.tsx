"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
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
import QuillWrapper from "@/app/(admin)/dashboard/products/QuillWrapper";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  category_id: number;
  images: string[];
  is_featured: number;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    stock: 1,
    description: "",
    category_id: 1,
    images: [] as File[],
    is_featured: false,
  });
  const [keptOldImages, setKeptOldImages] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products");
    setProducts(res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/categories");
    setCategories(res.data);
  };

  const handleAddOrUpdate = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price.toString());
    data.append("stock", formData.stock.toString());
    data.append("description", formData.description);
    data.append("category_id", formData.category_id.toString());
    data.append("is_featured", formData.is_featured ? "1" : "0");

    formData.images.forEach((file) => {
      data.append("images", file);
    });

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
        stock: 1,
        description: "",
        category_id: 1,
        images: [],
        is_featured: false,
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
      setFormData((prev) => ({
        ...prev,
        images: Array.from(e.target.files!),
      }));
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      category_id: product.category_id,
      images: [],
      is_featured: product.is_featured === 1,
    });
    setKeptOldImages(product.images || []);
    setModalOpen(true);
  };

  const removeOldImage = (image: string) => {
    setKeptOldImages((prev) => prev.filter((img) => img !== image));
  };

  const handleToggleFeatured = async (
    productId: number,
    currentStatus: boolean
  ) => {
    try {
      // Chỉ gửi yêu cầu PUT với trường 'is_featured' thay đổi
      await axios.put(
        `http://localhost:5000/api/products/${productId}/featured`,
        {
          is_featured: currentStatus ? 0 : 1,
        }
      );

      // Cập nhật lại danh sách sản phẩm sau khi thay đổi
      fetchProducts();

      // Thông báo cho người dùng
      alert("Trạng thái sản phẩm đã được cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái sản phẩm:", err);
      alert("Có lỗi xảy ra khi cập nhật trạng thái sản phẩm!");
    }
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
              stock: 0,
              description: "",
              category_id: 1,
              images: [],
              is_featured: false,
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
              <TableHead>Tồn kho</TableHead>
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
                <TableCell>{product.stock}</TableCell>
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
                <TableCell>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={product.is_featured === 1}
                      onChange={() =>
                        handleToggleFeatured(
                          product.id,
                          product.is_featured === 1
                        )
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Nổi bật</span>
                  </label>
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
              <label className="block text-sm font-medium mb-1">
                Mô tả sản phẩm
              </label>
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

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Sản phẩm nổi bật</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">
                Tồn kho
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: +e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="Nhập số lượng tồn kho"
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
