"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
import ResizableImageExtension from "./extension/ResizableImageExtension";
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
import "./EditorContentStyles.css";
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
  FileBoxIcon,
  Hash,
  Printer,
  Square,
  Type,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import logger from "@/utils/logger";
import PageBreakExtension from "./extension/PageBreakExtension";
import TickBoxExtension from "./extension/TickBoxExtension";
import FontSizeExtension from "./extension/FontSizeExtension";
import { CheckboxGroupExtension } from "./extension/CheckboxGroupExtension";
import { EnterKeyFixExtension } from "./extension/EnterKeyFixExtension";
import HeaderFooterModal from "./HeaderFooterModal";
import type { HeaderConfig, FooterConfig } from "./types";
import {
  shouldShowHeader,
  shouldShowFooter,
  processPlaceholders,
} from "./types";
import { FileText } from "lucide-react";

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editorRef?: React.MutableRefObject<any>;
  validVariables?: Set<string>;
  availableVariables?: Array<{ namespace: string; vars: string[] }>;
  variableValues?: Map<string, string>; // Map of variable keys to their default values
  customVariables?: Array<{
    key: string;
    variableType: "text" | "checkbox_group";
    options?: Array<{ label: string; value: string }> | null;
  }>; // Custom variables with their types
  headerConfig?: HeaderConfig;
  footerConfig?: FooterConfig;
  onHeaderChange?: (config: HeaderConfig | undefined) => void;
  onFooterChange?: (config: FooterConfig | undefined) => void;
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

const FONT_SIZES = [
  { label: "8px", value: "8px" },
  { label: "9px", value: "9px" },
  { label: "10px", value: "10px" },
  { label: "11px", value: "11px" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
  { label: "36px", value: "36px" },
  { label: "48px", value: "48px" },
  { label: "72px", value: "72px" },
];

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  editorRef,
  validVariables = new Set(),
  availableVariables = [],
  variableValues = new Map(),
  customVariables = [],
  headerConfig: externalHeaderConfig,
  footerConfig: externalFooterConfig,
  onHeaderChange,
  onFooterChange,
}: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [internalHeaderConfig, setInternalHeaderConfig] = useState<
    HeaderConfig | undefined
  >(externalHeaderConfig);
  const [internalFooterConfig, setInternalFooterConfig] = useState<
    FooterConfig | undefined
  >(externalFooterConfig);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showFooterModal, setShowFooterModal] = useState(false);
  const [showTickBoxInput, setShowTickBoxInput] = useState(false);
  const [tickBoxLabels, setTickBoxLabels] = useState("");

  // Use external configs if provided, otherwise use internal state
  const headerConfig =
    externalHeaderConfig !== undefined
      ? externalHeaderConfig
      : internalHeaderConfig;
  const footerConfig =
    externalFooterConfig !== undefined
      ? externalFooterConfig
      : internalFooterConfig;

  // Sync external configs to internal state
  useEffect(() => {
    if (externalHeaderConfig !== undefined) {
      setInternalHeaderConfig(externalHeaderConfig);
    }
  }, [externalHeaderConfig]);

  useEffect(() => {
    if (externalFooterConfig !== undefined) {
      setInternalFooterConfig(externalFooterConfig);
    }
  }, [externalFooterConfig]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const extensions = useMemo(
    () => [
      // Add EnterKeyFixExtension FIRST with highest priority to ensure it handles Enter
      EnterKeyFixExtension,
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        horizontalRule: false, // Use the separate extension
        hardBreak: {
          HTMLAttributes: {
            class: "hard-break",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "",
          },
        },
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
      ResizableImageExtension.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
      TextStyle,
      FontSizeExtension.configure({
        types: ["textStyle"],
      }),
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
      PageBreakExtension,
      TickBoxExtension,
      CheckboxGroupExtension,
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

          // Get the variable value if available
          const variableValue = variableValues.get(placeholder);
          const displayText = variableValue || match;

          const className = isValid
            ? "variable-valid bg-[#E0F7FA] text-[#006064] px-1 py-0.5 rounded font-mono text-sm underline"
            : "variable-invalid bg-red-100 text-red-700 px-1 py-0.5 rounded font-mono text-sm underline";
          const replacement = `<span class="${className}" data-variable="${placeholder}" data-is-valid="${isValid}" title="${match}">${displayText}</span>`;
          processedHtml = processedHtml.replace(match, replacement);
        });

        return processedHtml;
      },
    [validVariables, variableValues],
  );

  // Clean content before passing to onChange (remove highlight spans and trailing breaks)
  const cleanContent = useCallback((html: string): string => {
    // Replace variable spans with their original placeholder format {{variable.key}}
    // Extract the variable key from data-variable attribute and restore the placeholder
    let cleaned = html.replace(
      /<span class="variable-(valid|invalid)[^"]*" data-variable="([^"]*)"[^>]*>.*?<\/span>/g,
      (match, _validity, variableKey) => {
        return `{{${variableKey}}}`;
      },
    );

    // Remove ProseMirror trailing breaks: <p><br class="ProseMirror-trailingBreak"></p>
    // Also handle cases where there might be whitespace or other content
    cleaned = cleaned.replace(
      /<p[^>]*>\s*<br\s+class="ProseMirror-trailingBreak"[^>]*>\s*<\/p>/gi,
      "",
    );

    // Remove trailing breaks that are standalone (not in empty paragraphs)
    cleaned = cleaned.replace(
      /<br\s+class="ProseMirror-trailingBreak"[^>]*>/gi,
      "",
    );

    return cleaned;
  }, []);

  const editor = useEditor({
    extensions,
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleaned = cleanContent(html);
      onChange(cleaned);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none min-h-[500px] p-4 font-poppins editor-content",
        tabindex: "0", // Ensure editor is focusable
      },
      // Removed handleDOMEvents as it might interfere with keyboard shortcuts
      // Let TipTap's keyboard shortcuts handle Enter key instead
    },
    immediatelyRender: false,
    autofocus: false,
  });

  // Debug: Log when editor is created
  useEffect(() => {
    if (editor) {
      console.log(
        "✅ Editor created, extensions:",
        editor.extensionManager.extensions.map((e) => e.name),
      );
      console.log(
        "✅ EnterKeyFixExtension loaded:",
        editor.extensionManager.extensions.some(
          (e) => e.name === "enterKeyFix",
        ),
      );
    }
  }, [editor]);

  // Debug: Add global keydown listener to check if Enter is being captured
  useEffect(() => {
    if (!isMounted) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        console.log("Global Enter key detected", {
          target: event.target,
          currentTarget: event.currentTarget,
          defaultPrevented: event.defaultPrevented,
        });
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [isMounted]);

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

      // Only update if highlighting changed (and content matches prop to avoid conflicts)
      // We check content match to prevent updating when content prop is being synced
      if (currentHtml !== highlighted && cleaned === content) {
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

  // Sync content prop changes to editor (e.g., when syncing from Google Docs)
  useEffect(() => {
    if (!editor || !isMounted) return;

    // Get current editor content (cleaned)
    const currentHtml = editor.getHTML();
    const currentCleaned = cleanContent(currentHtml);

    // Only update if content prop differs from current editor content
    // This prevents unnecessary updates and infinite loops
    if (currentCleaned !== content) {
      // Don't update if editor is focused (user is typing)
      // This prevents interfering with user input, especially when pressing Enter multiple times
      if (editor.isFocused) {
        return;
      }

      // Set content without emitting update to prevent onChange callback
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor, isMounted, cleanContent]);

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
    imageInputRef.current?.click();
  }, []);

  const handleImageFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid image type. Allowed: JPEG, PNG, GIF, WebP, SVG");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size exceeds 5MB limit");
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          editor.chain().focus().setResizableImage({ src: base64 }).run();
        }
      };
      reader.readAsDataURL(file);

      // Reset input so same file can be selected again
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    },
    [editor],
  );

  // Tick box handler
  const addTickBox = useCallback(() => {
    setTickBoxLabels("");
    setShowTickBoxInput(true);
  }, []);

  const applyTickBox = useCallback(() => {
    if (!editor) return;

    const labels = tickBoxLabels
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (labels.length === 0) {
      toast.error("Please enter at least one label");
      return;
    }

    if (labels.length === 1) {
      // Single tick box
      editor
        .chain()
        .focus()
        .setTickBox({
          label: labels[0],
          tickBoxId: `tick-box-${Date.now()}`,
          checked: false,
        })
        .run();
    } else {
      // Multiple tick boxes in a group
      editor
        .chain()
        .focus()
        .setTickBoxGroup({
          labels,
          group: `tick-group-${Date.now()}`,
        })
        .run();
    }

    setShowTickBoxInput(false);
    setTickBoxLabels("");
  }, [editor, tickBoxLabels]);

  // Header/Footer handlers
  const handleHeaderSave = useCallback(
    (config: HeaderConfig) => {
      if (onHeaderChange) {
        onHeaderChange(config);
      } else {
        setInternalHeaderConfig(config);
      }
    },
    [onHeaderChange],
  );

  const handleFooterSave = useCallback(
    (config: FooterConfig) => {
      if (onFooterChange) {
        onFooterChange(config);
      } else {
        setInternalFooterConfig(config);
      }
    },
    [onFooterChange],
  );

  // Split content into pages (simplified version for print)
  const splitContentIntoPages = useCallback((htmlContent: string): string[] => {
    // First, split by manual page breaks
    const contentParts = htmlContent.split('<div class="page-break"></div>');
    const pages: string[] = [];

    for (const part of contentParts) {
      if (!part.trim()) continue;

      // For print, we'll use a simple approach: split by page breaks
      // In a real implementation, you'd measure content height
      // For now, we'll just add each part as a page
      pages.push(part.trim());
    }

    // If no pages were created, create at least one page
    if (pages.length === 0 && htmlContent.trim()) {
      pages.push(htmlContent.trim());
    }

    return pages;
  }, []);

  // Print handler with header/footer support
  const handlePrint = useCallback(() => {
    if (!editor) return;

    // A4 dimensions constants
    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123;
    const PAGE_MARGIN_HORIZONTAL = 80;
    const PAGE_MARGIN_VERTICAL = 80;
    const CONTENT_WIDTH_PX = A4_WIDTH_PX - PAGE_MARGIN_HORIZONTAL;

    // Clean content before printing (remove variable highlight spans)
    const htmlContent = cleanContent(editor.getHTML());

    // Split content into pages
    const pages = splitContentIntoPages(htmlContent);
    const totalPages = pages.length;

    // Create a print-friendly HTML document
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      console.error("Failed to open print window");
      return;
    }

    // Generate page HTML with headers/footers
    const pageHTMLs = pages
      .map((pageContent, index) => {
        const pageNumber = index + 1;

        // Check if header/footer should be shown
        const showHeader = shouldShowHeader(headerConfig, pageNumber);
        const showFooter = shouldShowFooter(footerConfig, pageNumber);

        // Get heights
        const headerHeight = showHeader ? headerConfig?.height || 40 : 0;
        const footerHeight = showFooter ? footerConfig?.height || 40 : 0;

        // Process header/footer content with placeholders
        const headerContent =
          showHeader && headerConfig
            ? processPlaceholders(headerConfig.content, pageNumber, totalPages)
            : "";
        const footerContent =
          showFooter && footerConfig
            ? processPlaceholders(footerConfig.content, pageNumber, totalPages)
            : "";

        // Calculate content area height
        const contentAreaHeight =
          A4_HEIGHT_PX - headerHeight - footerHeight - PAGE_MARGIN_VERTICAL;

        return `
        <div class="print-page" style="width: ${A4_WIDTH_PX}px; height: ${A4_HEIGHT_PX}px; page-break-after: always; position: relative; margin: 0; padding: 0;">
          ${
            showHeader
              ? `
            <div class="print-header" style="height: ${headerHeight}px; width: 100%; padding: 0 40px; display: flex; align-items: center; position: absolute; top: 0; left: 0;">
              <div class="header-content" style="width: 100%;">${headerContent}</div>
            </div>
          `
              : ""
          }
          <div class="print-content" style="width: ${CONTENT_WIDTH_PX}px; height: ${contentAreaHeight}px; margin: ${headerHeight + 40}px auto ${footerHeight + 40}px; padding: 0; word-wrap: break-word; overflow: hidden;">
            ${pageContent}
          </div>
          ${
            showFooter
              ? `
            <div class="print-footer" style="height: ${footerHeight}px; width: 100%; padding: 0 40px; display: flex; align-items: center; position: absolute; bottom: 0; left: 0;">
              <div class="footer-content" style="width: 100%;">${footerContent}</div>
            </div>
          `
              : ""
          }
        </div>
      `;
      })
      .join("");

    // Create print HTML with A4 page layout
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Print Template</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Poppins', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 0;
              margin: 0;
            }
            
            .print-page {
              width: ${A4_WIDTH_PX}px;
              height: ${A4_HEIGHT_PX}px;
              page-break-after: always;
              position: relative;
              margin: 0;
              padding: 0;
            }
            
            .print-header {
              width: 100%;
              padding: 0 40px;
              display: flex;
              align-items: center;
              position: absolute;
              top: 0;
              left: 0;
            }
            
            .print-header .header-content {
              width: 100%;
            }
            
            .print-footer {
              width: 100%;
              padding: 0 40px;
              display: flex;
              align-items: center;
              position: absolute;
              bottom: 0;
              left: 0;
            }
            
            .print-footer .footer-content {
              width: 100%;
            }
            
            .print-content {
              width: ${CONTENT_WIDTH_PX}px;
              margin: 0 auto;
              padding: 0;
              word-wrap: break-word;
              overflow: hidden;
            }
            
            /* Headings */
            h1 {
              font-size: 2em;
              font-weight: bold;
              margin-top: 0.67em;
              margin-bottom: 0.67em;
              color: #333;
            }
            
            h2 {
              font-size: 1.5em;
              font-weight: bold;
              margin-top: 0.83em;
              margin-bottom: 0.83em;
              color: #333;
            }
            
            h3 {
              font-size: 1.17em;
              font-weight: bold;
              margin-top: 1em;
              margin-bottom: 1em;
              color: #333;
            }
            
            h4 {
              font-size: 1em;
              font-weight: bold;
              margin-top: 1.33em;
              margin-bottom: 1.33em;
              color: #333;
            }
            
            h5 {
              font-size: 0.83em;
              font-weight: bold;
              margin-top: 1.67em;
              margin-bottom: 1.67em;
              color: #333;
            }
            
            h6 {
              font-size: 0.67em;
              font-weight: bold;
              margin-top: 2em;
              margin-bottom: 2em;
              color: #333;
            }
            
            p {
              margin: 1em 0;
            }
            
            /* Lists */
            ul, ol {
              margin: 1em 0;
              padding-left: 2em;
            }
            
            li {
              margin: 0.5em 0;
            }
            
            /* Blockquote */
            blockquote {
              border-left: 4px solid #ddd;
              padding-left: 1em;
              margin: 1em 0;
              color: #666;
              font-style: italic;
            }
            
            /* Code */
            code {
              background-color: #f4f4f4;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 0.9em;
            }
            
            pre {
              background-color: #f4f4f4;
              padding: 1em;
              border-radius: 4px;
              overflow-x: auto;
              margin: 1em 0;
            }
            
            pre code {
              background: none;
              padding: 0;
            }
            
            /* Links */
            a {
              color: #0066cc;
              text-decoration: underline;
            }
            
            /* Images */
            img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 1em auto;
            }
            
            /* Tables */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 1em 0;
              page-break-inside: avoid;
            }
            
            table td, table th {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            table th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            
            table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            /* Horizontal rule */
            hr {
              border: none;
              border-top: 1px solid #ddd;
              margin: 2em 0;
            }
            
            /* Text formatting */
            strong {
              font-weight: bold;
            }
            
            em {
              font-style: italic;
            }
            
            u {
              text-decoration: underline;
            }
            
            s {
              text-decoration: line-through;
            }
            
            mark {
              background-color: #fef08a;
              padding: 2px 4px;
            }
            
            /* Task list */
            ul[data-type="taskList"] {
              list-style: none;
              padding-left: 0;
            }
            
            ul[data-type="taskList"] li {
              display: flex;
              align-items: flex-start;
              margin: 0.5em 0;
            }
            
            ul[data-type="taskList"] li input[type="checkbox"] {
              margin-right: 0.5em;
              margin-top: 0.2em;
            }
            
            /* Page break */
            .page-break {
              page-break-after: always;
              break-after: page;
            }
            
            /* Tick Box */
            .tick-box-container {
              display: inline-flex;
              align-items: center;
              justify-content: flex-start;
              margin: 0 0.5em 0.5em 0;
              vertical-align: middle;
            }
            
            .tick-box {
              width: 20px;
              height: 20px;
              border: 1px solid #000;
              border-radius: 5px;
              background-color: #fff;
              flex-shrink: 0;
            }
            
            .tick-box[data-checked="true"] {
              background-color: #000;
            }
            
            .tick-box[data-checked="false"] {
              background-color: #fff;
            }
            
            .tick-box-label {
              font-size: 16px;
              font-weight: 500;
              color: #000;
              margin-left: 10px;
            }
            
            /* Print-specific styles */
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              .print-page {
                margin: 0;
                padding: 0;
              }
              
              /* Avoid breaking inside these elements */
              h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
                break-after: avoid;
              }
              
              p, li {
                orphans: 3;
                widows: 3;
              }
              
              /* Ensure tables don't break awkwardly */
              table {
                page-break-inside: avoid;
              }
              
              tr {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${pageHTMLs}
          <script>
            window.onload = function() {
              // Wait a bit for styles to apply
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.writeln(printHTML);
    printWindow.document.close();
  }, [editor, cleanContent, headerConfig, footerConfig, splitContentIntoPages]);

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
    <div className="rounded-[14px] border border-[#E9EDEE] bg-white overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-[#E9EDEE] p-2 flex flex-wrap gap-1 bg-gray-50 sticky top-0 z-50 flex-shrink-0 shadow-sm">
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

        {/* Font Size */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                title="Font Size"
              >
                <Type className="h-4 w-4 mr-1" />
                <span className="max-w-[60px] truncate">
                  {(() => {
                    const fontSize = editor.getAttributes("textStyle").fontSize;
                    if (fontSize) {
                      const sizeOption = FONT_SIZES.find(
                        (s) => s.value === fontSize,
                      );
                      return sizeOption ? sizeOption.label : fontSize;
                    }
                    return "Size";
                  })()}
                </span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[120px] max-h-[300px] overflow-y-auto">
              <DropdownMenuItem
                onClick={() => {
                  if (editor.commands.unsetFontSize) {
                    editor.chain().focus().unsetFontSize().run();
                  } else {
                    // Fallback: unset fontSize directly via textStyle mark
                    editor
                      .chain()
                      .focus()
                      .setMark("textStyle", { fontSize: null })
                      .removeEmptyTextStyle()
                      .run();
                  }
                }}
                className={
                  !editor.getAttributes("textStyle").fontSize
                    ? "bg-gray-100"
                    : ""
                }
              >
                <span className="text-sm">Default</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {FONT_SIZES.map((size) => (
                <DropdownMenuItem
                  key={size.value}
                  onClick={() => {
                    if (editor.commands.setFontSize) {
                      editor.chain().focus().setFontSize(size.value).run();
                    } else {
                      // Fallback: set fontSize directly via textStyle mark
                      editor
                        .chain()
                        .focus()
                        .setMark("textStyle", { fontSize: size.value })
                        .run();
                    }
                  }}
                  className={
                    editor.getAttributes("textStyle").fontSize === size.value
                      ? "bg-gray-100"
                      : ""
                  }
                >
                  <span className="text-sm" style={{ fontSize: size.value }}>
                    {size.label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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

        {/* Variables Menu */}
        {availableVariables.length > 0 && (
          <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  title="Insert Variable"
                >
                  <Hash className="h-4 w-4 mr-1" />
                  Variables
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-[400px] overflow-y-auto min-w-[250px]">
                {availableVariables.map((group, groupIndex) => (
                  <div key={group.namespace}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {group.namespace}
                    </div>
                    {group.vars.map((varName) => {
                      const fullVariable = `${group.namespace}.${varName}`;
                      return (
                        <DropdownMenuItem
                          key={fullVariable}
                          onClick={() => {
                            editor
                              .chain()
                              .focus()
                              .insertContent(`{{${fullVariable}}}`)
                              .run();
                          }}
                          className="font-mono text-xs"
                        >
                          {`{{${fullVariable}}}`}
                        </DropdownMenuItem>
                      );
                    })}
                    {groupIndex < availableVariables.length - 1 && (
                      <DropdownMenuSeparator />
                    )}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Checkbox Groups Menu */}
        {customVariables.filter((v) => v.variableType === "checkbox_group")
          .length > 0 && (
          <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  title="Insert Checkbox Group"
                >
                  <Square className="h-4 w-4 mr-1" />
                  Checkboxes
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-[400px] overflow-y-auto min-w-[250px]">
                {customVariables
                  .filter((v) => v.variableType === "checkbox_group")
                  .map((variable) => {
                    const displayKey = variable.key.replace(/^custom\./, "");
                    return (
                      <DropdownMenuItem
                        key={variable.key}
                        onClick={() => {
                          // Insert checkbox group HTML markup
                          // Use Unicode checkbox characters (☐ = unchecked, ☑ = checked) that TipTap will preserve
                          const checkboxHtml = `<div data-variable-type="checkbox_group" data-variable-key="${variable.key}" class="checkbox-group-variable" style="margin: 12px 0;">
  <label class="font-semibold" style="font-weight: 600; display: block; margin-bottom: 8px;">${displayKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:</label>
  <div class="checkbox-options" style="margin-top: 8px;">
    ${
      variable.options
        ?.map(
          (opt) => `
      <div style="margin-bottom: 4px; display: flex; align-items: center;">
        <span class="checkbox-indicator" data-checkbox-value="${opt.value}" data-variable-key="${variable.key}" style="display: inline-block; width: 16px; height: 16px; border: 2px solid #333; margin-right: 8px; vertical-align: middle; flex-shrink: 0;">☐</span>
        <label style="margin: 0; font-weight: normal;">${opt.label}</label>
      </div>
    `,
        )
        .join("") || ""
    }
  </div>
</div>`;
                          editor
                            .chain()
                            .focus()
                            .insertContent(checkboxHtml)
                            .run();
                        }}
                        className="text-xs"
                      >
                        <div>
                          <div className="font-semibold">
                            {displayKey
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                          <div className="text-xs text-gray-500">
                            {variable.options?.length || 0} options
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

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
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setPageBreak().run()}
              >
                <FileBoxIcon className="mr-2 h-4 w-4" />
                Page Break
              </DropdownMenuItem>
              <DropdownMenuItem onClick={addTickBox}>
                <Square className="mr-2 h-4 w-4" />
                Tick Box
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

          {/* Header/Footer Buttons */}
          <div className="flex gap-1 border-l border-gray-200 pl-2 ml-2">
            <ToolbarButton
              onClick={() => setShowHeaderModal(true)}
              title={headerConfig ? "Edit Header" : "Add Header"}
            >
              <FileText className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setShowFooterModal(true)}
              title={footerConfig ? "Edit Footer" : "Add Footer"}
            >
              <FileText className="h-4 w-4 rotate-180" />
            </ToolbarButton>
          </div>

          {/* Print Button */}
          <div className="flex gap-1 border-l border-gray-200 pl-2 ml-2">
            <ToolbarButton onClick={handlePrint} title="Print Template">
              <Printer className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="flex gap-1 border-l border-gray-200 pl-2 ml-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900"
                title="Keyboard Shortcuts"
              >
                <span className="text-xs">💡 Tips</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-900 font-poppins">
                  Keyboard Shortcuts
                </h4>
                <div className="space-y-2 text-xs text-gray-700 font-poppins">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono">
                      Shift
                    </kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono">
                      Enter
                    </kbd>
                    <span className="ml-2">
                      Add a new line within the same paragraph
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono">
                      Enter
                    </kbd>
                    <span className="ml-2">Start a new paragraph</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <EditorContent
          editor={editor}
          className="min-h-[500px] max-h-[77vh] overflow-y-auto flex-1"
          onClick={() => {
            // Ensure editor receives focus when clicking on the editor content
            if (editor && !editor.isDestroyed && !editor.isFocused) {
              editor.commands.focus();
            }
          }}
          onKeyDown={(e) => {
            // Debug: log all keydown events
            if (e.key === "Enter") {
              console.log("EditorContent onKeyDown - Enter pressed", {
                shiftKey: e.shiftKey,
                defaultPrevented: e.defaultPrevented,
                isFocused: editor?.isFocused,
                target: e.target,
              });
            }
          }}
        />
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleImageFileSelect}
        className="hidden"
      />

      {/* Header Modal */}
      <HeaderFooterModal
        open={showHeaderModal}
        onClose={() => setShowHeaderModal(false)}
        onSave={handleHeaderSave}
        type="header"
        initialConfig={headerConfig}
      />

      {/* Footer Modal */}
      <HeaderFooterModal
        open={showFooterModal}
        onClose={() => setShowFooterModal(false)}
        onSave={handleFooterSave}
        type="footer"
        initialConfig={footerConfig}
      />

      {/* Tick Box Input Dialog */}
      <Dialog open={showTickBoxInput} onOpenChange={setShowTickBoxInput}>
        <DialogContent className="w-96">
          <DialogHeader>
            <DialogTitle>Add Tick Box(es)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tick Box Labels (one per line)
              </label>
              <Textarea
                placeholder="Occupational Therapist&#10;Physiotherapist&#10;Chiropractor&#10;Physician"
                value={tickBoxLabels}
                onChange={(e) => setTickBoxLabels(e.target.value)}
                rows={6}
                className="font-sans"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Enter one label per line. Multiple tick boxes will be grouped
                together and only one can be selected at a time.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTickBoxInput(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={applyTickBox}>
                Insert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor-specific styles (ProseMirror wrapper) */}
      <style jsx global>{`
        /* ProseMirror wrapper uses editor-content class for shared styles */
        .ProseMirror.editor-content {
          /* Shared styles are in EditorContentStyles.css */
        }
      `}</style>
    </div>
  );
}
