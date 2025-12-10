import { InitialFormData, LanguageOption } from "@/types/components";

export interface ProfileInfoFormProps {
  examinerProfileId: string | null;
  initialData: InitialFormData;
  onComplete: () => void;
  onCancel?: () => void;
}

export interface ServicesAssessmentFormProps {
  examinerProfileId: string | null;
  initialData: {
    assessmentTypes?: string[];
    acceptVirtualAssessments?: boolean;
    acceptInPersonAssessments?: boolean;
    travelToClaimants?: boolean;
    travelRadius?: string;
    assessmentTypeOther?: string;
  };
  assessmentTypes: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  maxTravelDistances: Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;
  onComplete: () => void;
  onCancel?: () => void;
}

export interface SpecialtyPreferencesFormProps {
  examinerProfileId: string | null;
  initialData: InitialFormData;
  languages: LanguageOption[];
  onComplete: () => void;
  onCancel?: () => void;
}

export interface AvailabilityPreferencesFormProps {
  examinerProfileId: string | null;
  initialData: InitialFormData;
  onComplete: () => void;
  onCancel?: () => void;
}

export interface PayoutDetailsFormProps {
  examinerProfileId: string | null;
  initialData: InitialFormData;
  onComplete: () => void;
  onCancel?: () => void;
}

export interface DocumentsUploadFormProps {
  examinerProfileId: string | null;
  initialData: {
    medicalLicenseDocumentIds?: string[];
    governmentIdDocumentId?: string;
    resumeDocumentId?: string;
    insuranceDocumentId?: string;
    specialtyCertificatesDocumentIds?: string[];
  };
  onComplete: () => void;
  onCancel?: () => void;
}

