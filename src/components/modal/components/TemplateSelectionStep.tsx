"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { extractRequiredFeeVariables } from "@/domains/contract-templates/utils/placeholderParser";

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
          className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins"
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
            className="
            h-11 sm:h-[46px]
            rounded-xl sm:rounded-[15px]
            border border-[#E5E5E5] bg-[#F6F6F6]
            font-poppins text-[14px] sm:text-[15px]
            focus:border-[#000080] focus:ring-1 focus:ring-[#000080]
          "
          >
            <SelectValue placeholder="Select contract template" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingData ? (
              <div className="px-2 py-1.5 text-sm text-gray-500 font-poppins">
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-gray-500 font-poppins">
                No contract templates found
              </div>
            ) : (
              templates.map((t) => (
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
          <div className="p-4 bg-[#F6F6F6] rounded-xl sm:rounded-[15px] border border-[#E5E5E5]">
            <p className="text-sm sm:text-[15px] font-semibold mb-2 font-poppins text-[#1A1A1A]">
              Selected Template:
            </p>
            <p className="text-sm sm:text-[15px] font-poppins text-[#1A1A1A]">
              {selectedTemplate.displayName}
            </p>
            {existingContractId &&
              existingTemplateId === selectedTemplateId && (
                <p className="text-xs sm:text-[13px] text-[#7A7A7A] font-poppins mt-1 italic">
                  (Current contract template)
                </p>
              )}
            {existingContractId &&
              existingTemplateId !== selectedTemplateId && (
                <p className="text-xs sm:text-[13px] text-[#FF9800] font-poppins mt-1 italic">
                  (Template changed - will create new contract)
                </p>
              )}
          </div>

          {/* Fee Structure Selection */}
          {isLoadingTemplate ? (
            <div className="flex items-center gap-2 text-[#7A7A7A] font-poppins">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm sm:text-[15px]">
                Loading template details...
              </span>
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
        className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins"
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
          className="
          h-11 sm:h-[46px]
          rounded-xl sm:rounded-[15px]
          border border-[#E5E5E5] bg-[#F6F6F6]
          font-poppins text-[14px] sm:text-[15px]
          focus:border-[#000080] focus:ring-1 focus:ring-[#000080]
        "
        >
          <SelectValue placeholder="Select fee structure" />
        </SelectTrigger>
        <SelectContent>
          {compatibleFeeStructures.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-red-600 font-poppins">
              No compatible fee structures found. Template requires:{" "}
              {Array.from(requiredFeeVars)
                .map((v) => `fees.${v}`)
                .join(", ")}
            </div>
          ) : (
            compatibleFeeStructures.map((fs) => (
              <SelectItem key={fs.id} value={fs.id}>
                {fs.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {compatibleFeeStructures.length > 0 && (
        <p className="text-xs sm:text-[13px] text-[#7A7A7A] font-poppins">
          {compatibleFeeStructures.length} compatible fee structure
          {compatibleFeeStructures.length !== 1 ? "s" : ""} available
        </p>
      )}
      {isLoadingFeeStructure && (
        <div className="flex items-center gap-2 text-[#7A7A7A] font-poppins mt-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm sm:text-[13px]">
            Loading fee structure details...
          </span>
        </div>
      )}
    </div>
  );
}
