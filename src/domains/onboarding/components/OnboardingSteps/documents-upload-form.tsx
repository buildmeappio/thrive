"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { MultipleFileUploadInput } from "@/components";
import { DocumentFile, ExistingDocument } from "@/components/FileUploadInput";
import {
  uploadDocumentAction,
  getDocumentByIdAction,
} from "../../server/actions";
import { updateDocumentsAction } from "../../server/actions/updateDocuments";
import type { DocumentsUploadFormProps } from "../../types";

const DocumentsUploadForm: React.FC<DocumentsUploadFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
}) => {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [allFiles, setAllFiles] = useState<DocumentFile[]>([]);

  // Load existing documents from initialData
  useEffect(() => {
    const loadExistingDocuments = async () => {
      const existingDocs: ExistingDocument[] = [];

      // Load medical license documents
      if (initialData?.medicalLicenseDocumentIds?.length) {
        const medicalLicenseDocs = await Promise.all(
          initialData.medicalLicenseDocumentIds.map(async (id) => {
            const result = await getDocumentByIdAction(id);
            if (result.success && result.data) {
              return {
                id,
                name: result.data.name,
                displayName: result.data.displayName || result.data.name,
                type: result.data.name.split(".").pop() || "pdf",
                size: result.data.size || 0,
                isExisting: true as const,
                isFromDatabase: true as const, // Mark as loaded from database
              };
            }
            return null;
          }),
        );
        existingDocs.push(
          ...(medicalLicenseDocs.filter((doc) => doc !== null) as ExistingDocument[]),
        );
      }

      // Load government ID
      if (initialData?.governmentIdDocumentId) {
        const result = await getDocumentByIdAction(
          initialData.governmentIdDocumentId,
        );
        if (result.success && result.data) {
          existingDocs.push({
            id: initialData.governmentIdDocumentId,
            name: result.data.name,
            displayName: result.data.displayName || result.data.name,
            type: result.data.name.split(".").pop() || "pdf",
            size: result.data.size || 0,
            isExisting: true as const,
            isFromDatabase: true as const, // Mark as loaded from database
          });
        }
      }

      // Load CV/Resume
      if (initialData?.resumeDocumentId) {
        const result = await getDocumentByIdAction(initialData.resumeDocumentId);
        if (result.success && result.data) {
          existingDocs.push({
            id: initialData.resumeDocumentId,
            name: result.data.name,
            displayName: result.data.displayName || result.data.name,
            type: result.data.name.split(".").pop() || "pdf",
            size: result.data.size || 0,
            isExisting: true as const,
            isFromDatabase: true as const, // Mark as loaded from database
          });
        }
      }

      // Load insurance
      if (initialData?.insuranceDocumentId) {
        const result = await getDocumentByIdAction(
          initialData.insuranceDocumentId,
        );
        if (result.success && result.data) {
          existingDocs.push({
            id: initialData.insuranceDocumentId,
            name: result.data.name,
            displayName: result.data.displayName || result.data.name,
            type: result.data.name.split(".").pop() || "pdf",
            size: result.data.size || 0,
            isExisting: true as const,
            isFromDatabase: true as const, // Mark as loaded from database
          });
        }
      }

      // Load specialty certificates
      if (initialData?.specialtyCertificatesDocumentIds?.length) {
        const specialtyDocs = await Promise.all(
          initialData.specialtyCertificatesDocumentIds.map(async (id) => {
            const result = await getDocumentByIdAction(id);
            if (result.success && result.data) {
              return {
                id,
                name: result.data.name,
                displayName: result.data.displayName || result.data.name,
                type: result.data.name.split(".").pop() || "pdf",
                size: result.data.size || 0,
                isExisting: true as const,
                isFromDatabase: true as const, // Mark as loaded from database
              };
            }
            return null;
          }),
        );
        existingDocs.push(
          ...(specialtyDocs.filter((doc) => doc !== null) as ExistingDocument[]),
        );
      }

      setAllFiles(existingDocs);
    };

    loadExistingDocuments();
  }, [initialData]);

  // Handle file changes - just update state, don't upload to S3 yet
  const handleFileChange = (files: DocumentFile[]) => {
    // Simply update the state - files will be uploaded when "Mark as Complete" is clicked
    setAllFiles(files);
  };

  const handleSubmit = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    // Check if at least one document is uploaded
    if (allFiles.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    setLoading(true);
    try {
      // Separate existing documents from new files
      const existingDocs = allFiles.filter(
        (file): file is ExistingDocument =>
          file !== null &&
          typeof file === "object" &&
          "isExisting" in file &&
          file.isExisting === true,
      );

      const newFiles = allFiles.filter(
        (file): file is File => file instanceof File,
      );

      // Upload new files to S3 first
      const uploadedDocs: ExistingDocument[] = [];
      if (newFiles.length > 0) {
        for (const file of newFiles) {
          const result = await uploadDocumentAction(file);
          if (result.success && result.data) {
            uploadedDocs.push({
              id: result.data.id,
              name: result.data.name,
              displayName: file.name,
              type: file.type || result.data.name.split(".").pop() || "pdf",
              size: result.data.size || file.size,
              isExisting: true as const,
              isFromDatabase: false as const,
            });
          } else {
            throw new Error(
              (!result.success && "message" in result ? result.message : undefined) || `Failed to upload ${file.name}`,
            );
          }
        }
      }

      // Combine existing and newly uploaded documents
      const allDocs = [...existingDocs, ...uploadedDocs];

      // Extract document IDs and categorize based on displayName
      const medicalLicenseIds: string[] = [];
      let governmentIdId: string | undefined;
      let cvResumeId: string | undefined;
      let insuranceId: string | undefined;
      const specialtyCertificatesIds: string[] = [];

      allDocs.forEach((file) => {
        // Categorize based on displayName (set when loading existing docs)
        const displayName = file.displayName?.toLowerCase() || "";
        if (displayName.includes("medical license")) {
          medicalLicenseIds.push(file.id);
        } else if (displayName.includes("government id")) {
          governmentIdId = file.id;
        } else if (displayName.includes("cv") || displayName.includes("resume")) {
          cvResumeId = file.id;
        } else if (displayName.includes("insurance")) {
          insuranceId = file.id;
        } else if (displayName.includes("specialty")) {
          specialtyCertificatesIds.push(file.id);
        } else {
          // For new files without displayName, default to medical license
          medicalLicenseIds.push(file.id);
        }
      });

      // Save document IDs to profile
      const result = await updateDocumentsAction({
        examinerProfileId,
        medicalLicenseDocumentIds: medicalLicenseIds,
        governmentIdDocumentId: governmentIdId,
        resumeDocumentId: cvResumeId,
        insuranceDocumentId: insuranceId,
        specialtyCertificatesDocumentIds: specialtyCertificatesIds,
        activationStep: "documents",
      });

      if (result.success) {
        toast.success("Documents uploaded successfully");
        onComplete();

        // Update session to refresh JWT token with new activationStep
        await update();
      } else {
        toast.error(result.message || "Failed to save documents");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-medium">Upload Verification Documents</h2>
        <Button
          type="button"
          onClick={handleSubmit}
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0"
          disabled={loading || allFiles.length === 0}
        >
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      {/* Single Upload Area */}
      <div className="mt-8">
        <MultipleFileUploadInput
          name="documents"
          label="Required Documents"
          value={allFiles}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          required
          placeholder="Click to upload or drag and drop files here"
          showIcon={true}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default DocumentsUploadForm;
