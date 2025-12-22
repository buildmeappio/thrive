export interface ChangePasswordSectionProps {
  userId: string;
}

export interface FeeStructureData {
  IMEFee?: number | string | null;
  recordReviewFee?: number | string | null;
  hourlyRate?: number | string | null;
  cancellationFee?: number | string | null;
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
