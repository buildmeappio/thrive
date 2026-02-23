import { RefObject, Dispatch, SetStateAction } from "react";

export interface HeaderConfig {
  content: string;
  height: number;
  frequency: "all" | "even" | "odd" | "first";
}

export interface FooterConfig {
  content: string;
  height: number;
  frequency: "all" | "even" | "odd" | "first";
}

export interface FeeStructure {
  IMEFee: number;
  recordReviewFee: number;
  hourlyRate: number;
  cancellationFee: number;
  effectiveDate?: string;
}

export interface ContractSigningViewProps {
  token: string;
  contractId: string;
  examinerProfileId: string;
  examinerEmail: string;
  examinerName: string;
  feeStructure: FeeStructure;
  contractHtml: string;
  isAlreadySigned: boolean;
  headerConfig?: HeaderConfig | null;
  footerConfig?: FooterConfig | null;
  checkboxGroupsFromTemplate?: CheckboxGroup[];
}

export interface CheckboxGroup {
  variableKey: string;
  label: string;
  options: Array<{ label: string; value: string }>;
}

export interface SignaturePanelProps {
  sigName: string;
  sigDate: string;
  signatureImage: string | null;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  clearSignature: () => void;
  agree: boolean;
  setAgree: (agree: boolean) => void;
  onSign: () => void;
  onDecline: () => void;
  isSigning: boolean;
}

export interface DeclineModalProps {
  show: boolean;
  declineReason: string;
  isDeclining: boolean;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface UseContractSigningProps {
  contractId: string;
  examinerProfileId: string;
  examinerEmail: string;
  sigName: string;
  sigDate: string;
  contractHtml: string;
  signatureImage: string | null;
  checkboxValues: Record<string, string[]>;
  generatePdfFromHtml: () => Promise<string>;
}

export interface UseContractDomUpdatesProps {
  contractHtml: string;
  signatureImage: string | null;
  sigName: string;
  sigDate: string;
  checkboxValues: Record<string, string[]>;
  checkboxGroups: CheckboxGroup[];
}

export interface UseCheckboxInteractionsProps {
  contractHtml: string;
  checkboxValues: Record<string, string[]>;
  checkboxGroups: CheckboxGroup[];
  setCheckboxValues: Dispatch<SetStateAction<Record<string, string[]>>>;
}
