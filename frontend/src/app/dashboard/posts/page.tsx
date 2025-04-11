"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/ui/data-table";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import Toolbar from "@/components/custom/editor-toolbar";

interface Post {
  id: number;
  title: string;
  seo_description: string;
  seo_keywords: string;
  content: string;
  thumbnail: string;
}

export default function PostsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { register, handleSubmit, setValue, reset, watch } = useForm();

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Heading.configure({ levels: [1, 2, 3] }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setValue("content", editor.getHTML());
    },
  });

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts`
      );
      return res.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (editingPost) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${editingPost.id}`,
          formData
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts`,
          formData
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setOpen(false);
      setEditingPost(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("seo_description", data.seo_description);
    formData.append("seo_keywords", data.seo_keywords);
    formData.append("content", data.content);
    if (data.thumbnail[0]) formData.append("thumbnail", data.thumbnail[0]);
    if (editingPost)
      formData.append("oldImagePath", editingPost.thumbnail || "");
    mutation.mutate(formData);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setValue("title", post.title);
    setValue("seo_description", post.seo_description);
    setValue("seo_keywords", post.seo_keywords);
    setValue("content", post.content);
    setOpen(true);
    editor?.commands.setContent(post.content || "");
  };

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        formData
      );
      const url = res.data.url;
      editor?.commands.setImage({ src: url });
    };
    input.click();
  };

  const columns: ColumnDef<Post>[] = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Tiêu đề",
      accessorKey: "title",
    },
    {
      header: "Thumbnail",
      cell: ({ row }) =>
        row.original.thumbnail ? (
          <Image
            src={`http://localhost:5000${row.original.thumbnail}`}
            alt="thumb"
            width={100}
            height={60}
          />
        ) : (
          <span>Không có</span>
        ),
    },
    {
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button onClick={() => handleEdit(row.original)}>Sửa</Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate(row.original.id)}
          >
            Xoá
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
        <Button
          onClick={() => {
            reset();
            setEditingPost(null);
            editor?.commands.clearContent();
            setOpen(true);
          }}
        >
          Thêm bài viết
        </Button>
      </div>

      <DataTable columns={columns} data={posts} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Sửa bài viết" : "Thêm bài viết"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tiêu đề</label>
                <Input {...register("title")} placeholder="Tiêu đề" required />
              </div>

              <div>
                <label className="text-sm font-medium">Mô tả SEO</label>
                <Textarea
                  {...register("seo_description")}
                  placeholder="Mô tả SEO"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Từ khoá SEO</label>
                <Input
                  {...register("seo_keywords")}
                  placeholder="Từ khoá SEO"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Ảnh đại diện</label>
                <Input type="file" {...register("thumbnail")} />
              </div>

              <div className="border rounded p-2 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Nội dung</label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImageUpload}
                  >
                    Chèn ảnh
                  </Button>
                </div>
                {editor && <Toolbar editor={editor} />}
                <EditorContent
                  editor={editor}
                  className="min-h-[200px] border rounded p-2"
                />
              </div>

              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
