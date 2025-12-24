"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editorRef?: React.MutableRefObject<any>;
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  editorRef,
}: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start typing...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none min-h-[500px] p-4 font-poppins",
      },
    },
    immediatelyRender: false,
  });

  // Expose editor to parent via ref
  useEffect(() => {
    if (editorRef && editor) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  // Don't render on server to avoid hydration mismatch
  if (!isMounted || !editor) {
    return (
      <div className="rounded-[14px] border border-[#E9EDEE] bg-white overflow-hidden min-h-[500px] flex items-center justify-center">
        <p className="text-gray-500 font-poppins">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[#E9EDEE] bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-[#E9EDEE] p-2 flex flex-wrap gap-1 bg-gray-50">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`h-8 w-8 p-0 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`h-8 w-8 p-0 ${editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""}`}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`h-8 w-8 p-0 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}`}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`h-8 w-8 p-0 ${editor.isActive("heading", { level: 3 }) ? "bg-gray-200" : ""}`}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}`}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}`}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}`}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[500px] max-h-[800px] overflow-y-auto"
      />
    </div>
  );
}
