export type OrganizationType = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type OrganizationTypeData = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export type CreateOrganizationTypeInput = {
  name: string;
  description?: string;
};

export type UpdateOrganizationTypeInput = Partial<CreateOrganizationTypeInput>;
