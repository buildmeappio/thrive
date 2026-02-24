'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Eye, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { previewContractAction, sendContractAction, reviewContractAction } from '../actions';
import type { ContractData } from '../types/contract.types';
import { formatText, formatFullName } from '@/utils/text';
import AdminReviewForm from './AdminReviewForm';

type Props = {
  contract: ContractData;
};

export default function ContractDetailView({ contract }: Props) {
  const router = useRouter();
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract.id, contract.reviewedAt]);

  const loadPreview = async () => {
    setLoadingPreview(true);
    try {
      const result = await previewContractAction(contract.id);
      if ('error' in result) {
        toast.error(result.error ?? 'Failed to load preview');
        return;
      }
      if (result.data) {
        setPreviewHtml(result.data.renderedHtml);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSendContract = async () => {
    if (!confirm('Are you sure you want to send this contract to the examiner?')) {
      return;
    }

    setSending(true);
    try {
      const result = await sendContractAction(contract.id);
      if ('error' in result) {
        toast.error(result.error ?? 'Failed to send contract');
        return;
      }
      toast.success('Contract sent successfully');
      // Refresh the page to show updated contract status
      router.refresh();
    } catch (error) {
      console.error('Error sending contract:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send contract';
      toast.error(errorMessage);
    } finally {
      // Always reset loading state, even if router.refresh() hangs
      setSending(false);
    }
  };

  const getExaminerName = () => {
    const fv = contract.fieldValues as any;
    if (fv?.examiner?.name) {
      return fv.examiner.name;
    }
    if (fv?.examiner?.firstName || fv?.examiner?.lastName) {
      return formatFullName(fv.examiner.firstName, fv.examiner.lastName) || 'N/A';
    }
    return 'N/A';
  };

  const handleReviewSubmit = async (signatureImage: string, reviewDate: string) => {
    setReviewing(true);
    try {
      const result = await reviewContractAction({
        contractId: contract.id,
        signatureImage,
        reviewDate,
      });
      if ('error' in result) {
        toast.error(result.error ?? 'Failed to review contract');
        return;
      }
      toast.success('Contract reviewed successfully');
      setShowReviewForm(false);
      router.refresh();
      // Reload preview to show updated signature and review date
      await loadPreview();
    } catch (error) {
      console.error('Error reviewing contract:', error);
      toast.error('Failed to review contract');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-degular text-[28px] font-semibold leading-tight text-[#000000] lg:text-[36px]">
              Contract Details
            </h1>
            <p className="font-poppins mt-1 text-sm text-[#7B8B91]">
              {getExaminerName()} • {contract.template.displayName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {contract.status === 'DRAFT' && (
            <button
              onClick={handleSendContract}
              disabled={sending}
              className="flex items-center gap-2 rounded-full bg-[#000080] px-4 py-2 text-white transition-colors hover:bg-[#000060] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
              }}
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send Contract'}
            </button>
          )}
          {contract.status === 'SIGNED' && !contract.reviewedAt && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 rounded-full bg-[#000080] px-4 py-2 text-white transition-colors hover:bg-[#000060] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Review Signed Contract
            </button>
          )}
        </div>
      </div>

      {/* Contract Info */}
      <div className="rounded-[28px] border border-[#E9EDEE] bg-white p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="font-poppins mb-1 text-sm text-[#7B8B91]">Status</p>
            <p className="font-poppins text-base font-semibold">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                {formatText(contract.status)}
              </span>
            </p>
          </div>
          <div>
            <p className="font-poppins mb-1 text-sm text-[#7B8B91]">Template</p>
            <p className="font-poppins text-base font-semibold">{contract.template.displayName}</p>
          </div>
          {contract.sentAt && (
            <div>
              <p className="font-poppins mb-1 text-sm text-[#7B8B91]">Sent At</p>
              <p className="font-poppins text-base">{new Date(contract.sentAt).toLocaleString()}</p>
            </div>
          )}
          {contract.signedAt && (
            <div>
              <p className="font-poppins mb-1 text-sm text-[#7B8B91]">Signed At</p>
              <p className="font-poppins text-base">
                {new Date(contract.signedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contract Preview */}
      <div className="rounded-[28px] border border-[#E9EDEE] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-poppins text-lg font-semibold">Contract Preview</h2>
          <button
            onClick={loadPreview}
            disabled={loadingPreview}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-[#7B8B91] transition-colors hover:bg-gray-50 hover:text-[#000000] disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            {loadingPreview ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        {loadingPreview ? (
          <div className="flex items-center justify-center py-12">
            <div className="font-poppins text-[#7B8B91]">Loading preview...</div>
          </div>
        ) : previewHtml ? (
          <div className="overflow-auto rounded-lg border bg-white p-6">
            <div
              className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl font-poppins max-w-none p-4 focus:outline-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            {/* Styles for proper contract rendering - matching editor exactly */}
            <style jsx global>{`
              .prose {
                color: inherit;
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
              /* Preserve text-align from inline styles */
              .prose table td[style*='text-align: left'],
              .prose table th[style*='text-align: left'] {
                text-align: left !important;
              }
              .prose table td[style*='text-align: center'],
              .prose table th[style*='text-align: center'] {
                text-align: center !important;
              }
              .prose table td[style*='text-align: right'],
              .prose table th[style*='text-align: right'] {
                text-align: right !important;
              }
              .prose table td[align='left'],
              .prose table th[align='left'] {
                text-align: left;
              }
              .prose table td[align='center'],
              .prose table th[align='center'] {
                text-align: center;
              }
              .prose table td[align='right'],
              .prose table th[align='right'] {
                text-align: right;
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
              .prose ul[data-type='taskList'] {
                list-style: none;
                padding: 0;
              }
              .prose ul[data-type='taskList'] li {
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
                  ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono',
                  monospace;
              }
              /* Ensure inline styles take precedence */
              .prose [style] {
                /* Inline styles have highest specificity */
              }
              /* Preserve page breaks if they exist in the HTML */
              .prose .page-break {
                page-break-after: always;
                break-after: page;
                margin: 0;
                padding: 0;
                height: 0;
                visibility: hidden;
              }
            `}</style>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="font-poppins text-[#7B8B91]">No preview available</div>
          </div>
        )}
      </div>

      {/* Admin Review Form Modal */}
      {showReviewForm && (
        <AdminReviewForm
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleReviewSubmit}
          isLoading={reviewing}
        />
      )}
    </div>
  );
}
