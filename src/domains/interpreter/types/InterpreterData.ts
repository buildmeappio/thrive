import { AvailabilityBlock } from "@prisma/client";

export type InterpreterAvailability = {
  id: string;
  weekday: number;
  block: AvailabilityBlock;
};

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
  availability: InterpreterAvailability[];
  createdAt: Date;
  updatedAt: Date;
};

export type InterpreterListItem = Omit<InterpreterData, 'availability'> & {
  languageCount: number;
  availabilityCount: number;
};

export type InterpreterFilters = {
  query?: string;
  languageId?: string;
  page?: number;
  pageSize?: number;
};

