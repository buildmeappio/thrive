export type Role = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type RoleData = {
  id: string;
  name: string;
  createdAt: string;
};

export type CreateRoleInput = {
  name: string;
};

export type UpdateRoleInput = Partial<CreateRoleInput>;

