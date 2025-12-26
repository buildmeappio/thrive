export type CreateContractModalProps = {
  open: boolean;
  onClose: () => void;
  examinerId?: string;
  applicationId?: string;
  examinerName: string;
  examinerEmail: string;
  onSuccess?: () => void;
  existingContractId?: string; // For resending - existing contract ID
  existingTemplateId?: string; // For resending - existing template ID
};

export type UseCreateContractModalOptions = CreateContractModalProps;

export type UseCreateContractModalReturn = {
  // Props
  open: boolean;
  onClose: () => void;

  // State
  step: 1 | 2 | 3;
  templates: Array<{
    id: string;
    displayName: string;
    currentVersion: { version: number } | null;
  }>;
  selectedTemplateId: string;
  selectedTemplateContent: string | null;
  compatibleFeeStructures: Array<{ id: string; name: string }>;
  selectedFeeStructureId: string;
  isLoading: boolean;
  isLoadingData: boolean;
  isLoadingTemplate: boolean;
  previewHtml: string;
  contractId: string | null;
  selectedTemplate:
    | {
        id: string;
        displayName: string;
        currentVersion: { version: number } | null;
        currentVersionId: string | null;
      }
    | undefined;

  // Actions
  setSelectedTemplateId: (id: string) => void;
  setSelectedFeeStructureId: (id: string) => void;
  setStep: (step: 1 | 2 | 3) => void;
  handleCreateAndPreview: () => Promise<void>;
  handleSendContract: () => Promise<void>;
  panelRef: React.RefObject<HTMLDivElement>;
  titleId: string;
  onBackdrop: (e: React.MouseEvent) => void;
};
