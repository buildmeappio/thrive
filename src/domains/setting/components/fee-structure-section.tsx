"use client";

import React, { useState } from "react";
import { DollarSign, FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentPreviewModal from "@/domains/onboarding/components/OnboardingSteps/DocumentPreviewModal";
import { toast } from "sonner";
import type { FeeStructureSectionProps } from "../types";

const FeeStructureSection: React.FC<FeeStructureSectionProps> = ({
  feeStructure,
  contract,
  contractHtml,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (
    value: number | string | null | undefined
  ): string => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }
    const numValue =
      typeof value === "string" ? parseFloat(value) : Number(value);
    if (isNaN(numValue)) {
      return "N/A";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numValue);
  };

  const handlePreview = () => {
    if (!contract) {
      toast.error("No contract available");
      return;
    }

    if (!contractHtml) {
      toast.error("Contract content not available");
      return;
    }

    // Create a blob URL from the HTML
    const blob = new Blob([contractHtml], {
      type: "text/html",
    });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setPreviewFileName("Contract.html");
  };

  const handleDownload = async () => {
    if (!contract) {
      toast.error("No contract available");
      return;
    }

    setIsLoading(true);
    try {
      const pdfKey = contract.signedPdfS3Key || contract.unsignedPdfS3Key;

      if (pdfKey) {
        // Use API route to download with proper headers
        try {
          const downloadUrl = `/examiner/api/contract/download?key=${encodeURIComponent(pdfKey)}`;

          // Fetch first to check for errors
          const response = await fetch(downloadUrl, {
            method: "GET",
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ error: "Unknown error" }));
            console.error("Download failed:", errorData);
            toast.error(
              errorData.error ||
                `Failed to download contract (${response.status})`
            );
            return;
          }

          // Get the blob from the response
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = "Contract.pdf";
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();

          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          }, 100);

          toast.success("Contract downloaded");
        } catch (error) {
          console.error("Error downloading PDF:", error);
          toast.error("Failed to download contract. Please try again.");
        }
      } else {
        // Fallback to HTML if PDF not available
        if (contractHtml) {
          const blob = new Blob([contractHtml], {
            type: "text/html",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "Contract.html";
          link.style.display = "none";
          document.body.appendChild(link);
          setTimeout(() => {
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Contract downloaded");
          }, 100);
        } else {
          toast.error("Contract file not available");
        }
      }
    } catch (error) {
      console.error("Error downloading contract:", error);
      toast.error("Failed to download contract");
    } finally {
      setIsLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewFileName("");
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-medium">Fee Structure</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your fee structure is read-only and cannot be modified.
        </p>
      </div>

      {/* Fee Structure Fields */}
      <div className="space-y-4 mb-8">
        <div className="border border-gray-200 rounded-lg p-6 bg-[#FCFDFF]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IME Fee */}
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-500 shrink-0" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">
                  IME Fee
                </label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(feeStructure?.IMEFee)}
                </p>
              </div>
            </div>

            {/* Record Review Fee */}
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-500 shrink-0" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">
                  Record Review Fee
                </label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(feeStructure?.recordReviewFee)}
                </p>
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-500 shrink-0" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">
                  Hourly Rate
                </label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(feeStructure?.hourlyRate)}
                </p>
              </div>
            </div>

            {/* Cancellation Fee */}
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-500 shrink-0" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">
                  Cancellation Fee
                </label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {formatCurrency(feeStructure?.cancellationFee)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Contract
            </h3>
            {contract?.signedAt && (
              <p className="text-sm text-gray-500 mt-1">
                Signed on {new Date(contract.signedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          {contract && (
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handlePreview}
                disabled={isLoading}
                className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 flex items-center justify-center gap-2 bg-white">
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                disabled={isLoading}
                className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 flex items-center justify-center gap-2 bg-white">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>
          )}
        </div>
        {!contract && (
          <p className="text-sm text-gray-500">No contract available</p>
        )}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <DocumentPreviewModal
          previewUrl={previewUrl}
          previewFileName={previewFileName}
          previewFileType="html"
          onClose={closePreview}
        />
      )}
    </div>
  );
};

export default FeeStructureSection;
