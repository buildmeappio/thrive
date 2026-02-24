'use client';

import { useReportStore } from '../state/useReportStore';
import { Upload, X } from 'lucide-react';
import { UploadedDocument } from '../types';

export default function ReferralQuestionsSection() {
  const { referralQuestionsResponse, referralDocuments, updateField, addDocument, removeDocument } =
    useReportStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const newDocument: UploadedDocument = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      };
      addDocument(newDocument);
    });

    e.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="mb-6 rounded-[29px] bg-white p-6 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]">
      <h2 className="mb-6 text-xl font-bold text-black">Referral Questions Response</h2>

      <div className="mb-4">
        <textarea
          value={referralQuestionsResponse}
          onChange={e => updateField('referralQuestionsResponse', e.target.value)}
          placeholder="Type here"
          maxLength={500}
          className="font-poppins h-32 w-full resize-none rounded-lg border-none bg-[#F8F8F8] p-4 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
        />
        <div className="mt-2 flex justify-end">
          <span className="font-poppins text-sm text-gray-500">
            {referralQuestionsResponse.length}/500
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 transition-colors hover:bg-gray-50"
        >
          <Upload className="h-4 w-4 text-gray-600" />
          <span className="font-poppins text-sm font-medium text-gray-700">Upload</span>
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {referralDocuments.length > 0 && (
        <div className="space-y-2">
          {referralDocuments.map(doc => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg bg-[#F8F8F8] p-3"
            >
              <div className="flex flex-1 items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[#E6F6FF]">
                  <span className="text-xs font-bold text-[#00A8FF]">
                    {doc.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-poppins truncate text-sm font-medium text-gray-800">
                    {doc.name}
                  </p>
                  <p className="font-poppins text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeDocument(doc.id)}
                className="rounded-full p-1 transition-colors hover:bg-red-50"
              >
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
