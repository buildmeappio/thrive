export type ExamType = {
  id: string;
  name: string;
  shortForm: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ExamTypesSuccessResponse = {
  success: true;
  data: ExamType[];
};

export type ExamTypesErrorResponse = {
  success: false;
  message: string;
};

export type ExamTypesResponse =
  | ExamTypesSuccessResponse
  | ExamTypesErrorResponse;
