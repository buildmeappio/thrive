"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DeleteUserModalProps = {
  isOpen: boolean;
  userName?: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const DeleteUserModal = ({
  isOpen,
  userName,
  isDeleting,
  onConfirm,
  onClose,
}: DeleteUserModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isDeleting && onClose()}
    >
      <DialogContent className="max-w-md rounded-3xl p-0">
        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <p className="text-lg font-semibold text-gray-900">Delete User</p>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete {userName || "this user"}? This
              action cannot be undone.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              className="rounded-full border border-gray-300 px-6"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              className="rounded-full bg-red-500 hover:bg-red-600 px-6 text-white"
              onClick={onConfirm}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserModal;
