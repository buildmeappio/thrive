"use client";

import { useEffect } from "react";
import { EditorContent } from "@tiptap/react";
import "./EditorContentStyles.css";
import { useRichTextEditor } from "./hooks/useRichTextEditor";
import { useContentProcessing } from "./hooks/useContentProcessing";
import { useLinkHandlers } from "./hooks/useLinkHandlers";
import { useImageHandlers } from "./hooks/useImageHandlers";
import { useTickBoxHandlers } from "./hooks/useTickBoxHandlers";
import { useHeaderFooter } from "./hooks/useHeaderFooter";
import { usePrint } from "./hooks/usePrint";
import { Toolbar } from "./toolbar/Toolbar";
import { TickBoxDialog } from "./TickBoxDialog";
import HeaderFooterModal from "./HeaderFooterModal";
import type { HeaderConfig, FooterConfig } from "./types";

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editorRef?: React.MutableRefObject<any>;
  validVariables?: Set<string>;
  availableVariables?: Array<{ namespace: string; vars: string[] }>;
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

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
  editorRef,
  validVariables = new Set(),
  availableVariables = [],
  customVariables = [],
  headerConfig: externalHeaderConfig,
  footerConfig: externalFooterConfig,
  onHeaderChange,
  onFooterChange,
}: Props) {
  // Content processing hooks
  const { cleanContent } = useContentProcessing();

  // Main editor hook
  const { editor, setEditorRef } = useRichTextEditor(
    content,
    onChange,
    placeholder,
    validVariables,
    cleanContent,
  );

  // Expose editor to parent via ref
  useEffect(() => {
    setEditorRef(editorRef);
  }, [editorRef, setEditorRef]);

  // Feature-specific hooks
  const linkHandlers = useLinkHandlers(editor);
  const imageHandlers = useImageHandlers(editor);
  const tickBoxHandlers = useTickBoxHandlers(editor);
  const headerFooterHandlers = useHeaderFooter(
    externalHeaderConfig,
    externalFooterConfig,
    onHeaderChange,
    onFooterChange,
  );
  const { handlePrint } = usePrint(
    editor,
    cleanContent,
    headerFooterHandlers.headerConfig,
    headerFooterHandlers.footerConfig,
  );

  // Don't render on server to avoid hydration mismatch
  if (!editor) {
    return (
      <div className="rounded-[14px] border border-[#E9EDEE] bg-white overflow-hidden min-h-[500px] flex items-center justify-center">
        <p className="text-gray-500 font-poppins">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[#E9EDEE] bg-white overflow-hidden flex flex-col">
      {/* Toolbar */}
      <Toolbar
        editor={editor}
        linkHandlers={linkHandlers}
        headerFooterHandlers={headerFooterHandlers}
        headerConfig={headerFooterHandlers.headerConfig}
        footerConfig={headerFooterHandlers.footerConfig}
        availableVariables={availableVariables}
        customVariables={customVariables}
        onAddImage={imageHandlers.addImage}
        onAddTickBox={tickBoxHandlers.addTickBox}
        onPrint={handlePrint}
      />

      {/* Editor Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <EditorContent
          editor={editor}
          className="min-h-[500px] max-h-[77vh] overflow-y-auto flex-1"
          onClick={() => {
            if (editor && !editor.isDestroyed && !editor.isFocused) {
              editor.commands.focus();
            }
          }}
        />
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={imageHandlers.imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={imageHandlers.handleImageFileSelect}
        className="hidden"
      />

      {/* Header Modal */}
      <HeaderFooterModal
        open={headerFooterHandlers.showHeaderModal}
        onClose={() => headerFooterHandlers.setShowHeaderModal(false)}
        onSave={headerFooterHandlers.handleHeaderSave}
        type="header"
        initialConfig={headerFooterHandlers.headerConfig}
      />

      {/* Footer Modal */}
      <HeaderFooterModal
        open={headerFooterHandlers.showFooterModal}
        onClose={() => headerFooterHandlers.setShowFooterModal(false)}
        onSave={headerFooterHandlers.handleFooterSave}
        type="footer"
        initialConfig={headerFooterHandlers.footerConfig}
      />

      {/* Tick Box Input Dialog */}
      <TickBoxDialog
        open={tickBoxHandlers.showTickBoxInput}
        onOpenChange={tickBoxHandlers.setShowTickBoxInput}
        tickBoxLabels={tickBoxHandlers.tickBoxLabels}
        setTickBoxLabels={tickBoxHandlers.setTickBoxLabels}
        onApply={tickBoxHandlers.applyTickBox}
      />

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
