"use client";
import { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "react-quill/dist/quill.snow.css";

export default function QuillWrapper({
  value,
  onChange,
  onImageUpload,
}: {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: () => void;
}) {
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
          image: () => onImageUpload?.(),
        },
      },
    },
    theme: "snow",
  });

  useEffect(() => {
    if (quill && value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }
  }, [quill]);

  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        onChange(quill.root.innerHTML);
      });
    }
  }, [quill]);

  return (
    <div
      ref={quillRef}
      className="h-40 border rounded bg-white overflow-y-auto"
    />
  );
}
