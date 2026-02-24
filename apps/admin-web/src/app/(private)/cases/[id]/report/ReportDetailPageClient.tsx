'use client';

import { useState } from 'react';
import { ArrowLeft, Check, X, Edit2, Save, XCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatDate } from '@/utils/date';
import { ReportDetailDtoType } from '@/domains/report/types/ReportDetailDtoType';
import reportActions from '@/domains/report/actions';
import CollapsibleSection from '@/components/CollapsibleSection';
import FieldRow from '@/components/FieldRow';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import logger from '@/utils/logger';

interface ReportDetailPageClientProps {
  reportDetails: ReportDetailDtoType;
  caseNumber: string;
}

export default function ReportDetailPageClient({
  reportDetails,
  caseNumber,
}: ReportDetailPageClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [referralQuestionsResponse, setReferralQuestionsResponse] = useState(
    reportDetails.referralQuestionsResponse
  );
  const [dynamicSections, setDynamicSections] = useState(reportDetails.dynamicSections);

  const safeValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  };

  const handleApprove = async () => {
    setLoadingAction('approve');
    try {
      await reportActions.updateReportStatus(reportDetails.id, 'APPROVED');
      toast.success('Report approved successfully.');
      // Redirect back to case details page
      router.push(`/cases/${reportDetails.booking.examination.id}`);
      router.refresh();
    } catch (error) {
      logger.error('Error approving report:', error);
      toast.error('Failed to approve report. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    setLoadingAction('reject');
    try {
      await reportActions.updateReportStatus(reportDetails.id, 'REJECTED');
      toast.success('Report rejected successfully.');
      // Redirect back to case details page
      router.push(`/cases/${reportDetails.booking.examination.id}`);
      router.refresh();
    } catch (error) {
      logger.error('Error rejecting report:', error);
      toast.error('Failed to reject report. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSave = async () => {
    setLoadingAction('save');
    try {
      await reportActions.updateReportContent(reportDetails.id, {
        referralQuestionsResponse,
        dynamicSections: dynamicSections.map(section => ({
          id: section.id,
          title: section.title,
          content: section.content,
          order: section.order,
        })),
      });
      setIsEditing(false);
      toast.success('Report updated successfully.');
      router.refresh();
    } catch (error) {
      logger.error('Error updating report:', error);
      toast.error('Failed to update report. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancel = () => {
    setReferralQuestionsResponse(reportDetails.referralQuestionsResponse);
    setDynamicSections(reportDetails.dynamicSections);
    setIsEditing(false);
  };

  const handleAddSection = () => {
    setDynamicSections([
      ...dynamicSections,
      {
        id: `new-${Date.now()}`,
        title: '',
        content: '',
        order: dynamicSections.length,
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    setDynamicSections(dynamicSections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (index: number, field: 'title' | 'content', value: string) => {
    const updated = [...dynamicSections];
    updated[index] = { ...updated[index], [field]: value };
    setDynamicSections(updated);
  };

  const getStatusBadge = () => {
    switch (reportDetails.status) {
      case 'SUBMITTED':
        return {
          text: 'Submitted',
          className: 'border-blue-500 text-blue-700 bg-blue-50',
        };
      case 'APPROVED':
        return {
          text: 'Approved',
          className: 'border-green-500 text-green-700 bg-green-50',
        };
      case 'REJECTED':
        return {
          text: 'Rejected',
          className: 'border-red-500 text-red-700 bg-red-50',
        };
      case 'REVIEWED':
        return {
          text: 'Reviewed',
          className: 'border-purple-500 text-purple-700 bg-purple-50',
        };
      default:
        return {
          text: 'Draft',
          className: 'border-gray-500 text-gray-700 bg-gray-50',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <>
      {/* Header with back button and case info */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <Link href={`/cases/${reportDetails.booking.examination.id}`} className="flex-shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
              <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
            </div>
          </Link>
          <span className="font-poppins text-lg font-bold text-black sm:text-2xl lg:text-3xl">
            Report Review - {caseNumber}
          </span>
        </div>
        <div
          className={cn(
            'flex-shrink-0 rounded-full border px-4 py-2 text-sm font-semibold',
            statusBadge.className
          )}
        >
          {statusBadge.text}
        </div>
      </div>

      {/* Report details content */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Report Information */}
        <CollapsibleSection title="Report Information" isOpen={true}>
          <FieldRow
            label="Examiner Name"
            value={safeValue(reportDetails.examinerName)}
            type="text"
          />
          <FieldRow
            label="Professional Title"
            value={safeValue(reportDetails.professionalTitle)}
            type="text"
          />
          <FieldRow
            label="Date of Report"
            value={
              reportDetails.dateOfReport
                ? formatDate(reportDetails.dateOfReport.toISOString())
                : '-'
            }
            type="text"
          />
          <FieldRow
            label="Consent Form Signed"
            value={reportDetails.consentFormSigned ? 'Yes' : 'No'}
            type="text"
          />
          <FieldRow
            label="LAT Rule Acknowledgment"
            value={reportDetails.latRuleAcknowledgment ? 'Yes' : 'No'}
            type="text"
          />
          <FieldRow
            label="Confirmation Checked"
            value={reportDetails.confirmationChecked ? 'Yes' : 'No'}
            type="text"
          />
        </CollapsibleSection>

        {/* Referral Questions Response */}
        <CollapsibleSection title="Referral Questions Response" isOpen={true}>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={referralQuestionsResponse}
                onChange={e => setReferralQuestionsResponse(e.target.value)}
                placeholder="Enter referral questions response"
                rows={8}
                className="w-full"
              />
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words font-[Poppins] text-[14px] font-[400] leading-tight tracking-[-0.03em] text-[#000080] sm:text-[16px]">
              {reportDetails.referralQuestionsResponse || '-'}
            </div>
          )}
        </CollapsibleSection>

        {/* Dynamic Sections */}
        <CollapsibleSection title="Dynamic Sections" isOpen={true}>
          {dynamicSections.length === 0 ? (
            <div className="italic text-gray-500">No dynamic sections</div>
          ) : (
            <div className="space-y-4">
              {dynamicSections.map((section, index) => (
                <div key={section.id} className="space-y-3 rounded-lg border border-gray-200 p-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={e => handleSectionChange(index, 'title', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/30"
                          placeholder="Enter section title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Section Content
                        </label>
                        <Textarea
                          value={section.content}
                          onChange={e => handleSectionChange(index, 'content', e.target.value)}
                          placeholder="Enter section content"
                          rows={6}
                          className="w-full"
                        />
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(index)}
                          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                          Remove Section
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
                      <div className="whitespace-pre-wrap text-gray-700">{section.content}</div>
                    </>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add New Section
                </button>
              )}
            </div>
          )}
        </CollapsibleSection>

        {/* Referral Documents */}
        <CollapsibleSection title="Referral Documents">
          {reportDetails.referralDocuments.length === 0 ? (
            <FieldRow label="No documents" value="-" type="text" />
          ) : (
            reportDetails.referralDocuments.map((rd, index) => (
              <FieldRow
                key={rd.id || index}
                label={safeValue(rd.document.name)}
                value={safeValue(rd.document.name)}
                type="document"
                documentUrl={rd.document.url || undefined}
              />
            ))
          )}
        </CollapsibleSection>

        {/* Action Buttons */}
        <div className="flex flex-col justify-end gap-3 border-t border-gray-200 px-3 pb-4 pt-4 sm:flex-row sm:flex-wrap sm:px-6 sm:pb-6">
          {isEditing ? (
            <>
              <button
                className="flex items-center gap-2 rounded-full border border-gray-400 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  lineHeight: '100%',
                  fontSize: '12px',
                }}
                onClick={handleCancel}
                disabled={loadingAction !== null}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded-full border border-cyan-400 bg-white px-3 py-2 text-cyan-600 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  lineHeight: '100%',
                  fontSize: '12px',
                }}
                onClick={handleSave}
                disabled={loadingAction !== null}
              >
                {loadingAction === 'save' ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {reportDetails.status === 'SUBMITTED' && (
                <>
                  <button
                    className="flex items-center gap-2 rounded-full border border-cyan-400 bg-white px-3 py-2 text-cyan-600 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      lineHeight: '100%',
                      fontSize: '12px',
                    }}
                    onClick={() => setIsEditing(true)}
                    disabled={loadingAction !== null}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Report
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-full border border-green-500 bg-green-50 px-3 py-2 text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      lineHeight: '100%',
                      fontSize: '12px',
                    }}
                    onClick={handleApprove}
                    disabled={loadingAction !== null}
                  >
                    {loadingAction === 'approve' ? (
                      'Approving...'
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-full bg-red-700 px-3 py-2 text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 400,
                      lineHeight: '100%',
                      fontSize: '12px',
                    }}
                    onClick={handleReject}
                    disabled={loadingAction !== null}
                  >
                    {loadingAction === 'reject' ? (
                      'Rejecting...'
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        Reject
                      </>
                    )}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
