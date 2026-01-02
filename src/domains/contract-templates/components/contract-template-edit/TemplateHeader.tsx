"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Save,
  RefreshCw,
  ExternalLink,
  FileText,
} from "lucide-react";
import StatusBadge from "../StatusBadge";
import type {
  FeeStructureCompatibility,
  PlaceholderValidation,
} from "../../types/validation.types";

type TemplateHeaderProps = {
  displayName: string;
  isActive: boolean;
  googleDocUrl: string | null;
  isLoadingGoogleDocUrl: boolean;
  isSaving: boolean;
  validation: PlaceholderValidation;
  feeStructureCompatibility: FeeStructureCompatibility;
  onSyncFromGoogleDocsClick: () => void;
  onSave: () => void;
};

export function TemplateHeader({
  displayName,
  isActive,
  googleDocUrl,
  isLoadingGoogleDocUrl,
  isSaving,
  validation,
  feeStructureCompatibility,
  onSyncFromGoogleDocsClick,
  onSave,
}: TemplateHeaderProps) {
  return (
    <div className="flex flex-row justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/dashboard/contract-templates">
          <button className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow flex-shrink-0 cursor-pointer">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </button>
        </Link>
        <div className="min-w-0 flex items-center gap-2 sm:gap-3 flex-1">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-degular truncate">
              {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-poppins truncate">
              Edit contract template
            </p>
          </div>
          <StatusBadge isActive={isActive} />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Google Docs Link Button */}
        {googleDocUrl && (
          <a
            href={googleDocUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 sm:h-11 rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-gray-50 hover:border-gray-300 font-poppins font-medium text-xs sm:text-sm transition-all px-4 sm:px-5"
          >
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#00A8FF] flex-shrink-0" />
            <span className="hidden sm:inline">Open in Google Docs</span>
            <span className="sm:hidden">Google Docs</span>
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 text-gray-400 flex-shrink-0" />
          </a>
        )}

        {/* Sync from Docs Button */}
        <Button
          onClick={onSyncFromGoogleDocsClick}
          disabled={!googleDocUrl || isLoadingGoogleDocUrl}
          variant="outline"
          className="h-10 sm:h-11 rounded-full border-[#E5E5E5] text-[#1A1A1A] hover:bg-gray-50 hover:border-gray-300 font-poppins font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all px-4 sm:px-5"
        >
          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00A8FF] mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Sync from Docs</span>
          <span className="sm:hidden">Sync</span>
        </Button>

        {/* Primary Save Button */}
        <Button
          onClick={onSave}
          disabled={
            isSaving ||
            !validation.valid ||
            (feeStructureCompatibility && !feeStructureCompatibility.compatible)
          }
          className="h-10 sm:h-11 px-4 sm:px-6 md:px-10 rounded-full bg-[#000080] text-white hover:bg-[#000093] disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1.5 sm:mr-2" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Save & Sync</span>
              <span className="sm:hidden">Save</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
