import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ReportFormData,
  DynamicSection,
  UploadedDocument,
  SignatureData,
} from "../types";

interface ReportState extends ReportFormData {
  // Auto-save status
  isSaving: boolean;
  lastSaved: Date | null;

  // Actions
  updateField: <K extends keyof ReportFormData>(
    field: K,
    value: ReportFormData[K],
  ) => void;
  addDynamicSection: () => void;
  removeDynamicSection: (id: string) => void;
  updateDynamicSection: (
    id: string,
    field: keyof DynamicSection,
    value: string,
  ) => void;
  addDocumentToSection: (sectionId: string, document: UploadedDocument) => void;
  removeDocumentFromSection: (sectionId: string, documentId: string) => void;
  setSignature: (signature: SignatureData) => void;
  clearSignature: () => void;
  addDocument: (document: UploadedDocument) => void;
  removeDocument: (id: string) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  resetForm: () => void;
  loadReport: (data: Partial<ReportFormData>) => void;
}

const initialState: ReportFormData = {
  consentFormSigned: false,
  latRuleAcknowledgment: false,
  referralQuestionsResponse: "",
  referralDocuments: [],
  dynamicSections: [],
  examinerName: "",
  professionalTitle: "",
  dateOfReport: "",
  signature: null,
  confirmationChecked: false,
};

export const useReportStore = create<ReportState>()(
  persist(
    (set, _get) => ({
      ...initialState,
      isSaving: false,
      lastSaved: null,

      updateField: (field, value) => {
        set({ [field]: value });
      },

      addDynamicSection: () => {
        const newSection: DynamicSection = {
          id: `section-${Date.now()}`,
          title: "",
          content: "",
          documents: [],
        };
        set((state) => ({
          dynamicSections: [...state.dynamicSections, newSection],
        }));
      },

      removeDynamicSection: (id) => {
        set((state) => ({
          dynamicSections: state.dynamicSections.filter(
            (section) => section.id !== id,
          ),
        }));
      },

      updateDynamicSection: (id, field, value) => {
        set((state) => ({
          dynamicSections: state.dynamicSections.map((section) =>
            section.id === id ? { ...section, [field]: value } : section,
          ),
        }));
      },

      addDocumentToSection: (sectionId, document) => {
        set((state) => ({
          dynamicSections: state.dynamicSections.map((section) =>
            section.id === sectionId
              ? { ...section, documents: [...section.documents, document] }
              : section,
          ),
        }));
      },

      removeDocumentFromSection: (sectionId, documentId) => {
        set((state) => ({
          dynamicSections: state.dynamicSections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  documents: section.documents.filter(
                    (doc) => doc.id !== documentId,
                  ),
                }
              : section,
          ),
        }));
      },

      setSignature: (signature) => {
        set({ signature });
      },

      clearSignature: () => {
        set({ signature: null });
      },

      addDocument: (document) => {
        set((state) => ({
          referralDocuments: [...state.referralDocuments, document],
        }));
      },

      removeDocument: (id) => {
        set((state) => ({
          referralDocuments: state.referralDocuments.filter(
            (doc) => doc.id !== id,
          ),
        }));
      },

      setIsSaving: (saving) => {
        set({ isSaving: saving });
      },

      setLastSaved: (date) => {
        set({ lastSaved: date });
      },

      resetForm: () => {
        set({ ...initialState, isSaving: false, lastSaved: null });
      },

      loadReport: (data) => {
        set((state) => ({ ...state, ...data }));
      },
    }),
    {
      name: "report-storage",
      partialize: (state) => ({
        consentFormSigned: state.consentFormSigned,
        latRuleAcknowledgment: state.latRuleAcknowledgment,
        referralQuestionsResponse: state.referralQuestionsResponse,
        referralDocuments: state.referralDocuments,
        dynamicSections: state.dynamicSections,
        examinerName: state.examinerName,
        professionalTitle: state.professionalTitle,
        dateOfReport: state.dateOfReport,
        signature: state.signature,
        confirmationChecked: state.confirmationChecked,
      }),
    },
  ),
);
