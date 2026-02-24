'use client';

import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/editor/RichTextEditor';
import type { HeaderConfig, FooterConfig } from '@/components/editor/types';
import type { VariableGroup } from '../../types/variables.types';
import type { CustomVariable } from '@/domains/custom-variables/types/customVariable.types';
import type { EditorRef } from '../../types/contractTemplateEdit.types';

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
    <div className="flex max-h-[100vh] min-h-[500px] flex-col lg:min-h-0">
      <div className="flex h-full flex-col rounded-xl border border-[#E9EDEE] bg-white p-4 sm:rounded-2xl sm:p-5 md:rounded-[28px] md:p-6">
        <div className="mb-3 flex flex-shrink-0 items-center justify-between sm:mb-4">
          <Label
            htmlFor="template-content"
            className="font-poppins text-sm font-semibold sm:text-base"
          >
            Template Content
          </Label>
          <div className="font-poppins flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">
              {placeholderCount} placeholder
              {placeholderCount !== 1 ? 's' : ''} detected
            </span>
            <span className="sm:hidden">{placeholderCount}</span>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <RichTextEditor
            content={content}
            onChange={onContentChange}
            placeholder="Enter template content with placeholders like {{thrive.company_name}}, {{examiner.name}}, {{fees.base_exam_fee}}, etc. (Press Enter for new paragraph, Shift + Enter for new line)"
            editorRef={editorRef}
            validVariables={validVariablesSet}
            availableVariables={availableVariables}
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
