export interface GettingStartedPageProps {
  params: Promise<{
    userType: string;
  }>;
}

export interface OrganizationGettingStartedProps {
  onGetStarted: () => void;
}
export interface MedicalExaminerGettingStartedProps {
  onGetStarted: () => void;
}
