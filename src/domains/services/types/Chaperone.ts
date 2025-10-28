export type Chaperone = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ChaperoneData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  fullName: string;
  createdAt: Date;
};

export type CreateChaperoneInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
};

export type UpdateChaperoneInput = Partial<CreateChaperoneInput>;

