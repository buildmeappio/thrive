"use client";

import { toast } from "sonner";
import logger from "@/utils/logger";
/**
 * ConfirmationToast Component
 *
 * A reusable confirmation toast component using Sonner that provides
 * action and cancel buttons for user confirmations.
 *
 * @example
 * // Basic usage
 * showConfirmationToast({
 *   title: "Are you sure?",
 *   description: "This action cannot be undone.",
 *   onConfirm: () => logger.log("Confirmed", "Confirmed"),
 * });
 *
 * @example
 * // Delete confirmation
 * showDeleteConfirmation("My Item", async () => {
 *   await deleteItem();
 * });
 *
 * @example
 * // Warning confirmation
 * showWarningConfirmation(
 *   "Proceed with caution",
 *   "This will affect multiple records.",
 *   () => logger.log("Proceeded")
 * );
 */

interface ConfirmationToastProps {
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  duration?: number;
  type?: "error" | "warning" | "info";
}

export const showConfirmationToast = ({
  title,
  description,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  duration = 10000,
  type = "error",
}: ConfirmationToastProps) => {
  const toastFunction =
    type === "error"
      ? toast.error
      : type === "warning"
      ? toast.warning
      : toast.info;

  return toastFunction(title, {
    description,
    action: {
      label: confirmLabel,
      onClick: async () => {
        try {
          await onConfirm();
        } catch (error) {
          logger.error("Confirmation action failed:", error);
        }
      },
    },
    cancel: {
      label: cancelLabel,
      onClick: () => {
        toast.dismiss();
      },
    },
    duration,
  });
};

// Convenience functions for common use cases
export const showDeleteConfirmation = (
  itemName: string,
  onDelete: () => void | Promise<void>,
  options?: Partial<ConfirmationToastProps>
) => {
  return showConfirmationToast({
    title: `Delete "${itemName}"?`,
    description: "This action cannot be undone.",
    onConfirm: onDelete,
    confirmLabel: "Delete",
    type: "error",
    ...options,
  });
};

export const showWarningConfirmation = (
  title: string,
  description: string,
  onConfirm: () => void | Promise<void>,
  options?: Partial<ConfirmationToastProps>
) => {
  return showConfirmationToast({
    title,
    description,
    onConfirm,
    confirmLabel: "Proceed",
    type: "warning",
    ...options,
  });
};

export const showInfoConfirmation = (
  title: string,
  description: string,
  onConfirm: () => void | Promise<void>,
  options?: Partial<ConfirmationToastProps>
) => {
  return showConfirmationToast({
    title,
    description,
    onConfirm,
    confirmLabel: "Continue",
    type: "info",
    ...options,
  });
};
