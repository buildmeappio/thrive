"use server";

import updateExaminerProfileHandler from "../handlers/updateExaminerProfile";
import { uploadFileToS3 } from "@/lib/s3";

export const updateExaminerProfileAction = async (data: {
  examinerProfileId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string;
  landlineNumber?: string;
  provinceOfResidence?: string;
  mailingAddress?: string;
  professionalTitle?: string;
  yearsOfExperience?: string;
  clinicName?: string;
  clinicAddress?: string;
  bio?: string;
  profilePhotoId?: string | null;
  profilePhoto?: File;
  activationStep?: string;
}) => {
  try {
    let uploadedPhotoId = data.profilePhotoId || null;

    // Upload profile photo if a new one was provided
    if (data.profilePhoto) {
      const uploadResult = await uploadFileToS3(data.profilePhoto);

      if (uploadResult.success) {
        uploadedPhotoId = uploadResult.document.id;
      } else {
        return {
          success: false as const,
          data: null,
          message: uploadResult.error || "Failed to upload profile photo",
        };
      }
    }

    // Update the data with the uploaded photo ID
    const updatedData = {
      ...data,
      profilePhotoId: uploadedPhotoId,
    };

    return await updateExaminerProfileHandler(updatedData);
  } catch (error: unknown) {
    return {
      success: false as const,
      data: null,
      message: (error instanceof Error ? error.message : undefined) || "Failed to update examiner profile",
    };
  }
};
