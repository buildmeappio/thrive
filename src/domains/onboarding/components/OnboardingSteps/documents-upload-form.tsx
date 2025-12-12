"use client";
import React, { useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CircleCheck, Upload, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  uploadDocumentAction,
  getDocumentByIdAction,
} from "../../server/actions";
import { getExaminerDocumentPresignedUrlAction } from "@/domains/auth/server/actions/getExaminerDocumentPresignedUrl";
import DocumentPreviewModal from "./DocumentPreviewModal";
import type { DocumentsUploadFormProps } from "../../types";

type DocumentType =
  | "medicalLicense"
  | "governmentId"
  | "cvResume"
  | "insurance"
  | "specialtyCertificates";

interface DocumentStatus {
  id?: string;
  name?: string; // Document name (S3 filename) for fetching presigned URLs
  url?: string; // CDN URL (if available)
  fileType?: string; // File type (pdf, jpg, png, etc.) for preview
  uploaded: boolean;
  uploading: boolean;
  file?: File;
}

const DOCUMENT_TYPES: Array<{
  id: DocumentType;
  label: string;
  required: boolean;
  fieldName: string;
}> = [
  {
    id: "medicalLicense",
    label: "Medical License",
    required: true,
    fieldName: "medicalLicenseDocumentIds",
  },
  {
    id: "governmentId",
    label: "Government ID",
    required: true,
    fieldName: "governmentIdDocumentId",
  },
  {
    id: "cvResume",
    label: "CV / Resume",
    required: true,
    fieldName: "resumeDocumentId",
  },
  {
    id: "insurance",
    label: "Professional Liability Insurance",
    required: true,
    fieldName: "insuranceDocumentId",
  },
  {
    id: "specialtyCertificates",
    label: "Specialty Certificates (if applicable)",
    required: false,
    fieldName: "specialtyCertificatesDocumentIds",
  },
];

const DocumentsUploadForm: React.FC<DocumentsUploadFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
}) => {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeDocumentType, setActiveDocumentType] =
    useState<DocumentType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [previewFileType, setPreviewFileType] = useState<string>("");

  const [documents, setDocuments] = useState<
    Record<DocumentType, DocumentStatus>
  >({
    medicalLicense: {
      uploaded: !!initialData?.medicalLicenseDocumentIds?.length,
      uploading: false,
      id: initialData?.medicalLicenseDocumentIds?.[0],
    },
    governmentId: {
      uploaded: !!initialData?.governmentIdDocumentId,
      uploading: false,
      id: initialData?.governmentIdDocumentId,
    },
    cvResume: {
      uploaded: !!initialData?.resumeDocumentId,
      uploading: false,
      id: initialData?.resumeDocumentId,
    },
    insurance: {
      uploaded: !!initialData?.insuranceDocumentId,
      uploading: false,
      id: initialData?.insuranceDocumentId,
    },
    specialtyCertificates: {
      uploaded: false,
      uploading: false,
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File, documentType: DocumentType) => {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      if (file.size > maxSize) {
        toast.error(`File size exceeds maximum of 10 MB`);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPG, and PNG files are allowed");
        return;
      }

      // Update state to show uploading
      setDocuments((prev) => ({
        ...prev,
        [documentType]: {
          ...prev[documentType],
          uploading: true,
          file,
        },
      }));

      try {
        // Upload file using server action
        const result = await uploadDocumentAction(file);

        if (result.success && result.data) {
          // Extract file type from original name or type
          const fileType = file.type.includes("pdf")
            ? "pdf"
            : file.type.includes("jpeg") || file.type.includes("jpg")
              ? "jpg"
              : file.type.includes("png")
                ? "png"
                : file.name.toLowerCase().match(/\.(pdf|jpg|jpeg|png)$/)?.[1] ||
                  "pdf";

          setDocuments((prev) => ({
            ...prev,
            [documentType]: {
              uploaded: true,
              uploading: false,
              id: result.data.id,
              name: result.data.name, // Store S3 filename for presigned URL generation
              url: result.data.url, // CDN URL if available
              fileType, // Store file type for preview
            },
          }));

          toast.success(
            `${DOCUMENT_TYPES.find((d) => d.id === documentType)?.label} uploaded successfully`,
          );
        } else {
          throw new Error(!result.success ? result.message : "Upload failed");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload document",
        );
        setDocuments((prev) => ({
          ...prev,
          [documentType]: {
            ...prev[documentType],
            uploading: false,
            file: undefined,
          },
        }));
      }
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!activeDocumentType) {
        toast.error("Please select a document type first");
        return;
      }

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0], activeDocumentType);
      }
    },
    [activeDocumentType, handleFileSelect],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocumentType) {
      handleFileSelect(file, activeDocumentType);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReplace = (documentType: DocumentType) => {
    setActiveDocumentType(documentType);
    fileInputRef.current?.click();
  };

  const handleView = async (doc: DocumentStatus, docType: DocumentType) => {
    const docLabel =
      DOCUMENT_TYPES.find((d) => d.id === docType)?.label || "Document";

    // If we have a CDN URL, use it directly
    if (doc.url) {
      setPreviewFileName(docLabel);
      setPreviewUrl(doc.url);
      // Use stored file type or try to determine from document name
      const fileType =
        doc.fileType ||
        doc.name?.toLowerCase().match(/\.(pdf|jpg|jpeg|png)$/)?.[1] ||
        "pdf";
      setPreviewFileType(fileType);
      return;
    }

    // If we have a document name, fetch presigned URL
    if (doc.name) {
      try {
        const result = await getExaminerDocumentPresignedUrlAction(doc.name);
        if (result.success && result.url) {
          setPreviewFileName(docLabel);
          setPreviewUrl(result.url);
          // Use stored file type or determine from document name
          const fileType =
            doc.fileType ||
            doc.name.toLowerCase().match(/\.(pdf|jpg|jpeg|png)$/)?.[1] ||
            "pdf";
          setPreviewFileType(fileType);
        } else {
          toast.error(result.error || "Failed to generate document URL");
        }
      } catch (error) {
        toast.error("Failed to view document. Please try again.");
        console.error("Error fetching presigned URL:", error);
      }
      return;
    }

    // If we have document ID but no name, fetch the document first to get the name
    if (doc.id) {
      try {
        const docResult = await getDocumentByIdAction(doc.id);
        if (docResult.success && docResult.data) {
          // Now fetch the presigned URL using the document name
          const urlResult = await getExaminerDocumentPresignedUrlAction(
            docResult.data.name,
          );
          if (urlResult.success && urlResult.url) {
            setPreviewFileName(docLabel);
            setPreviewUrl(urlResult.url);
            // Determine file type from document name
            const fileType =
              docResult.data.name
                .toLowerCase()
                .match(/\.(pdf|jpg|jpeg|png)$/)?.[1] || "pdf";
            setPreviewFileType(fileType);
            // Update state to cache the name and file type for future views
            setDocuments((prev) => ({
              ...prev,
              [docType]: {
                ...prev[docType],
                name: docResult.data!.name,
                fileType,
              },
            }));
          } else {
            toast.error(urlResult.error || "Failed to generate document URL");
          }
        } else {
          toast.error(docResult.error || "Document not found");
        }
      } catch (error) {
        toast.error("Failed to view document. Please try again.");
        console.error("Error fetching document:", error);
      }
      return;
    }

    toast.error("Document URL not available");
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewFileName("");
    setPreviewFileType("");
  };

  const handleSubmit = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    // Check required documents
    const requiredDocs = DOCUMENT_TYPES.filter((d) => d.required);
    const missingDocs = requiredDocs.filter(
      (doc) => !documents[doc.id].uploaded,
    );

    if (missingDocs.length > 0) {
      toast.error(
        `Please upload all required documents: ${missingDocs.map((d) => d.label).join(", ")}`,
      );
      return;
    }

    setLoading(true);
    try {
      // TODO: Save document IDs to examiner profile
      // This will be handled by the server action
      const { updateDocumentsAction } = await import("../../server/actions");
      const result = await updateDocumentsAction({
        examinerProfileId,
        medicalLicenseDocumentIds: documents.medicalLicense.id
          ? [documents.medicalLicense.id]
          : [],
        governmentIdDocumentId: documents.governmentId.id,
        resumeDocumentId: documents.cvResume.id,
        insuranceDocumentId: documents.insurance.id,
        specialtyCertificatesDocumentIds: documents.specialtyCertificates.id
          ? [documents.specialtyCertificates.id]
          : [],
        activationStep: "documents",
      });

      if (result.success) {
        toast.success("Documents uploaded successfully");
        onComplete();

        // Update session to refresh JWT token with new activationStep
        await update();

        // Don't redirect here - let the user continue to next step
        // router.push("/dashboard");
        // router.refresh();
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

  const allRequiredUploaded = DOCUMENT_TYPES.filter((d) => d.required).every(
    (doc) => documents[doc.id].uploaded,
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-medium">Upload Required Documents</h2>
        <Button
          type="button"
          onClick={handleSubmit}
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0"
          disabled={loading || !allRequiredUploaded}
        >
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-[#00A8FF] bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-700 font-medium mb-2">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Accepted: PDF, JPG, PNG | Max size: 10 MB
        </p>
        {activeDocumentType && (
          <p className="text-sm text-[#00A8FF] mt-2 font-medium">
            Uploading to:{" "}
            {DOCUMENT_TYPES.find((d) => d.id === activeDocumentType)?.label}
          </p>
        )}
      </div>

      {/* Document Checklist */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Document
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {DOCUMENT_TYPES.map((docType) => {
              const doc = documents[docType.id];
              return (
                <tr key={docType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">
                        {docType.label}
                        {docType.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {doc.uploading ? (
                        <span className="text-sm text-gray-500">
                          Uploading...
                        </span>
                      ) : doc.uploaded ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(doc, docType.id)}
                            className="text-sm text-[#00A8FF] hover:text-[#00A8FF]/80"
                          >
                            View
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReplace(docType.id)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Replace
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveDocumentType(docType.id);
                            fileInputRef.current?.click();
                          }}
                          className="text-sm"
                        >
                          Upload
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Document Preview Modal */}
      {previewUrl && (
        <DocumentPreviewModal
          previewUrl={previewUrl}
          previewFileName={previewFileName}
          previewFileType={previewFileType}
          onClose={closePreview}
        />
      )}
    </div>
  );
};

export default DocumentsUploadForm;
