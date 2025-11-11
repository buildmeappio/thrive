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
  | 'yearsOfExperience';

export type TaxonomyFieldType = 'text' | 'textarea' | 'select';

export type TaxonomyField = {
  name: string;
  label: string;
  type: TaxonomyFieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
};

export type TaxonomyConfig = {
  name: string;
  singularName: string;
  tableName: string;
  fields: TaxonomyField[];
  displayFields: string[]; // Fields to show in table
  searchFields: string[]; // Fields to search in
};

// Base taxonomy type
export type BaseTaxonomy = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

// Specific taxonomy types
export type CaseStatus = BaseTaxonomy & {
  name: string;
  description: string | null;
};

export type CaseType = BaseTaxonomy & {
  name: string;
  description: string | null;
};

export type ClaimType = BaseTaxonomy & {
  name: string;
  description: string | null;
};

export type Department = BaseTaxonomy & {
  name: string;
};

export type ExaminationType = BaseTaxonomy & {
  name: string;
  shortForm: string | null;
  description: string | null;
};

export type ExaminationTypeBenefit = BaseTaxonomy & {
  examinationTypeId: string;
  benefit: string;
};

export type Language = BaseTaxonomy & {
  name: string;
};

export type OrganizationType = BaseTaxonomy & {
  name: string;
  description: string | null;
};

export type Role = BaseTaxonomy & {
  name: string;
};

export type MaximumDistanceTravel = BaseTaxonomy & {
  name: string;
  description: string | null;
};

export type YearsOfExperience = BaseTaxonomy & {
  name: string;
  description: string | null;
};

// Union type for all taxonomies
export type Taxonomy = 
  | CaseStatus 
  | CaseType 
  | ClaimType 
  | Department 
  | ExaminationType 
  | ExaminationTypeBenefit 
  | Language 
  | OrganizationType 
  | Role
  | MaximumDistanceTravel
  | YearsOfExperience;

// For table display
export type TaxonomyData = {
  id: string;
  [key: string]: any;
  createdAt: string;
};

// Input types
export type CreateTaxonomyInput = {
  [key: string]: any;
};

export type UpdateTaxonomyInput = Partial<CreateTaxonomyInput>;

