"use client";

import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/editor/RichTextEditor";
import type {
  HeaderConfig,
  FooterConfig,
  VariableGroup,
  CustomVariable,
  EditorRef,
} from "./types";

type EditorSectionProps = {
  content: string;
  onContentChange: (content: string) => void;
  placeholderCount: number;
  editorRef: EditorRef;
  validVariablesSet: Set<string>;
  availableVariables: VariableGroup[];
  variableValuesMap: Map<string, string>;
  customVariables: CustomVariable[];
  headerConfig: HeaderConfig | undefined;
  footerConfig: FooterConfig | undefined;
  onHeaderChange: (config: HeaderConfig | undefined) => void;
  onFooterChange: (config: FooterConfig | undefined) => void;
};

export function EditorSection({
  content,
  onContentChange,
  placeholderCount,
  editorRef,
  validVariablesSet,
  availableVariables,
  variableValuesMap,
  customVariables,
  headerConfig,
  footerConfig,
  onHeaderChange,
  onFooterChange,
}: EditorSectionProps) {
  return (
    <div className="flex flex-col max-h-[100vh] min-h-[500px] lg:min-h-0">
      <div className="rounded-xl sm:rounded-2xl md:rounded-[28px] border border-[#E9EDEE] bg-white p-4 sm:p-5 md:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
          <Label
            htmlFor="template-content"
            className="font-poppins font-semibold text-sm sm:text-base"
          >
            Template Content
          </Label>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-poppins">
            <span className="hidden sm:inline">
              {placeholderCount} placeholder
              {placeholderCount !== 1 ? "s" : ""} detected
            </span>
            <span className="sm:hidden">{placeholderCount}</span>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <RichTextEditor
            content={content}
            onChange={onContentChange}
            placeholder="Enter template content with placeholders like {{thrive.company_name}}, {{examiner.name}}, {{fees.base_exam_fee}}, etc. (Press Enter for new paragraph, Shift + Enter for new line)"
            editorRef={editorRef}
            validVariables={validVariablesSet}
            availableVariables={availableVariables}
            variableValues={variableValuesMap}
            customVariables={customVariables}
            headerConfig={headerConfig}
            footerConfig={footerConfig}
            onHeaderChange={onHeaderChange}
            onFooterChange={onFooterChange}
          />
        </div>
      </div>
    </div>
  );
}
