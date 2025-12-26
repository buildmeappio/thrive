"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Eye } from "lucide-react";
import { toast } from "sonner";
import { previewContractAction, sendContractAction } from "../actions";
import type { ContractData } from "../types/contract.types";
import { formatText, formatFullName } from "@/utils/text";

type Props = {
  contract: ContractData;
};

export default function ContractDetailView({ contract }: Props) {
  const router = useRouter();
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract.id]);

  const loadPreview = async () => {
    setLoadingPreview(true);
    try {
      const result = await previewContractAction(contract.id);
      if (result.success && result.data) {
        setPreviewHtml(result.data.renderedHtml);
      } else {
        toast.error(
          "error" in result ? result.error : "Failed to load preview",
        );
      }
    } catch (error) {
      console.error("Error loading preview:", error);
      toast.error("Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSendContract = async () => {
    if (
      !confirm("Are you sure you want to send this contract to the examiner?")
    ) {
      return;
    }

    setSending(true);
    try {
      const result = await sendContractAction(contract.id);
      if (result.success) {
        toast.success("Contract sent successfully");
        router.refresh();
      } else {
        toast.error(
          "error" in result ? result.error : "Failed to send contract",
        );
      }
    } catch (error) {
      console.error("Error sending contract:", error);
      toast.error("Failed to send contract");
    } finally {
      setSending(false);
    }
  };

  const getExaminerName = () => {
    const fv = contract.fieldValues as any;
    if (fv?.examiner?.name) {
      return fv.examiner.name;
    }
    if (fv?.examiner?.firstName || fv?.examiner?.lastName) {
      return (
        formatFullName(fv.examiner.firstName, fv.examiner.lastName) || "N/A"
      );
    }
    return "N/A";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[#000000] text-[28px] lg:text-[36px] font-semibold font-degular leading-tight">
              Contract Details
            </h1>
            <p className="text-sm text-[#7B8B91] font-poppins mt-1">
              {getExaminerName()} • {contract.template.displayName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {contract.status === "DRAFT" && (
            <button
              onClick={handleSendContract}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-[#000080] text-white rounded-full hover:bg-[#000060] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
              }}
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Contract"}
            </button>
          )}
        </div>
      </div>

      {/* Contract Info */}
      <div className="rounded-[28px] border border-[#E9EDEE] bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#7B8B91] font-poppins mb-1">Status</p>
            <p className="text-base font-poppins font-semibold">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {formatText(contract.status)}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-[#7B8B91] font-poppins mb-1">Template</p>
            <p className="text-base font-poppins font-semibold">
              {contract.template.displayName}
            </p>
          </div>
          {contract.sentAt && (
            <div>
              <p className="text-sm text-[#7B8B91] font-poppins mb-1">
                Sent At
              </p>
              <p className="text-base font-poppins">
                {new Date(contract.sentAt).toLocaleString()}
              </p>
            </div>
          )}
          {contract.signedAt && (
            <div>
              <p className="text-sm text-[#7B8B91] font-poppins mb-1">
                Signed At
              </p>
              <p className="text-base font-poppins">
                {new Date(contract.signedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contract Preview */}
      <div className="rounded-[28px] border border-[#E9EDEE] bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-poppins">
            Contract Preview
          </h2>
          <button
            onClick={loadPreview}
            disabled={loadingPreview}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#7B8B91] hover:text-[#000000] hover:bg-gray-50 rounded-full transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            {loadingPreview ? "Loading..." : "Refresh"}
          </button>
        </div>
        {loadingPreview ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#7B8B91] font-poppins">
              Loading preview...
            </div>
          </div>
        ) : previewHtml ? (
          <div className="border rounded-lg p-6 bg-white">
            <div
              className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none min-h-[500px] p-4 font-poppins"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            {/* TipTap/ProseMirror styles for proper rendering - matching editor exactly */}
            <style jsx global>{`
              .prose table {
                border-collapse: collapse;
                margin: 1rem 0;
                overflow: hidden;
                width: 100%;
              }
              .prose table td,
              .prose table th {
                border: 1px solid #d1d5db;
                box-sizing: border-box;
                min-width: 1em;
                padding: 0.5rem;
                position: relative;
                vertical-align: top;
              }
              .prose table th {
                background-color: #f3f4f6;
                font-weight: 600;
              }
              .prose img {
                max-width: 100%;
                height: auto;
                display: inline-block;
              }
              .prose ul[data-type="taskList"] {
                list-style: none;
                padding: 0;
              }
              .prose ul[data-type="taskList"] li {
                display: flex;
                align-items: flex-start;
                gap: 0.5rem;
              }
              .prose hr {
                border: none;
                border-top: 1px solid #d1d5db;
                margin: 1rem 0;
              }
              .prose blockquote {
                border-left: 4px solid #d1d5db;
                padding-left: 1rem;
                margin: 1rem 0;
                color: #6b7280;
                font-style: italic;
              }
              .prose pre {
                background: #f3f4f6;
                border-radius: 0.5rem;
                padding: 1rem;
                margin: 1rem 0;
                overflow-x: auto;
              }
              .prose code {
                background: #f3f4f6;
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
                font-size: 0.875em;
                font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
              }
              /* Ensure inline styles from TipTap take precedence over prose styles */
              .prose [style] {
                /* Inline styles already have highest specificity, but ensure they're not overridden */
              }
            `}</style>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#7B8B91] font-poppins">
              No preview available
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
