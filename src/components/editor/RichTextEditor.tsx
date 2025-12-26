"use client";

import { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { VariableHighlight } from "./VariableHighlight";
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
  validVariables?: Set<string>;
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  editorRef,
  validVariables = new Set(),
}: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const extensions = useMemo(
    () => [
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
      VariableHighlight.configure({
        validVariables,
      }),
    ],
    [placeholder, validVariables],
  );

  // Process content to wrap variables with styled spans
  const processContentForHighlighting = useMemo(
    () =>
      (html: string): string => {
        // First, remove any existing variable highlight spans
        let cleanedHtml = html.replace(
          /<span class="variable-(valid|invalid)[^"]*" data-variable="[^"]*">(.*?)<\/span>/g,
          "$2",
        );

        const placeholderRegex =
          /\{\{\s*([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)\s*\}\}/g;
        const matches: Array<{ match: string; placeholder: string }> = [];

        // Find all matches
        let match;
        while ((match = placeholderRegex.exec(cleanedHtml)) !== null) {
          matches.push({
            match: match[0],
            placeholder: match[1].trim(),
          });
        }

        // Replace matches in reverse order to preserve positions
        let processedHtml = cleanedHtml;
        matches.reverse().forEach(({ match, placeholder }) => {
          const isValid = validVariables.has(placeholder);
          const className = isValid
            ? "variable-valid bg-[#E0F7FA] text-[#006064] px-1 py-0.5 rounded font-mono text-sm"
            : "variable-invalid bg-red-100 text-red-700 px-1 py-0.5 rounded font-mono text-sm";
          const replacement = `<span class="${className}" data-variable="${placeholder}" data-is-valid="${isValid}">${match}</span>`;
          processedHtml = processedHtml.replace(match, replacement);
        });

        return processedHtml;
      },
    [validVariables],
  );

  // Clean content before passing to onChange (remove highlight spans)
  const cleanContent = (html: string): string => {
    return html.replace(
      /<span class="variable-(valid|invalid)[^"]*" data-variable="[^"]*">(.*?)<\/span>/g,
      "$2",
    );
  };

  const editor = useEditor({
    extensions,
    content: processContentForHighlighting(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleaned = cleanContent(html);
      onChange(cleaned);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none min-h-[500px] p-4 font-poppins",
      },
    },
    immediatelyRender: false,
  });

  // Update highlighting when content or validVariables change
  useEffect(() => {
    if (!editor || !isMounted) return;

    const updateHighlighting = () => {
      const currentHtml = editor.getHTML();
      const cleaned = cleanContent(currentHtml);
      const highlighted = processContentForHighlighting(cleaned);

      // Only update if highlighting changed
      if (currentHtml !== highlighted) {
        // Save current selection
        const { from, to } = editor.state.selection;
        editor.commands.setContent(highlighted, { emitUpdate: false });
        // Restore selection after a brief delay
        setTimeout(() => {
          if (editor && !editor.isDestroyed) {
            try {
              editor.commands.setTextSelection({ from, to });
            } catch (e) {
              // Selection might be invalid, ignore
            }
          }
        }, 10);
      }
    };

    // Debounce to avoid too many updates
    const timeoutId = setTimeout(updateHighlighting, 200);
    return () => clearTimeout(timeoutId);
  }, [
    editor,
    content,
    validVariables,
    isMounted,
    processContentForHighlighting,
  ]);

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
