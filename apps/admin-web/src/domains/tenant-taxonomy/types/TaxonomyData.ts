export type TaxonomyType =
  | 'caseStatus'
  | 'caseType'
  | 'claimType'
  | 'department'
  | 'examinationType'
  | 'examinationTypeBenefit'
  | 'language'
  | 'organizationType'
  | 'role'
  | 'maximumDistanceTravel'
  | 'yearsOfExperience'
  | 'configuration'
  | 'assessmentType'
  | 'professionalTitle';

export type TaxonomyData = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
