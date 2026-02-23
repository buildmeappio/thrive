import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateBookingStatusAction } from "../../server/actions/updateBookingStatus";
import { getDocumentPresignedUrlAction } from "../../server/actions/getDocumentPresignedUrl";
import { CaseDetailsData } from "../../types";

type UseCaseDetailsHandlersProps = {
  data: CaseDetailsData;
  examinerProfileId: string;
};

export function useCaseDetailsHandlers({
  data,
  examinerProfileId,
}: UseCaseDetailsHandlersProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");

  const handleAction = async (
    status: "ACCEPT" | "DECLINE",
    message?: string,
  ) => {
    setIsLoading(true);
    try {
      const result = await updateBookingStatusAction({
        bookingId: data.bookingId,
        examinerProfileId,
        status,
        message,
      });

      if (result.success) {
        toast.success(result.message || "Action completed successfully");

        // Close modals first
        setIsDeclineModalOpen(false);

        // Refresh the page to show updated status
        router.refresh();

        // Only redirect to appointments page when declining
        if (status === "DECLINE") {
          router.push("/appointments");
        }
        // When accepting, stay on the current page (badges and buttons will update via refresh)
      } else {
        toast.error(result.message || "Failed to complete action");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = (reason: string) => {
    handleAction("DECLINE", reason);
  };

  const handlePreview = async (documentName: string, displayName?: string) => {
    try {
      const result = await getDocumentPresignedUrlAction(documentName);
      if (result.success && result.url) {
        setPreviewFileName(displayName || documentName);
        setPreviewUrl(result.url);
      } else {
        toast.error(result.error || "Failed to generate preview URL");
      }
    } catch {
      toast.error("An error occurred while generating preview URL");
    }
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewFileName("");
  };

  const handleDownload = async (documentName: string, displayName: string) => {
    try {
      const result = await getDocumentPresignedUrlAction(documentName);
      if (result.success && result.url) {
        const link = document.createElement("a");
        link.href = result.url;
        link.download = displayName || documentName;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(result.error || "Failed to generate download URL");
      }
    } catch {
      toast.error("An error occurred while generating download URL");
    }
  };

  return {
    isLoading,
    isDeclineModalOpen,
    previewUrl,
    previewFileName,
    setIsDeclineModalOpen,
    handleAction,
    handleDecline,
    handlePreview,
    closePreview,
    handleDownload,
  };
}
