"use client";

import { useState } from "react";
import { ArrowLeft, Check, X, Edit2, Save, XCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDate } from "@/utils/date";
import { ReportDetailDtoType } from "@/domains/report/types/ReportDetailDtoType";
import reportActions from "@/domains/report/actions";
import CollapsibleSection from "@/components/CollapsibleSection";
import FieldRow from "@/components/FieldRow";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import logger from "@/utils/logger";

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
    reportDetails.referralQuestionsResponse,
  );
  const [dynamicSections, setDynamicSections] = useState(
    reportDetails.dynamicSections,
  );

  const safeValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return String(value);
  };

  const handleApprove = async () => {
    setLoadingAction("approve");
    try {
      await reportActions.updateReportStatus(reportDetails.id, "APPROVED");
      toast.success("Report approved successfully.");
      // Redirect back to case details page
      router.push(`/cases/${reportDetails.booking.examination.id}`);
      router.refresh();
    } catch (error) {
      logger.error("Error approving report:", error);
      toast.error("Failed to approve report. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    setLoadingAction("reject");
    try {
      await reportActions.updateReportStatus(reportDetails.id, "REJECTED");
      toast.success("Report rejected successfully.");
      // Redirect back to case details page
      router.push(`/cases/${reportDetails.booking.examination.id}`);
      router.refresh();
    } catch (error) {
      logger.error("Error rejecting report:", error);
      toast.error("Failed to reject report. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSave = async () => {
    setLoadingAction("save");
    try {
      await reportActions.updateReportContent(reportDetails.id, {
        referralQuestionsResponse,
        dynamicSections: dynamicSections.map((section) => ({
          id: section.id,
          title: section.title,
          content: section.content,
          order: section.order,
        })),
      });
      setIsEditing(false);
      toast.success("Report updated successfully.");
      router.refresh();
    } catch (error) {
      logger.error("Error updating report:", error);
      toast.error("Failed to update report. Please try again.");
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
        title: "",
        content: "",
        order: dynamicSections.length,
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    setDynamicSections(dynamicSections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (
    index: number,
    field: "title" | "content",
    value: string,
  ) => {
    const updated = [...dynamicSections];
    updated[index] = { ...updated[index], [field]: value };
    setDynamicSections(updated);
  };

  const getStatusBadge = () => {
    switch (reportDetails.status) {
      case "SUBMITTED":
        return {
          text: "Submitted",
          className: "border-blue-500 text-blue-700 bg-blue-50",
        };
      case "APPROVED":
        return {
          text: "Approved",
          className: "border-green-500 text-green-700 bg-green-50",
        };
      case "REJECTED":
        return {
          text: "Rejected",
          className: "border-red-500 text-red-700 bg-red-50",
        };
      case "REVIEWED":
        return {
          text: "Reviewed",
          className: "border-purple-500 text-purple-700 bg-purple-50",
        };
      default:
        return {
          text: "Draft",
          className: "border-gray-500 text-gray-700 bg-gray-50",
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <>
      {/* Header with back button and case info */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link
            href={`/cases/${reportDetails.booking.examination.id}`}
            className="flex-shrink-0"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </Link>
          <span className="font-poppins text-lg sm:text-2xl lg:text-3xl font-bold text-black">
            Report Review - {caseNumber}
          </span>
        </div>
        <div
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 border",
            statusBadge.className,
          )}
        >
          {statusBadge.text}
        </div>
      </div>

      {/* Report details content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                : "-"
            }
            type="text"
          />
          <FieldRow
            label="Consent Form Signed"
            value={reportDetails.consentFormSigned ? "Yes" : "No"}
            type="text"
          />
          <FieldRow
            label="LAT Rule Acknowledgment"
            value={reportDetails.latRuleAcknowledgment ? "Yes" : "No"}
            type="text"
          />
          <FieldRow
            label="Confirmation Checked"
            value={reportDetails.confirmationChecked ? "Yes" : "No"}
            type="text"
          />
        </CollapsibleSection>

        {/* Referral Questions Response */}
        <CollapsibleSection title="Referral Questions Response" isOpen={true}>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={referralQuestionsResponse}
                onChange={(e) => setReferralQuestionsResponse(e.target.value)}
                placeholder="Enter referral questions response"
                rows={8}
                className="w-full"
              />
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-[#000080] font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-tight tracking-[-0.03em] break-words">
              {reportDetails.referralQuestionsResponse || "-"}
            </div>
          )}
        </CollapsibleSection>

        {/* Dynamic Sections */}
        <CollapsibleSection title="Dynamic Sections" isOpen={true}>
          {dynamicSections.length === 0 ? (
            <div className="text-gray-500 italic">No dynamic sections</div>
          ) : (
            <div className="space-y-4">
              {dynamicSections.map((section, index) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            handleSectionChange(index, "title", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A8FF]/30 focus:outline-none"
                          placeholder="Enter section title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Section Content
                        </label>
                        <Textarea
                          value={section.content}
                          onChange={(e) =>
                            handleSectionChange(
                              index,
                              "content",
                              e.target.value,
                            )
                          }
                          placeholder="Enter section content"
                          rows={6}
                          className="w-full"
                        />
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(index)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Remove Section
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {section.title}
                      </h4>
                      <div className="whitespace-pre-wrap text-gray-700">
                        {section.content}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
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
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end px-3 sm:px-6 pb-4 sm:pb-6 pt-4 border-t border-gray-200">
          {isEditing ? (
            <>
              <button
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-gray-400 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  lineHeight: "100%",
                  fontSize: "12px",
                }}
                onClick={handleCancel}
                disabled={loadingAction !== null}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-cyan-400 text-cyan-600 bg-white hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  lineHeight: "100%",
                  fontSize: "12px",
                }}
                onClick={handleSave}
                disabled={loadingAction !== null}
              >
                {loadingAction === "save" ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {reportDetails.status === "SUBMITTED" && (
                <>
                  <button
                    className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-cyan-400 text-cyan-600 bg-white hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 400,
                      lineHeight: "100%",
                      fontSize: "12px",
                    }}
                    onClick={() => setIsEditing(true)}
                    disabled={loadingAction !== null}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Report
                  </button>
                  <button
                    className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-green-500 text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 400,
                      lineHeight: "100%",
                      fontSize: "12px",
                    }}
                    onClick={handleApprove}
                    disabled={loadingAction !== null}
                  >
                    {loadingAction === "approve" ? (
                      "Approving..."
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    className="px-3 sm:px-4 py-2 sm:py-3 rounded-full text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 400,
                      lineHeight: "100%",
                      fontSize: "12px",
                    }}
                    onClick={handleReject}
                    disabled={loadingAction !== null}
                  >
                    {loadingAction === "reject" ? (
                      "Rejecting..."
                    ) : (
                      <>
                        <X className="w-4 h-4" />
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
