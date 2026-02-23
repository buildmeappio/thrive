import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getFileFromS3 } from '@/lib/s3-actions';
import { getCaseDetails } from '../../actions';

type DocumentDetailsProps = {
  documents: Awaited<ReturnType<typeof getCaseDetails>>['result']['case']['documents'];
};

type DocumentType = DocumentDetailsProps['documents'][number]['document'];

const Documents = ({ documents }: DocumentDetailsProps) => {
  const [previewDoc, setPreviewDoc] = useState<DocumentType | null>(null);
  const [open, setOpen] = useState(false);
  const [fileData, setFileData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async (doc: DocumentType) => {
    setPreviewDoc(doc);
    setOpen(true);
    setLoading(true);
    setError(null);

    try {
      const result = await getFileFromS3(doc.name);

      if (result.success && result.data) {
        // Convert Buffer to base64 string
        const base64 = Buffer.from(result.data).toString('base64');
        setFileData(`data:${result.contentType};base64,${base64}`);
      } else {
        setError(result.error || 'Failed to load document');
      }
    } catch (err) {
      setError('An error occurred while loading the document');
      console.error('Preview error:', err);
    }

    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setPreviewDoc(null);
    setFileData(null);
    setError(null);
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex h-[600px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p>Loading document...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-[600px] items-center justify-center">
          <div className="text-center text-red-600">
            <p className="font-medium">{error}</p>
            <Button onClick={handleClose} className="mt-4" variant="outline">
              Close
            </Button>
          </div>
        </div>
      );
    }

    if (!fileData || !previewDoc) {
      return null;
    }

    // PDF preview
    if (previewDoc.type?.includes('pdf') || previewDoc.name?.endsWith('.pdf')) {
      return (
        <iframe
          src={fileData}
          className="h-[600px] w-full border-0"
          title={previewDoc.displayName || previewDoc.name}
        />
      );
    }

    // Image preview
    if (
      previewDoc.type?.includes('image') ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(previewDoc.name)
    ) {
      return (
        <div className="relative h-[600px] w-full">
          <Image
            src={fileData}
            alt={previewDoc.displayName || previewDoc.name}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      );
    }

    // Unsupported file type
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-600">Preview not available for this file type</p>
          <a href={fileData} download={previewDoc.name} className="text-blue-600 hover:underline">
            Download file instead
          </a>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-3">
        {documents.map(caseDoc => {
          const doc = caseDoc.document;

          return (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg bg-[#F6F6F6] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-[#1E1E1E] md:text-[18px]">
                  {doc.displayName || doc.name}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePreview(doc)}
                className="hover:bg-gray-200"
              >
                <Eye size={20} />
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] max-w-5xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.displayName || previewDoc?.name}</DialogTitle>
          </DialogHeader>

          <div className="overflow-auto">{renderPreview()}</div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Documents;
