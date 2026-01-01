"use client";

import { Label } from "@/components/ui/label";
import PageRender from "@/components/editor/PageRender";
import type { HeaderConfig, FooterConfig } from "./types";

type PreviewSectionProps = {
  content: string;
  headerConfig: HeaderConfig | undefined;
  footerConfig: FooterConfig | undefined;
  variableValuesMap: Map<string, string>;
};

export function PreviewSection({
  content,
  headerConfig,
  footerConfig,
  variableValuesMap,
}: PreviewSectionProps) {
  return (
    <div className="flex flex-col max-h-[100vh] min-h-[500px] lg:min-h-0">
      <div className="rounded-xl sm:rounded-2xl md:rounded-[28px] border border-[#E9EDEE] bg-white p-4 sm:p-5 md:p-6 flex flex-col h-full">
        <Label className="font-poppins font-semibold mb-3 sm:mb-4 block text-sm sm:text-base flex-shrink-0">
          Page Preview
        </Label>
        <div className="flex-1 min-h-0 overflow-auto">
          <PageRender
            content={content}
            header={headerConfig}
            footer={footerConfig}
            variableValues={variableValuesMap}
          />
        </div>
      </div>
    </div>
  );
}
