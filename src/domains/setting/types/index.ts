export interface ChangePasswordSectionProps {
  userId: string;
}

export interface FeeStructureVariable {
  key: string;
  label: string;
  value: unknown;
  type: string;
  currency?: string | null;
  decimals?: number | null;
  unit?: string | null;
}

export interface FeeStructureData {
  // Legacy format
  IMEFee?: number | string | null;
  recordReviewFee?: number | string | null;
  hourlyRate?: number | string | null;
  cancellationFee?: number | string | null;
  // New format with variables
  variables?: FeeStructureVariable[];
}

export interface ContractData {
  id: string;
  signedPdfS3Key?: string | null;
  unsignedPdfS3Key?: string | null;
  signedHtmlS3Key?: string | null;
  unsignedHtmlS3Key?: string | null;
  signedAt?: Date | null;
}

export interface FeeStructureSectionProps {
  feeStructure: FeeStructureData | null;
  contract: ContractData | null;
  contractHtml?: string | null;
}
