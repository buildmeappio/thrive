import type { IRegisterConfig } from '@/shared/types';

export const RegisterConfigs: Record<string, IRegisterConfig> = {
  organization: {
    type: 'organization',
    title: 'Organization Registration',
  },
  medicalExaminer: {
    type: 'medicalExaminer',
    title: 'Medical Examiner Registration',
  },
};
