export type ClaimType = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ClaimTypeData = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export type CreateClaimTypeInput = {
  name: string;
  description?: string;
};

export type UpdateClaimTypeInput = Partial<CreateClaimTypeInput>;

