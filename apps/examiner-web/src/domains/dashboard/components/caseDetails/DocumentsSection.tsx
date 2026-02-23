import { ChevronDown } from "lucide-react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CaseDetailsData } from "../../types";

type DocumentsSectionProps = {
  documents: CaseDetailsData["documents"];
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
      <AccordionTrigger className="text-xl font-bold text-black hover:no-underline py-4 [&>svg]:hidden group">
        <div className="flex items-center justify-between w-full pr-4">
          <span>Documents</span>
          <ChevronDown className="h-5 w-5 text-[#00A8FF] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pb-6">
        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-[#1A1A1A] font-poppins truncate">
                    {doc.displayName || doc.name}
                  </p>
                  <p className="text-sm text-[#5B5B5B] font-poppins">
                    {doc.type} • {(doc.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex items-center justify-start sm:justify-end gap-3">
                  <button
                    onClick={() =>
                      onPreview(doc.name, doc.displayName || doc.name)
                    }
                    className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] cursor-pointer leading-tight text-[#4E4E4E] underline"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() =>
                      onDownload(doc.name, doc.displayName || doc.name)
                    }
                    className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] cursor-pointer leading-tight text-[#000080] underline"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base text-[#5B5B5B] font-poppins">
            No documents available
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
