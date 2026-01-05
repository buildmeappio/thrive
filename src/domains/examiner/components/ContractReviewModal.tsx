"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { capitalizeWords } from "@/utils/text";
import { useAdminSignatureCanvas } from "@/domains/contracts/components/hooks/useAdminSignatureCanvas";
import type { ExaminerData } from "../types/ExaminerData";
import type { LoadingAction } from "../types/examinerDetail.types";

interface ContractReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  examiner: ExaminerData;
  contractHtml: string | null;
  loadingContract: boolean;
  reviewDate: string;
  setReviewDate: (date: string) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  signatureImage: string | null;
  clearSignature: () => void;
  loadingAction: LoadingAction;
  onDecline: () => void;
  onConfirm: () => void;
}

export const ContractReviewModal = ({
  isOpen,
  onClose,
  examiner,
  contractHtml,
  loadingContract,
  reviewDate,
  setReviewDate,
  canvasRef,
  signatureImage,
  clearSignature,
  loadingAction,
  onDecline,
  onConfirm,
}: ContractReviewModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <style jsx global>{`
        /* Contract page styles for modal */
        .contract-modal-container .page {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin: 1rem auto;
          position: relative;
          min-height: auto;
          height: auto;
          overflow: visible;
          page-break-inside: avoid;
          flex-shrink: 0;
          width: 100%;
          max-width: 794px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .contract-modal-container .page-header {
          flex-shrink: 0;
          min-height: 40px;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 8px 40px;
          font-size: 12px;
          color: #6c757d;
          font-weight: 500;
          z-index: 10;
          flex-wrap: wrap;
          overflow: hidden;
          box-sizing: border-box;
          position: relative;
          margin-bottom: 0;
        }

        .contract-modal-container .page-content {
          flex: 1;
          margin: 0;
          padding: 24px 40px;
          position: relative;
          overflow: visible;
          word-wrap: break-word;
          line-height: 1.6;
          font-size: 14px;
          color: #333;
          background: white;
          min-height: 0;
          box-sizing: border-box;
          margin-top: 0;
          margin-bottom: 0;
        }

        .contract-modal-container .page-footer {
          flex-shrink: 0;
          min-height: 40px;
          background: #f8f9fa;
          border-top: 1px solid #dee2e6;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 8px 40px;
          font-size: 12px;
          color: #6c757d;
          font-weight: 500;
          z-index: 10;
          flex-wrap: wrap;
          overflow: hidden;
          box-sizing: border-box;
          position: relative;
          margin-top: 0;
        }

        .contract-modal-container .pages-container {
          display: flex;
          flex-direction: column;
          gap: 0;
          width: 100%;
          padding: 0;
          overflow: visible;
        }

        .contract-modal-container {
          overflow: visible;
        }

        .contract-modal-container .page-content > *:first-child {
          margin-top: 0;
          padding-top: 0;
        }

        .contract-modal-container .page-content > *:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
        }

        /* Contract preview styles (matching examiner side) */
        .prose {
          color: #333;
        }

        /* Ensure variable spans in prose stay inline and don't break lines */
        .prose span[title],
        .prose span[data-signature],
        .prose span[style*="border-bottom"],
        .prose span[style*="display: inline"],
        .prose span[style*="display: inline-block"] {
          display: inline !important;
          white-space: normal !important;
          word-break: normal !important;
          vertical-align: baseline !important;
          line-height: inherit !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Prevent line breaks before/after variable spans in prose */
        .prose p span[title],
        .prose p span[data-signature],
        .prose p span[style*="border-bottom"],
        .prose li span[title],
        .prose li span[data-signature],
        .prose li span[style*="border-bottom"] {
          display: inline !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Handle paragraphs that only contain variable spans - make them inline */
        .prose p:only-child {
          margin: 0 !important;
          padding: 0 !important;
          display: inline !important;
        }

        /* Merge adjacent paragraphs that contain only variables */
        .prose p + p:has(> span[title]:only-child),
        .prose p + p:has(> span[data-signature]:only-child) {
          margin-top: 0 !important;
          padding-top: 0 !important;
          display: inline !important;
        }

        /* Ensure list items with variables don't break */
        .prose ul li,
        .prose ol li {
          line-height: 1.6 !important;
        }

        .prose ul li span[title],
        .prose ul li span[data-signature],
        .prose ul li span[style*="border-bottom"],
        .prose ol li span[title],
        .prose ol li span[data-signature],
        .prose ol li span[style*="border-bottom"] {
          display: inline !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Handle paragraphs in list items - minimize spacing */
        .prose ul li p,
        .prose ol li p {
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Make consecutive paragraphs in list items inline to prevent line breaks */
        .prose ul li p + p,
        .prose ol li p + p {
          margin-top: 0 !important;
          padding-top: 0 !important;
          display: inline !important;
        }

        /* If a paragraph in a list item only contains a variable span, make it inline */
        .prose ul li > p:only-child,
        .prose ol li > p:only-child {
          display: inline !important;
        }
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
          font-family:
            ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
            "Liberation Mono", monospace;
        }

        /* Ensure signature area is always interactive */
        .signature-container {
          pointer-events: auto !important;
          position: relative;
          z-index: 1000;
        }

        /* Ensure contract preview doesn't block signature area */
        .contract-preview-column {
          pointer-events: auto;
          position: relative;
          z-index: 1;
        }

        /* Ensure all elements inside contract preview don't overflow */
        .contract-preview-column * {
          max-width: 100%;
          overflow: visible;
        }

        /* Ensure variable spans stay inline and don't break onto new lines */
        .contract-preview-column span[title],
        .contract-preview-column span[data-signature],
        .contract-preview-column span[style*="border-bottom"],
        .contract-preview-column span[style*="display: inline"],
        .contract-preview-column span[style*="display: inline-block"] {
          display: inline !important;
          white-space: normal !important;
          word-break: normal !important;
          vertical-align: baseline !important;
          line-height: inherit !important;
        }

        /* Ensure paragraphs containing variable spans don't force breaks */
        .contract-preview-column p span[title],
        .contract-preview-column p span[data-signature],
        .contract-preview-column p span[style*="border-bottom"] {
          display: inline !important;
        }

        /* Prevent line breaks before/after variable spans */
        .contract-preview-column span[title]::before,
        .contract-preview-column span[title]::after,
        .contract-preview-column span[data-signature]::before,
        .contract-preview-column span[data-signature]::after {
          content: "" !important;
        }

        /* Ensure signature column is always on top */
        .signature-column {
          pointer-events: auto !important;
          position: relative;
          z-index: 1001 !important;
          background: #f9fafb;
        }

        /* Canvas specific styles */
        canvas.signature-canvas {
          pointer-events: auto !important;
          position: relative !important;
          z-index: 1002 !important;
          cursor: crosshair !important;
        }
      `}</style>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-7xl max-h-[90vh] rounded-lg shadow-lg relative flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Review Signed Contract
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Signed by {capitalizeWords(examiner.name)} on{" "}
                {examiner.contractSignedByExaminerAt
                  ? new Date(
                      examiner.contractSignedByExaminerAt,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Two Column Layout */}
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            {/* Left Column - Contract Preview */}
            <div className="contract-preview-column flex-1 overflow-y-auto overflow-x-hidden p-6 border-r border-gray-200">
              {loadingContract ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-600 font-poppins">
                    Loading contract...
                  </p>
                </div>
              ) : contractHtml ? (
                <div
                  className="flex-1 min-w-0 bg-white rounded-[20px]"
                  style={{
                    padding: "40px 50px",
                    maxWidth: "210mm",
                    lineHeight: "1.4",
                    boxShadow: "0px 0px 36.35px 0px #00000008",
                  }}
                >
                  <div
                    className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none font-poppins"
                    dangerouslySetInnerHTML={{ __html: contractHtml }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-600 font-poppins">
                    Contract preview not available
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Admin Signature and Review Date */}
            <div className="signature-column w-96 flex-shrink-0 p-6 bg-gray-50 flex flex-col">
              <div className="space-y-6">
                {/* Review Date */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2 font-poppins">
                    Review Date
                  </label>
                  <input
                    type="date"
                    value={reviewDate}
                    onChange={(e) => setReviewDate(e.target.value)}
                    disabled={loadingAction !== null}
                    className="w-full h-12 rounded-[10px] border-none bg-white px-3 text-sm text-[#333] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:opacity-50 font-poppins"
                  />
                </div>

                {/* Admin Signature */}
                <div className="signature-container">
                  <label className="block text-sm font-semibold text-black mb-2 font-poppins">
                    Admin Signature
                  </label>
                  <div className="border-2 border-[#00A8FF] rounded-[10px] p-1 bg-white signature-container">
                    <canvas
                      key={isOpen ? "canvas-open" : "canvas-closed"}
                      ref={canvasRef}
                      width={320}
                      height={140}
                      className="signature-canvas w-full cursor-crosshair bg-[#F2F5F6] rounded-[8px] select-none"
                      style={{
                        touchAction: "none",
                        display: "block",
                        pointerEvents: "auto",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        position: "relative",
                        zIndex: 1002,
                      }}
                    />
                  </div>
                  <button
                    onClick={clearSignature}
                    disabled={loadingAction !== null}
                    className="mt-2 text-sm text-[#00A8FF] hover:text-[#0088CC] font-semibold underline transition-colors disabled:opacity-50 font-poppins"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-poppins text-sm font-medium"
            >
              Close
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onDecline}
                disabled={loadingAction !== null}
                className={cn(
                  "px-6 py-3 rounded-full border border-red-500 text-red-700 bg-white hover:bg-red-50 font-poppins text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {loadingAction === "reject"
                  ? "Declining..."
                  : "Decline Contract"}
              </button>
              <button
                onClick={onConfirm}
                disabled={loadingAction !== null}
                className={cn(
                  "px-6 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white font-poppins text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {loadingAction === "markContractSigned"
                  ? "Confirming..."
                  : "Confirm Contract"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
