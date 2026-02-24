'use client';

import { Label } from '@/components/ui/label';
import PageRender from '@/components/editor/PageRender';
import type { HeaderConfig, FooterConfig } from '@/components/editor/types';
import type { CustomVariable } from '@/domains/custom-variables/types/customVariable.types';

export type PreviewSectionProps = {
  content: string;
  headerConfig: HeaderConfig | undefined;
  footerConfig: FooterConfig | undefined;
  variableValuesMap: Map<string, string>;
  customVariables?: CustomVariable[];
};

export function PreviewSection({
  content,
  headerConfig,
  footerConfig,
  variableValuesMap,
  customVariables = [],
}: PreviewSectionProps) {
  return (
    <div className="flex max-h-[100vh] min-h-[500px] flex-col lg:min-h-0">
      <div className="flex h-full flex-col rounded-xl border border-[#E9EDEE] bg-white p-4 sm:rounded-2xl sm:p-5 md:rounded-[28px] md:p-6">
        <Label className="font-poppins mb-3 block flex-shrink-0 text-sm font-semibold sm:mb-4 sm:text-base">
          Page Preview
        </Label>
        <div className="min-h-0 flex-1 overflow-auto">
          <PageRender
            content={content}
            header={headerConfig}
            footer={footerConfig}
            variableValues={variableValuesMap}
            customVariables={customVariables.map(v => ({
              key: v.key,
              showUnderline: v.showUnderline,
              variableType: v.variableType,
              options: v.options || undefined,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
