"use client";

import { useReportStore } from "../state/useReportStore";
import { ReportActionsProps } from "../types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ReportActions({
  onSaveDraft,
  onPrint,
  isSubmitting,
}: ReportActionsProps) {
  const { isSaving } = useReportStore();

  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button
        onClick={onSaveDraft}
        disabled={isSaving}
        variant="outline"
        className="h-[48px] px-8 rounded-[24px] cursor-pointer border-2 border-[#00A8FF] bg-white text-[#00A8FF] font-medium hover:bg-[#F0F8FF] transition-colors font-poppins">
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save as draft"
        )}
      </Button>

      <Button
        onClick={onPrint}
        disabled={isSubmitting}
        className="h-[48px] px-8 rounded-[24px] cursor-pointer bg-[#00A8FF] hover:bg-[#00A8FF]/90 text-white font-medium font-poppins">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Print Now"
        )}
      </Button>
    </div>
  );
}
