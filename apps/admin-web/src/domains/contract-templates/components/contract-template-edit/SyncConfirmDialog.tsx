'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, RefreshCw } from 'lucide-react';

type SyncConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSyncing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SyncConfirmDialog({
  open,
  onOpenChange,
  isSyncing,
  onCancel,
  onConfirm,
}: SyncConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={value => !isSyncing && onOpenChange(value)}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[450px] sm:rounded-[24px]">
        {isSyncing ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center px-6 py-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <h3 className="font-degular mb-2 text-lg font-semibold text-[#1A1A1A]">
              Syncing Content
            </h3>
            <p className="font-poppins text-center text-sm text-gray-500">
              Fetching latest content from Google Docs...
            </p>
          </div>
        ) : (
          /* Confirmation State */
          <>
            <DialogHeader className="px-6 pb-4 pt-6">
              <DialogTitle className="font-degular flex items-center gap-3 text-xl font-semibold text-[#1A1A1A] sm:text-[22px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF]/20 to-[#01F4C8]/20">
                  <RefreshCw className="h-5 w-5 text-[#00A8FF]" />
                </div>
                Sync from Google Docs
              </DialogTitle>
              <DialogDescription className="font-poppins pt-4 text-left text-[15px] leading-relaxed text-gray-600">
                This will replace the current editor content with the content from Google Docs.
                <span className="mt-3 block rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5 font-medium text-amber-700">
                  ⚠️ Any unsaved changes in the editor will be lost.
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col-reverse gap-3 px-6 pb-6 pt-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={onCancel}
                className="font-poppins h-11 rounded-full border-[#E5E5E5] px-6 font-medium text-[#1A1A1A] hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="font-poppins h-11 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-6 font-semibold text-white shadow-sm transition-all hover:opacity-90"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Content
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
