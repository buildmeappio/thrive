"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FeeStructureStatus } from "@prisma/client";
import { ArrowLeft, Save, CheckCircle, Archive } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatusBadge from "./StatusBadge";
import WarningBanner from "./WarningBanner";
import FeeVariablesTable from "./FeeVariablesTable";
import { FeeStructureData } from "../types/feeStructure.types";
import {
  updateFeeStructureAction,
  activateFeeStructureAction,
  archiveFeeStructureAction,
} from "../actions";

type FeeStructureFormProps = {
  feeStructure: FeeStructureData;
};

export default function FeeStructureForm({
  feeStructure,
}: FeeStructureFormProps) {
  const router = useRouter();
  const [name, setName] = useState(feeStructure.name);
  const [description, setDescription] = useState(
    feeStructure.description || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activationErrors, setActivationErrors] = useState<
    Record<string, string>
  >({});

  const isReadOnly = feeStructure.status === FeeStructureStatus.ARCHIVED;
  const isActive = feeStructure.status === FeeStructureStatus.ACTIVE;
  const isDraft = feeStructure.status === FeeStructureStatus.DRAFT;

  const isDirty =
    name.trim() !== feeStructure.name.trim() ||
    (description.trim() || "") !== (feeStructure.description?.trim() || "");

  // Reset form when feeStructure changes
  useEffect(() => {
    setName(feeStructure.name);
    setDescription(feeStructure.description || "");
    setFieldErrors({});
    setActivationErrors({});
  }, [feeStructure]);

  const handleSave = async () => {
    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await updateFeeStructureAction({
        id: feeStructure.id,
        name: name.trim(),
        description: description.trim() || undefined,
      });

      if (result.success) {
        toast.success("Fee structure saved successfully");
        router.refresh();
      } else {
        const errorResult = result as {
          success: false;
          error: string;
          fieldErrors?: Record<string, string>;
        };
        toast.error(errorResult.error || "Failed to save fee structure");
        if (errorResult.fieldErrors) {
          setFieldErrors(errorResult.fieldErrors);
        }
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    setActivationErrors({});

    try {
      const result = await activateFeeStructureAction(feeStructure.id);

      if (result.success) {
        toast.success("Fee structure activated successfully");
        router.refresh();
      } else {
        const errorResult = result as {
          success: false;
          error: string;
          fieldErrors?: Record<string, string>;
        };
        toast.error(errorResult.error || "Failed to activate fee structure");
        if (errorResult.fieldErrors) {
          setActivationErrors(errorResult.fieldErrors);
        }
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsActivating(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);

    try {
      const result = await archiveFeeStructureAction(feeStructure.id);

      if (result.success) {
        toast.success("Fee structure archived successfully");
        router.push("/dashboard/fee-structures");
      } else {
        const errorResult = result as { success: false; error: string };
        toast.error(errorResult.error || "Failed to archive fee structure");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 dashboard-zoom-mobile flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => router.push("/dashboard/fee-structures")}
            className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight wrap-break-word">
              {feeStructure.name}
            </h1>
            <StatusBadge status={feeStructure.status} />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0 flex-wrap">
          {!isReadOnly && (
            <>
              <Button
                variant="outline"
                onClick={() => setArchiveDialogOpen(true)}
                disabled={isArchiving}
                className="rounded-full border-gray-200 hover:bg-gray-50"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
              {isDraft && (
                <Button
                  onClick={handleActivate}
                  disabled={isActivating || isDirty}
                  className="rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 transition-opacity font-semibold"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isActivating ? "Activating..." : "Activate"}
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="rounded-full bg-[#000080] hover:bg-[#000093] text-white font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Warning Banner for Active */}
      {isActive && <WarningBanner />}

      {/* Activation Errors */}
      {Object.keys(activationErrors).length > 0 && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Cannot activate: Please fix the following errors
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(activationErrors).map(([key, message]) => (
              <li key={key} className="text-sm text-red-700">
                <span className="font-medium">{key}:</span> {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Information Card */}
      <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 font-degular">
          Basic Information
        </h2>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="font-poppins">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter fee structure name"
              disabled={isReadOnly}
              maxLength={255}
              className="mt-0 rounded-[14px] border-gray-200 font-poppins"
            />
            {fieldErrors.name && (
              <p className="text-sm text-red-500 font-poppins">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="font-poppins">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter an optional description"
              disabled={isReadOnly}
              rows={3}
              className="rounded-[14px] border-gray-200 font-poppins"
            />
            {fieldErrors.description && (
              <p className="text-sm text-red-500 font-poppins">
                {fieldErrors.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Fee Variables Card */}
      <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 sm:p-6">
        <FeeVariablesTable
          feeStructureId={feeStructure.id}
          variables={feeStructure.variables}
          isReadOnly={isReadOnly}
        />
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Fee Structure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive{" "}
              <strong>{feeStructure.name}</strong>? Archived fee structures
              cannot be edited and will no longer appear in the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isArchiving}
              className="bg-gray-600 hover:bg-gray-700"
            >
              {isArchiving ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
