export type Language = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type LanguageData = {
  id: string;
  name: string;
  createdAt: string;
};

export type CreateLanguageInput = {
  name: string;
};

export type UpdateLanguageInput = Partial<CreateLanguageInput>;

