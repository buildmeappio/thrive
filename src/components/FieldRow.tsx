"use client";

import { useState } from "react";

type FieldRowProps = {
  label: string;
  value: React.ReactNode;
  valueHref?: string;
  type: "text" | "document" | "link";
};

const FieldRow = ({ label, value, valueHref, type }: FieldRowProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileName = typeof value === "string" ? value : "";
  const fileUrl = `https://public-thrive-assets.s3.eu-north-1.amazonaws.com/documents/${encodeURIComponent(
    fileName
  )}`;


  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full rounded-lg bg-[#F6F6F6] px-3 sm:px-4 py-2 gap-1.5 sm:gap-2">
        <span className="shrink-0 font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none tracking-[-0.03em] text-[#4E4E4E]">
          {label}
        </span>

        <div className="min-w-0 sm:max-w-[75%] text-left sm:text-right">
          {type === "link" ? (
            <a
              href={valueHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-tight tracking-[-0.03em] text-[#000080] underline break-words"
            >
              {value as string}
            </a>
          ) : type === "document" ? (
            fileName ? (
              <div className="flex items-center justify-start sm:justify-end gap-3">
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none text-[#4E4E4E] underline"
                >
                  Preview
                </button>
                <button
                  className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none text-[#000080] underline"
                >
                  Download
                </button>
              </div>
            ) : (
              <span className="block font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-tight tracking-[-0.03em] text-[#000080]">
                -
              </span>
            )
          ) : (
            <span className="block font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-tight tracking-[-0.03em] text-[#000080] break-words">
              {value ?? "-"}
            </span>
          )}
        </div>
      </div>

      {/* Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] h-[90%] rounded-lg shadow-lg relative">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full px-3 py-1 text-sm"
            >
              ✕
            </button>
            <iframe
              src={fileUrl}
              title="Document Preview"
              className="w-full h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FieldRow;
