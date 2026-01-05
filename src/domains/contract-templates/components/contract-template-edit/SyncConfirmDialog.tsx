"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw } from "lucide-react";

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
    <Dialog
      open={open}
      onOpenChange={(value) => !isSyncing && onOpenChange(value)}
    >
      <DialogContent className="sm:max-w-[450px] rounded-2xl sm:rounded-[24px] p-0 gap-0 overflow-hidden">
        {isSyncing ? (
          /* Loading State */
          <div className="px-6 py-10 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] font-degular mb-2">
              Syncing Content
            </h3>
            <p className="text-sm text-gray-500 font-poppins text-center">
              Fetching latest content from Google Docs...
            </p>
          </div>
        ) : (
          /* Confirmation State */
          <>
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle className="flex items-center gap-3 text-[#1A1A1A] font-degular text-xl sm:text-[22px] font-semibold">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#00A8FF]/20 to-[#01F4C8]/20">
                  <RefreshCw className="h-5 w-5 text-[#00A8FF]" />
                </div>
                Sync from Google Docs
              </DialogTitle>
              <DialogDescription className="pt-4 text-left font-poppins text-[15px] text-gray-600 leading-relaxed">
                This will replace the current editor content with the content
                from Google Docs.
                <span className="block mt-3 font-medium text-amber-700 bg-amber-50 px-3 py-2.5 rounded-lg border border-amber-100">
                  ⚠️ Any unsaved changes in the editor will be lost.
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="h-11 px-6 rounded-full border-[#E5E5E5] text-[#1A1A1A] hover:bg-gray-50 font-poppins font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="h-11 px-6 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 font-poppins font-semibold shadow-sm transition-all"
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
