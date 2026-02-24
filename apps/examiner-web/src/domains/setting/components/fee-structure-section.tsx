'use client';

import React, { useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DocumentPreviewModal from '@/domains/onboarding/components/OnboardingSteps/DocumentPreviewModal';
import { toast } from 'sonner';
import type { FeeStructureSectionProps } from '../types';

const FeeStructureSection: React.FC<FeeStructureSectionProps> = ({
  feeStructure,
  contract,
  contractHtml,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const formatValue = (
    value: unknown,
    type: string,
    currency?: string | null,
    decimals?: number | null,
    unit?: string | null
  ): string => {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    if (type === 'MONEY') {
      const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0));
      if (isNaN(numValue)) {
        return '—';
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'CAD',
        minimumFractionDigits: decimals ?? 2,
        maximumFractionDigits: decimals ?? 2,
      }).format(numValue);
    } else if (type === 'NUMBER') {
      const numValue = typeof value === 'number' ? value : parseFloat(String(value || 0));
      if (isNaN(numValue)) {
        return '—';
      }
      let formatted = numValue.toFixed(decimals ?? 0);
      if (unit) {
        formatted += ` ${unit}`;
      }
      return formatted;
    } else if (type === 'BOOLEAN') {
      return value === true ? 'Yes' : 'No';
    } else {
      return String(value || '');
    }
  };

  // Prepare fee structure data for table display
  // Prioritize variables array (new format) over legacy fields
  const feeStructureRows =
    feeStructure?.variables && feeStructure.variables.length > 0
      ? feeStructure.variables.map(variable => ({
          label: variable.label,
          value: formatValue(
            variable.value,
            variable.type,
            variable.currency,
            variable.decimals,
            variable.unit
          ),
          key: variable.key,
        }))
      : [
          {
            label: 'IME Fee (in-clinic)',
            value: feeStructure?.IMEFee
              ? formatValue(feeStructure.IMEFee, 'MONEY', 'CAD', 2)
              : null,
            key: 'ime_fee',
          },
          {
            label: 'Report Review Only',
            value: feeStructure?.recordReviewFee
              ? formatValue(feeStructure.recordReviewFee, 'MONEY', 'CAD', 2)
              : null,
            key: 'record_review_fee',
          },
          {
            label: 'Hourly Rate (if applicable)',
            value: feeStructure?.hourlyRate
              ? formatValue(feeStructure.hourlyRate, 'MONEY', 'CAD', 2)
              : null,
            key: 'hourly_rate',
          },
          {
            label: 'Cancellation / No-show Fee',
            value: feeStructure?.cancellationFee
              ? formatValue(feeStructure.cancellationFee, 'MONEY', 'CAD', 2)
              : null,
            key: 'cancellation_fee',
          },
        ].filter(row => row.value !== null && row.value !== '—');

  const handlePreview = () => {
    if (!contract) {
      toast.error('No contract available');
      return;
    }

    if (!contractHtml) {
      toast.error('Contract content not available');
      return;
    }

    // Create a blob URL from the HTML
    const blob = new Blob([contractHtml], {
      type: 'text/html',
    });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setPreviewFileName('Contract.html');
  };

  const handleDownload = async () => {
    if (!contract) {
      toast.error('No contract available');
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
            method: 'GET',
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Download failed:', errorData);
            toast.error(errorData.error || `Failed to download contract (${response.status})`);
            return;
          }

          // Get the blob from the response
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = 'Contract.pdf';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();

          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          }, 100);

          toast.success('Contract downloaded');
        } catch (error) {
          console.error('Error downloading PDF:', error);
          toast.error('Failed to download contract. Please try again.');
        }
      } else {
        // Fallback to HTML if PDF not available
        if (contractHtml) {
          const blob = new Blob([contractHtml], {
            type: 'text/html',
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'Contract.html';
          link.style.display = 'none';
          document.body.appendChild(link);
          setTimeout(() => {
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('Contract downloaded');
          }, 100);
        } else {
          toast.error('Contract file not available');
        }
      }
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast.error('Failed to download contract');
    } finally {
      setIsLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewFileName('');
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-medium">Fee Structure</h2>
        <p className="mt-1 text-sm text-gray-500">
          Your fee structure is read-only and cannot be modified.
        </p>
      </div>

      {/* Fee Structure Table */}
      <div className="mb-8">
        {feeStructureRows.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-gray-300 py-8 text-center">
            <p className="font-poppins mb-2 text-[16px] text-[#7B8B91]">
              No fee structure data available
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md outline-none">
            <div className="min-w-[600px] md:min-w-0">
              <Table className="w-full border-0 md:table-fixed">
                <TableHeader>
                  <TableRow className="border-b-0 bg-[#F3F3F3]">
                    <TableHead className="whitespace-nowrap rounded-l-2xl px-3 py-2 text-sm font-medium text-black sm:px-6 sm:text-base">
                      Names
                    </TableHead>
                    <TableHead className="whitespace-nowrap rounded-r-2xl px-3 py-2 text-sm font-medium text-black sm:px-6 sm:text-base">
                      Fee
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructureRows.map(row => (
                    <TableRow
                      key={row.key}
                      className="hover:bg-muted/50 border-0 border-b bg-white transition-colors"
                    >
                      <TableCell className="whitespace-nowrap px-3 py-3 align-middle sm:px-6 sm:py-4">
                        <span className="font-poppins text-sm font-medium leading-normal text-[#4D4D4D] sm:text-[16px]">
                          {row.label}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-3 py-3 align-middle sm:px-6 sm:py-4">
                        <span className="font-poppins text-sm leading-normal text-[#4D4D4D] sm:text-[16px]">
                          {row.value}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Contract Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <FileText className="h-5 w-5" />
              Contract
            </h3>
            {contract?.signedAt && (
              <p className="mt-1 text-sm text-gray-500">
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
                className="flex items-center justify-center gap-2 rounded-full border-2 border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-full border-2 border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            </div>
          )}
        </div>
        {!contract && <p className="text-sm text-gray-500">No contract available</p>}
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
