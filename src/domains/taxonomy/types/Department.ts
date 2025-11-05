export type Department = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type DepartmentData = {
  id: string;
  name: string;
  createdAt: string;
};

export type CreateDepartmentInput = {
  name: string;
};

export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;

