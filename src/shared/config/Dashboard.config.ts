import type { IDashboardConfig } from '@/shared/types';

export const DashboardConfigs: Record<string, IDashboardConfig> = {
  admin: {
    type: 'admin',
    title: 'Admin Dashboard',
  },
  organization: {
    type: 'organization',
    title: 'Organization Dashboard',
  },
  medicalExaminer: {
    type: 'medicalExaminer',
    title: 'Medical Examiner Dashboard',
  },
};
