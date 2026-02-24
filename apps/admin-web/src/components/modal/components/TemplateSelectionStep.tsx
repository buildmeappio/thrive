'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { extractRequiredFeeVariables } from '@/domains/contract-templates/utils/placeholderParser';

type Template = {
  id: string;
  displayName: string;
  currentVersion: { version: number } | null;
  currentVersionId?: string | null;
};

type FeeStructure = {
  id: string;
  name: string;
};

type TemplateSelectionStepProps = {
  templates: Template[];
  selectedTemplateId: string;
  selectedTemplateContent: string | null;
  selectedTemplate: Template | undefined;
  compatibleFeeStructures: FeeStructure[];
  selectedFeeStructureId: string;
  isLoadingData: boolean;
  isLoadingTemplate: boolean;
  isLoadingFeeStructure: boolean;
  existingContractId?: string;
  existingTemplateId?: string;
  onTemplateChange: (id: string) => void;
  onFeeStructureChange: (id: string) => void;
};

export default function TemplateSelectionStep({
  templates,
  selectedTemplateId,
  selectedTemplateContent,
  selectedTemplate,
  compatibleFeeStructures,
  selectedFeeStructureId,
  isLoadingData,
  isLoadingTemplate,
  isLoadingFeeStructure,
  existingContractId,
  existingTemplateId,
  onTemplateChange,
  onFeeStructureChange,
}: TemplateSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="template"
          className="font-poppins block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
        >
          Contract Template *
        </label>
        <Select
          value={selectedTemplateId}
          onValueChange={onTemplateChange}
          disabled={isLoadingData}
        >
          <SelectTrigger
            id="template"
            className="font-poppins h-11 rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] text-[14px] focus:border-[#000080] focus:ring-1 focus:ring-[#000080] sm:h-[46px] sm:rounded-[15px] sm:text-[15px]"
          >
            <SelectValue placeholder="Select contract template" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingData ? (
              <div className="font-poppins px-2 py-1.5 text-sm text-gray-500">
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="font-poppins px-2 py-1.5 text-sm text-gray-500">
                No contract templates found
              </div>
            ) : (
              templates.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.displayName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate && (
        <>
          <div className="rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] p-4 sm:rounded-[15px]">
            <p className="font-poppins mb-2 text-sm font-semibold text-[#1A1A1A] sm:text-[15px]">
              Selected Template:
            </p>
            <p className="font-poppins text-sm text-[#1A1A1A] sm:text-[15px]">
              {selectedTemplate.displayName}
            </p>
            {existingContractId && existingTemplateId === selectedTemplateId && (
              <p className="font-poppins mt-1 text-xs italic text-[#7A7A7A] sm:text-[13px]">
                (Current contract template)
              </p>
            )}
            {existingContractId && existingTemplateId !== selectedTemplateId && (
              <p className="font-poppins mt-1 text-xs italic text-[#FF9800] sm:text-[13px]">
                (Template changed - will create new contract)
              </p>
            )}
          </div>

          {/* Fee Structure Selection */}
          {isLoadingTemplate ? (
            <div className="font-poppins flex items-center gap-2 text-[#7A7A7A]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm sm:text-[15px]">Loading template details...</span>
            </div>
          ) : selectedTemplateContent ? (
            <FeeStructureSelection
              selectedTemplateContent={selectedTemplateContent}
              compatibleFeeStructures={compatibleFeeStructures}
              selectedFeeStructureId={selectedFeeStructureId}
              isLoadingData={isLoadingData}
              isLoadingTemplate={isLoadingTemplate}
              isLoadingFeeStructure={isLoadingFeeStructure}
              onFeeStructureChange={onFeeStructureChange}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

type FeeStructureSelectionProps = {
  selectedTemplateContent: string;
  compatibleFeeStructures: FeeStructure[];
  selectedFeeStructureId: string;
  isLoadingData: boolean;
  isLoadingTemplate: boolean;
  isLoadingFeeStructure: boolean;
  onFeeStructureChange: (id: string) => void;
};

function FeeStructureSelection({
  selectedTemplateContent,
  compatibleFeeStructures,
  selectedFeeStructureId,
  isLoadingData,
  isLoadingTemplate,
  isLoadingFeeStructure,
  onFeeStructureChange,
}: FeeStructureSelectionProps) {
  const requiredFeeVars = extractRequiredFeeVariables(selectedTemplateContent);

  if (requiredFeeVars.size === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="feeStructure"
        className="font-poppins block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
      >
        Fee Structure *
      </label>
      <Select
        value={selectedFeeStructureId}
        onValueChange={onFeeStructureChange}
        disabled={isLoadingData || isLoadingTemplate}
      >
        <SelectTrigger
          id="feeStructure"
          className="font-poppins h-11 rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] text-[14px] focus:border-[#000080] focus:ring-1 focus:ring-[#000080] sm:h-[46px] sm:rounded-[15px] sm:text-[15px]"
        >
          <SelectValue placeholder="Select fee structure" />
        </SelectTrigger>
        <SelectContent>
          {compatibleFeeStructures.length === 0 ? (
            <div className="font-poppins px-2 py-1.5 text-sm text-red-600">
              No compatible fee structures found. Template requires:{' '}
              {Array.from(requiredFeeVars)
                .map(v => `fees.${v}`)
                .join(', ')}
            </div>
          ) : (
            compatibleFeeStructures.map(fs => (
              <SelectItem key={fs.id} value={fs.id}>
                {fs.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {compatibleFeeStructures.length > 0 && (
        <p className="font-poppins text-xs text-[#7A7A7A] sm:text-[13px]">
          {compatibleFeeStructures.length} compatible fee structure
          {compatibleFeeStructures.length !== 1 ? 's' : ''} available
        </p>
      )}
      {isLoadingFeeStructure && (
        <div className="font-poppins mt-2 flex items-center gap-2 text-[#7A7A7A]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm sm:text-[13px]">Loading fee structure details...</span>
        </div>
      )}
    </div>
  );
}
