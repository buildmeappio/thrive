import { ChevronDown } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CaseDetailsData } from '../../types';

type DocumentsSectionProps = {
  documents: CaseDetailsData['documents'];
  onPreview: (documentName: string, displayName: string) => void;
  onDownload: (documentName: string, displayName: string) => void;
};

export default function DocumentsSection({
  documents,
  onPreview,
  onDownload,
}: DocumentsSectionProps) {
  return (
    <AccordionItem value="documents" className="border-b-0">
      <AccordionTrigger className="group py-4 text-xl font-bold text-black hover:no-underline [&>svg]:hidden">
        <div className="flex w-full items-center justify-between pr-4">
          <span>Documents</span>
          <ChevronDown className="h-5 w-5 text-[#00A8FF] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-6 pt-4">
        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg bg-[#F9F9F9] p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-poppins truncate text-base font-medium text-[#1A1A1A]">
                    {doc.displayName || doc.name}
                  </p>
                  <p className="font-poppins text-sm text-[#5B5B5B]">
                    {doc.type} • {(doc.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex items-center justify-start gap-3 sm:justify-end">
                  <button
                    onClick={() => onPreview(doc.name, doc.displayName || doc.name)}
                    className="cursor-pointer font-[Poppins] text-[14px] font-[400] leading-tight text-[#4E4E4E] underline sm:text-[16px]"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => onDownload(doc.name, doc.displayName || doc.name)}
                    className="cursor-pointer font-[Poppins] text-[14px] font-[400] leading-tight text-[#000080] underline sm:text-[16px]"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-poppins text-base text-[#5B5B5B]">No documents available</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
