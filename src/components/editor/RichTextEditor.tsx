"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import { VariableHighlight } from "./VariableHighlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Link2,
  Unlink,
  Table as TableIcon,
  ImageIcon,
  Minus,
  Undo2,
  Redo2,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Palette,
  Highlighter,
  ChevronDown,
  Plus,
  Trash2,
  TableCellsMerge,
  TableCellsSplit,
  Code,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import ImageUploader from "./ImageUploader";
import logger from "@/utils/logger";

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editorRef?: React.MutableRefObject<any>;
  validVariables?: Set<string>;
};

// Color palette for text and highlight colors
const TEXT_COLORS = [
  { name: "Default", color: "inherit" },
  { name: "Black", color: "#000000" },
  { name: "Dark Gray", color: "#4B5563" },
  { name: "Gray", color: "#9CA3AF" },
  { name: "Red", color: "#EF4444" },
  { name: "Orange", color: "#F97316" },
  { name: "Yellow", color: "#EAB308" },
  { name: "Green", color: "#22C55E" },
  { name: "Blue", color: "#3B82F6" },
  { name: "Purple", color: "#A855F7" },
  { name: "Pink", color: "#EC4899" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", color: "" },
  { name: "Yellow", color: "#FEF08A" },
  { name: "Green", color: "#BBF7D0" },
  { name: "Blue", color: "#BFDBFE" },
  { name: "Pink", color: "#FBCFE8" },
  { name: "Purple", color: "#E9D5FF" },
  { name: "Orange", color: "#FED7AA" },
  { name: "Gray", color: "#E5E7EB" },
];

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  editorRef,
  validVariables = new Set(),
}: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        horizontalRule: false, // Use the separate extension
        hardBreak: false, // Disable hard break to prevent spacebar issues
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start typing...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2 bg-gray-100 font-semibold",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "my-4 border-t border-gray-300",
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "list-none p-0",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
      }),
      Typography.configure({
        openDoubleQuote: false,
        closeDoubleQuote: false,
        openSingleQuote: false,
        closeSingleQuote: false,
        emDash: false,
        ellipsis: false,
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
        const cleanedHtml = html.replace(
          /<span class="variable-(valid|invalid)[^"]*" data-variable="[^"]*">(.*?)<\/span>/g,
          "$2",
        );

        // Match any text between {{ }} (not just namespace.variable format)
        const placeholderRegex = /\{\{\s*([^}]+?)\s*\}\}/g;
        const matches: Array<{ match: string; placeholder: string }> = [];

        // Find all matches
        let match;
        while ((match = placeholderRegex.exec(cleanedHtml)) !== null) {
          const placeholder = match[1].trim();
          // Only process if placeholder is not empty
          if (placeholder) {
            matches.push({
              match: match[0],
              placeholder: placeholder,
            });
          }
        }

        // Allowed namespaces for validation
        const ALLOWED_NAMESPACES = [
          "examiner",
          "contract",
          "org",
          "thrive",
          "fees",
          "custom",
        ];

        // Replace matches in reverse order to preserve positions
        let processedHtml = cleanedHtml;
        matches.reverse().forEach(({ match, placeholder }) => {
          // Check if placeholder is in validVariables set
          const isInValidSet = validVariables.has(placeholder);

          // Validate namespace if placeholder has namespace format (contains a dot)
          let hasValidNamespace = true;
          if (placeholder.includes(".")) {
            const parts = placeholder.split(".");
            const namespace = parts[0];
            hasValidNamespace = ALLOWED_NAMESPACES.includes(namespace);
          }

          // A placeholder is valid only if:
          // 1. It exists in validVariables set, AND
          // 2. If it has a namespace format, the namespace must be allowed
          const isValid = isInValidSet && hasValidNamespace;

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
  const cleanContent = useCallback((html: string): string => {
    return html.replace(
      /<span class="variable-(valid|invalid)[^"]*" data-variable="[^"]*">(.*?)<\/span>/g,
      "$2",
    );
  }, []);

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
      handleDOMEvents: {
        keydown: (view, event) => {
          // Prevent spacebar from creating new line
          if (
            event.key === " " &&
            !event.shiftKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey
          ) {
            // Allow default spacebar behavior (insert space)
            return false;
          }
          return false;
        },
      },
    },
    immediatelyRender: false,
  });

  // Update highlighting when content or validVariables change
  useEffect(() => {
    if (!editor || !isMounted) return;

    const updateHighlighting = () => {
      // Don't update highlighting while user is typing (check if editor has focus)
      if (editor.isFocused) {
        return;
      }

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
              logger.error("Error restoring selection", e);
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
    cleanContent,
  ]);

  // Expose editor to parent via ref
  useEffect(() => {
    if (editorRef && editor) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  // Link handlers
  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setShowLinkInput(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  }, [editor]);

  // Image handler
  const addImage = useCallback(() => {
    setShowImageUploader(true);
  }, []);

  const handleInsertImage = useCallback(
    (url: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: url }).run();
    },
    [editor],
  );

  // Don't render on server to avoid hydration mismatch
  if (!isMounted || !editor) {
    return (
      <div className="rounded-[14px] border border-[#E9EDEE] bg-white overflow-hidden min-h-[500px] flex items-center justify-center">
        <p className="text-gray-500 font-poppins">Loading editor...</p>
      </div>
    );
  }

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-8 w-8 p-0 ${active ? "bg-gray-200" : ""}`}
    >
      {children}
    </Button>
  );

  return (
    <div className="rounded-[14px] border border-[#E9EDEE] bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-[#E9EDEE] p-2 flex flex-wrap gap-1 bg-gray-50">
        {/* Undo/Redo */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Text Style Dropdown */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
              >
                {editor.isActive("heading", { level: 1 })
                  ? "Heading 1"
                  : editor.isActive("heading", { level: 2 })
                    ? "Heading 2"
                    : editor.isActive("heading", { level: 3 })
                      ? "Heading 3"
                      : editor.isActive("heading", { level: 4 })
                        ? "Heading 4"
                        : editor.isActive("heading", { level: 5 })
                          ? "Heading 5"
                          : editor.isActive("heading", { level: 6 })
                            ? "Heading 6"
                            : editor.isActive("blockquote")
                              ? "Quote"
                              : editor.isActive("codeBlock")
                                ? "Code Block"
                                : editor.isActive("code")
                                  ? "Code"
                                  : "Paragraph"}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px]">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={editor.isActive("paragraph") ? "bg-gray-100" : ""}
              >
                <span className="text-sm">Paragraph</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 1 }).run()
                }
                className={
                  editor.isActive("heading", { level: 1 }) ? "bg-gray-100" : ""
                }
              >
                <span className="text-2xl font-bold">Heading 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 2 }).run()
                }
                className={
                  editor.isActive("heading", { level: 2 }) ? "bg-gray-100" : ""
                }
              >
                <span className="text-xl font-bold">Heading 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 3 }).run()
                }
                className={
                  editor.isActive("heading", { level: 3 }) ? "bg-gray-100" : ""
                }
              >
                <span className="text-lg font-bold">Heading 3</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 4 }).run()
                }
                className={
                  editor.isActive("heading", { level: 4 }) ? "bg-gray-100" : ""
                }
              >
                <span className="text-base font-bold">Heading 4</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 5 }).run()
                }
                className={
                  editor.isActive("heading", { level: 5 }) ? "bg-gray-100" : ""
                }
              >
                <span className="text-sm font-bold">Heading 5</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 6 }).run()
                }
                className={
                  editor.isActive("heading", { level: 6 }) ? "bg-gray-100" : ""
                }
              >
                <span className="text-xs font-bold">Heading 6</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive("blockquote") ? "bg-gray-100" : ""}
              >
                <Quote className="mr-2 h-4 w-4" />
                <span>Blockquote</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive("codeBlock") ? "bg-gray-100" : ""}
              >
                <Code className="mr-2 h-4 w-4" />
                <span>Code Block</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={editor.isActive("code") ? "bg-gray-100" : ""}
              >
                <Code className="mr-2 h-4 w-4" />
                <span>Inline Code</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            active={editor.isActive("subscript")}
            title="Subscript"
          >
            <SubscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            active={editor.isActive("superscript")}
            title="Superscript"
          >
            <SuperscriptIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Colors */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          {/* Text Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Text Color"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-4 gap-1">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.color}
                    onClick={() =>
                      c.color === "inherit"
                        ? editor.chain().focus().unsetColor().run()
                        : editor.chain().focus().setColor(c.color).run()
                    }
                    className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      backgroundColor:
                        c.color === "inherit" ? "white" : c.color,
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Highlight Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Highlight Color"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-4 gap-1">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.color || "none"}
                    onClick={() =>
                      c.color === ""
                        ? editor.chain().focus().unsetHighlight().run()
                        : editor
                            .chain()
                            .focus()
                            .toggleHighlight({ color: c.color })
                            .run()
                    }
                    className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.color || "white" }}
                    title={c.name}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Links */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive("link") ? "bg-gray-200" : ""}`}
                title="Add Link"
                onClick={setLink}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2">
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyLink()}
                  className="flex-1"
                />
                <Button size="sm" onClick={applyLink}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {editor.isActive("link") && (
            <ToolbarButton onClick={removeLink} title="Remove Link">
              <Unlink className="h-4 w-4" />
            </ToolbarButton>
          )}
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            active={editor.isActive("taskList")}
            title="Task List"
          >
            <CheckSquare className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Insert Menu */}
        <div className="flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
              >
                Insert
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
              >
                <TableIcon className="mr-2 h-4 w-4" />
                Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={addImage}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Image
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
              >
                <Minus className="mr-2 h-4 w-4" />
                Horizontal Line
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Table controls (only show when in a table) */}
          {editor.isActive("table") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  Table
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Column Before
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Column After
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Column
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Row Before
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Row After
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteRow().run()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Row
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().mergeCells().run()}
                >
                  <TableCellsMerge className="mr-2 h-4 w-4" />
                  Merge Cells
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().splitCell().run()}
                >
                  <TableCellsSplit className="mr-2 h-4 w-4" />
                  Split Cell
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().deleteTable().run()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Table
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[500px] max-h-[800px] overflow-y-auto"
      />

      {/* Image Uploader Dialog */}
      <ImageUploader
        open={showImageUploader}
        onClose={() => setShowImageUploader(false)}
        onInsert={handleInsertImage}
      />

      {/* Editor Styles */}
      <style jsx global>{`
        .ProseMirror table {
          border-collapse: collapse;
          margin: 1rem 0;
          overflow: hidden;
          width: 100%;
        }

        .ProseMirror table td,
        .ProseMirror table th {
          border: 1px solid #d1d5db;
          box-sizing: border-box;
          min-width: 1em;
          padding: 0.5rem;
          position: relative;
          vertical-align: top;
        }

        .ProseMirror table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }

        .ProseMirror table .selectedCell:after {
          background: rgba(59, 130, 246, 0.1);
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }

        .ProseMirror table .column-resize-handle {
          background-color: #3b82f6;
          bottom: 0;
          position: absolute;
          right: -2px;
          top: 0;
          width: 4px;
          pointer-events: none;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: inline-block;
        }

        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }

        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .ProseMirror ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-top: 0.25rem;
          user-select: none;
        }

        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }

        .ProseMirror hr {
          border: none;
          border-top: 1px solid #d1d5db;
          margin: 1rem 0;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
          font-style: italic;
        }

        .ProseMirror pre {
          background: #f3f4f6;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: transparent;
          padding: 0;
          border-radius: 0;
          font-size: 0.875rem;
        }

        .ProseMirror code {
          background: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family:
            ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
            "Liberation Mono", monospace;
        }

        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
        }

        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
        }

        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 1em;
        }

        .ProseMirror h4 {
          font-size: 1em;
          font-weight: bold;
          margin-top: 1.33em;
          margin-bottom: 1.33em;
        }

        .ProseMirror h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin-top: 1.67em;
          margin-bottom: 1.67em;
        }

        .ProseMirror h6 {
          font-size: 0.67em;
          font-weight: bold;
          margin-top: 2.33em;
          margin-bottom: 2.33em;
        }
      `}</style>
    </div>
  );
}
