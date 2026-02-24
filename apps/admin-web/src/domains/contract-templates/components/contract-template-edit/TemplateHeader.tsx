'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save, RefreshCw, ExternalLink, FileText } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import type {
  FeeStructureCompatibility,
  PlaceholderValidation,
} from '../../types/validation.types';

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
          <button className="flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
            <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
          </button>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="min-w-0">
            <h1 className="font-degular truncate text-base font-bold sm:text-lg md:text-xl lg:text-2xl">
              {displayName}
            </h1>
            <p className="font-poppins truncate text-xs text-gray-500 sm:text-sm">
              Edit contract template
            </p>
          </div>
          <StatusBadge isActive={isActive} />
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
        {/* Google Docs Link Button */}
        {googleDocUrl && (
          <a
            href={googleDocUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-poppins inline-flex h-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white px-4 text-xs font-medium text-[#1A1A1A] transition-all hover:border-gray-300 hover:bg-gray-50 sm:h-11 sm:px-5 sm:text-sm"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-[#00A8FF] sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Open in Google Docs</span>
            <span className="sm:hidden">Google Docs</span>
            <ExternalLink className="ml-1.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400 sm:ml-2 sm:h-4 sm:w-4" />
          </a>
        )}

        {/* Sync from Docs Button */}
        <Button
          onClick={onSyncFromGoogleDocsClick}
          disabled={!googleDocUrl || isLoadingGoogleDocUrl}
          variant="outline"
          className="font-poppins h-10 rounded-full border-[#E5E5E5] px-4 text-xs font-medium text-[#1A1A1A] transition-all hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:px-5 sm:text-sm"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-[#00A8FF] sm:mr-2 sm:h-4 sm:w-4" />
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
          className="font-poppins flex h-10 items-center gap-2 rounded-full bg-[#000080] px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#000093] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:px-6 sm:text-sm md:px-10"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Save & Sync</span>
              <span className="sm:hidden">Save</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
