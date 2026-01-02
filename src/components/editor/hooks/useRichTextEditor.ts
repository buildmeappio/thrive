import { useMemo } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import ResizableImageExtension from "../extension/ResizableImageExtension";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import { VariableNodeExtension } from "../extension/VariableNodeExtension";
import PageBreakExtension from "../extension/PageBreakExtension";
import TickBoxExtension from "../extension/TickBoxExtension";
import FontSizeExtension from "../extension/FontSizeExtension";
import { CheckboxGroupExtension } from "../extension/CheckboxGroupExtension";
import { EnterKeyFixExtension } from "../extension/EnterKeyFixExtension";

/**
 * Hook for setting up the TipTap editor
 * Handles editor initialization, extensions, and content synchronization
 */
export function useRichTextEditor(
  content: string,
  onChange: (html: string) => void,
  placeholder?: string,
  validVariables?: Set<string>,
  cleanContent: (html: string) => string = (html) => html,
) {
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
      VariableNodeExtension.configure({
        validVariables: validVariables || new Set<string>(),
      }),
    ],
    [placeholder, validVariables],
  );

  const editor = useEditor({
    extensions,
    content: content,
    onUpdate: ({ editor }) => {
      // Simple: just clean content and emit
      // Variable spans are non-editable (contenteditable="false"), so no fixing needed
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
    },
    immediatelyRender: false,
    autofocus: false,
  });

  // Expose editor to parent via ref
  const setEditorRef = (editorRef?: React.MutableRefObject<any>) => {
    if (editorRef && editor) {
      editorRef.current = editor;
    }
  };

  return {
    editor,
    setEditorRef,
  };
}
