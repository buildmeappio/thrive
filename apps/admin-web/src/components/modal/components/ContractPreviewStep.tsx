'use client';

import { Loader2 } from 'lucide-react';
import PageRender from '@/components/editor/PageRender';
import { HeaderConfig, FooterConfig } from '@/components/editor/types';

type ContractPreviewStepProps = {
  previewHtml: string;
  headerConfig: HeaderConfig | null;
  footerConfig: FooterConfig | null;
};

export default function ContractPreviewStep({
  previewHtml,
  headerConfig,
  footerConfig,
}: ContractPreviewStepProps) {
  if (!previewHtml) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="font-poppins flex items-center gap-2 text-[#7A7A7A]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm sm:text-[15px]">Loading preview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-auto rounded-xl border border-[#E5E5E5] bg-white p-4 sm:rounded-[15px]">
        <PageRender content={previewHtml} header={headerConfig} footer={footerConfig} />
      </div>
    </div>
  );
}
