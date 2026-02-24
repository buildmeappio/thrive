'use server';

import updateDocumentsHandler from '../handlers/updateDocuments';

export const updateDocumentsAction = async (data: {
  examinerProfileId: string;
  medicalLicenseDocumentIds?: string[];
  governmentIdDocumentId?: string;
  resumeDocumentId?: string;
  insuranceDocumentId?: string;
  specialtyCertificatesDocumentIds?: string[];
  activationStep?: string;
}) => {
  try {
    return await updateDocumentsHandler(data);
  } catch (error: unknown) {
    return {
      success: false as const,
      data: null,
      message: (error instanceof Error ? error.message : undefined) || 'Failed to update documents',
    };
  }
};
