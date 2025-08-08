export interface GettingStartedComponentPageProps {
  params: {
    userType: string;
  };
  onGetStarted?: () => void;
}

export interface OrganizationGettingStartedProps {
  onGetStarted: () => void;
}
export interface MedicalExaminerGettingStartedProps {
  onGetStarted: () => void;
}
