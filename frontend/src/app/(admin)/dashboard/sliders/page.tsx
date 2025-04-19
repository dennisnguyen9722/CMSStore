'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

interface SliderImage {
  image_path: string;
  link: string;
}

interface Slider {
  id: number;
  title: string;
  images: SliderImage[];
}

export default function SlidersPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);

  const [formData, setFormData] = useState<{ title: string }>({ title: '' });
  const [images, setImages] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [oldImages, setOldImages] = useState<SliderImage[]>([]);

  const fetchSliders = async () => {
    try {
      const res = await axios.get<Slider[]>('http://localhost:5000/api/sliders');
      setSliders(res.data);
    } catch (err) {
      console.error('Lỗi lấy slider:', err);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      setLinks(files.map(() => ''));
    }
  };

  const handleLinkChange = (index: number, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = value;
    setLinks(updatedLinks);
  };

  const handleOldImageLinkChange = (index: number, value: string) => {
    const updated = [...oldImages];
    updated[index] = {
      ...updated[index],
      link: value,
    };
    setOldImages(updated);
  };

  const handleRemoveOldImage = (index: number) => {
    const updated = [...oldImages];
    updated.splice(index, 1);
    setOldImages(updated);
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
  
    images.forEach((file, index) => {
      formDataToSend.append('images', file);
      formDataToSend.append('links', links[index] || '');
    });
  
    if (editingSlider) {
      // Lấy danh sách ảnh cũ giữ lại
      const keptImagePaths = oldImages.map((img) => img.image_path);
      formDataToSend.append('keptOldImages', JSON.stringify(keptImagePaths));
    }
  
    try {
      if (editingSlider) {
        await axios.put(
          `http://localhost:5000/api/sliders/${editingSlider.id}`,
          formDataToSend
        );
      } else {
        await axios.post('http://localhost:5000/api/sliders', formDataToSend);
      }
  
      setFormData({ title: '' });
      setImages([]);
      setLinks([]);
      setOldImages([]);
      setEditingSlider(null);
      setModalOpen(false);
      fetchSliders();
    } catch (err) {
      console.error('Lỗi submit slider:', err);
    }
  };  

  const handleDelete = async (id: number) => {
    if (!confirm('Xoá slider này?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/sliders/${id}`);
      fetchSliders();
    } catch (err) {
      console.error('Lỗi xoá slider:', err);
    }
  };

  const columns = useMemo<ColumnDef<Slider>[]>(() => [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Tiêu đề',
      accessorKey: 'title',
    },
    {
      header: 'Hình ảnh',
      cell: ({ row }) => (
        <div className="flex gap-2 overflow-x-auto max-w-[300px]">
          {row.original.images?.map((img, i) => (
            <a
              key={i}
              href={img.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`http://localhost:5000/uploads/sliders/${img.image_path}`}
                className="h-12 w-auto rounded"
                alt={`slider-${row.original.id}-${i}`}
              />
            </a>
          ))}
        </div>
      ),
    },
    {
      header: 'Hành động',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const slider = row.original;
              setEditingSlider(slider);
              setFormData({ title: slider.title });
              setOldImages(slider.images);
              setImages([]);
              setLinks([]);
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
  ], []);

  const table = useReactTable({
    data: sliders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý Slider</h2>
        <Button
          onClick={() => {
            setEditingSlider(null);
            setFormData({ title: '' });
            setImages([]);
            setLinks([]);
            setOldImages([]);
            setModalOpen(true);
          }}
        >
          Thêm slider
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingSlider ? 'Sửa slider' : 'Thêm slider'}
            </DialogTitle>
          </DialogHeader>

          <input
            type="text"
            placeholder="Tên slider"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border rounded p-2 mb-4"
          />

          {oldImages.map((img, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <img
                src={`http://localhost:5000/uploads/sliders/${img.image_path}`}
                className="h-12 w-auto rounded"
              />
              <input
                type="text"
                className="flex-1 border p-2 rounded"
                value={img.link}
                placeholder="Link ảnh cũ"
                onChange={(e) => handleOldImageLinkChange(i, e.target.value)}
              />
              <Button
                variant="destructive"
                onClick={() => handleRemoveOldImage(i)}
              >
                Xoá
              </Button>
            </div>
          ))}

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="mb-4"
          />

          {images.map((img, i) => (
            <div key={i} className="mb-2">
              <span className="text-sm text-gray-600">{img.name}</span>
              <input
                type="text"
                placeholder="Link đến trang đích (tùy chọn)"
                value={links[i] || ''}
                onChange={(e) => handleLinkChange(i, e.target.value)}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
          ))}

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleSubmit}>
              {editingSlider ? 'Lưu' : 'Thêm'}
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