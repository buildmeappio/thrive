export type InterpreterLanguage = {
  id: string;
  name: string;
};

export type InterpreterData = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  languages: InterpreterLanguage[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type InterpreterListItem = InterpreterData & {
  languageCount: number;
};

export type InterpreterFilters = {
  query?: string;
  languageId?: string;
  page?: number;
  pageSize?: number;
};
