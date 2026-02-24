'use client';

import { useReportStore } from '../state/useReportStore';
import { ReportActionsProps } from '../types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ReportActions({ onSaveDraft, onPrint, isSubmitting }: ReportActionsProps) {
  const { isSaving } = useReportStore();

  return (
    <div className="mt-6 flex justify-end gap-4">
      <Button
        onClick={onSaveDraft}
        disabled={isSaving}
        variant="outline"
        className="font-poppins h-[48px] cursor-pointer rounded-[24px] border-2 border-[#00A8FF] bg-white px-8 font-medium text-[#00A8FF] transition-colors hover:bg-[#F0F8FF]"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save as draft'
        )}
      </Button>

      <Button
        onClick={onPrint}
        disabled={isSubmitting}
        className="font-poppins h-[48px] cursor-pointer rounded-[24px] bg-[#00A8FF] px-8 font-medium text-white hover:bg-[#00A8FF]/90"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Print Now'
        )}
      </Button>
    </div>
  );
}
