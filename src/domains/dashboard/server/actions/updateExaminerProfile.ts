"use server";

import updateExaminerProfileHandler from "../handlers/updateExaminerProfile";

export const updateExaminerProfileAction = async (data: {
  examinerProfileId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  provinceOfResidence: string;
  mailingAddress: string;
  bio?: string;
  profilePhotoId?: string | null;
  activationStep?: string;
}) => {
  try {
    return await updateExaminerProfileHandler(data);
  } catch (error: any) {
    return {
      success: false as const,
      data: null,
      message: error.message || "Failed to update examiner profile",
    };
  }
};
