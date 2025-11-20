"use client";

import { useReportStore } from "../state/useReportStore";
import { DynamicReportSectionProps, UploadedDocument } from "../types";
import { Trash2, Upload, X } from "lucide-react";

export default function DynamicReportSection({
  id,
  title,
  content,
}: DynamicReportSectionProps) {
  const {
    updateDynamicSection,
    removeDynamicSection,
    addDocumentToSection,
    removeDocumentFromSection,
    dynamicSections,
  } = useReportStore();

  // Find current section to get its documents
  const currentSection = dynamicSections.find((section) => section.id === id);
  const documents = currentSection?.documents || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const newDocument: UploadedDocument = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      };
      addDocumentToSection(id, newDocument);
    });

    e.target.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="bg-white rounded-[29px] shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => updateDynamicSection(id, "title", e.target.value)}
          placeholder="Section Title"
          className="flex-1 text-xl font-bold text-black bg-transparent border-none outline-none focus:outline-none placeholder-gray-400 font-poppins"
        />
        <button
          onClick={() => removeDynamicSection(id)}
          className="p-2 hover:bg-red-50 rounded-full transition-colors">
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => updateDynamicSection(id, "content", e.target.value)}
        placeholder="Enter section content here..."
        className="w-full h-48 p-4 bg-[#F8F8F8] rounded-lg border-none resize-none text-base text-gray-800 font-poppins placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
      />

      <div className="mt-4">
        <label
          htmlFor={`file-upload-${id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-full cursor-pointer hover:bg-gray-50 transition-colors">
          <Upload className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700 font-poppins">
            Upload
          </span>
        </label>
        <input
          id={`file-upload-${id}`}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {documents.length > 0 && (
        <div className="space-y-2 mt-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-[#F8F8F8] rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-[#E6F6FF] rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-[#00A8FF]">
                    {doc.name.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 font-poppins truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500 font-poppins">
                    {formatFileSize(doc.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeDocumentFromSection(id, doc.id)}
                className="p-1 hover:bg-red-50 rounded-full transition-colors">
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
