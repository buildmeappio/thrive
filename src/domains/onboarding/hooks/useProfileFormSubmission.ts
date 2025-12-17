"use client";
import { useState } from "react";
import { UseFormReturn } from "@/lib/form";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { updateExaminerProfileAction } from "@/domains/setting/server/actions";
import { getProfilePhotoUrlAction } from "@/server/actions/getProfilePhotoUrl";
import { ProfileInfoInput } from "../../schemas/onboardingSteps.schema";

interface UseProfileFormSubmissionOptions {
  form: UseFormReturn<ProfileInfoInput>;
  examinerProfileId: string | null;
  initialProfilePhotoId?: string | null;
  profilePhoto: File | null;
  onComplete: () => void;
  onMarkComplete?: () => void;
  onProfilePhotoUpdate?: (url: string | null) => void;
  onClearProfilePhoto?: () => void;
  onDataUpdate?: (data: any) => void;
  isSettingsPage?: boolean;
}

/**
 * Hook for handling profile form submission
 * Handles saving profile data and profile photo updates
 */
export function useProfileFormSubmission({
  form,
  examinerProfileId,
  initialProfilePhotoId,
  profilePhoto,
  onComplete,
  onMarkComplete,
  onProfilePhotoUpdate,
  onClearProfilePhoto,
  onDataUpdate,
  isSettingsPage = false,
}: UseProfileFormSubmissionOptions) {
  const [loading, setLoading] = useState(false);
  const { update: updateSession } = useSession();

  const handleSubmit = async (values: ProfileInfoInput) => {
    if (!examinerProfileId || typeof examinerProfileId !== "string") {
      toast.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      const result = await updateExaminerProfileAction({
        examinerProfileId,
        ...values,
        profilePhotoId: initialProfilePhotoId || null,
        profilePhoto: profilePhoto || undefined,
      });

      if (result.success) {
        // Clear the file state since it's now saved
        if (onClearProfilePhoto) {
          onClearProfilePhoto();
        }
        // Fetch fresh presigned URL if we have a profilePhotoId
        const photoIdToFetch =
          result.data?.profilePhotoId || initialProfilePhotoId;
        if (photoIdToFetch && typeof photoIdToFetch === "string") {
          try {
            const photoUrl = await getProfilePhotoUrlAction(photoIdToFetch);
            if (onProfilePhotoUpdate) {
              onProfilePhotoUpdate(photoUrl);
            }
          } catch (error) {
            console.error("Failed to fetch profile photo URL:", error);
            if (onProfilePhotoUpdate) {
              onProfilePhotoUpdate(null);
            }
          }
        } else {
          if (onProfilePhotoUpdate) {
            onProfilePhotoUpdate(null);
          }
        }
        // Refresh session to update profilePhotoId in header
        await updateSession();

        // Update parent component's data state if callback is provided (for settings page)
        if (onDataUpdate && isSettingsPage) {
          onDataUpdate({
            firstName: values.firstName,
            lastName: values.lastName,
            emailAddress: values.emailAddress,
            professionalTitle: values.professionalTitle,
            yearsOfExperience: values.yearsOfExperience,
            clinicName: values.clinicName,
            clinicAddress: values.clinicAddress,
            bio: values.bio,
            profilePhotoId:
              result.data?.profilePhotoId || initialProfilePhotoId,
            profilePhotoUrl: result.data?.profilePhotoUrl || null,
          });
        }

        toast.success("Profile saved successfully");
        onComplete();
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!examinerProfileId || typeof examinerProfileId !== "string") {
      toast.error("Examiner profile ID not found");
      return false;
    }

    // Validate profile photo is required for marking as complete
    if (!profilePhoto && !initialProfilePhotoId) {
      toast.error("Please upload a profile photo before marking as complete");
      return false;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix validation errors before marking as complete");
      return false;
    }

    const values = form.getValues();
    setLoading(true);
    try {
      const result = await updateExaminerProfileAction({
        examinerProfileId,
        firstName: values.firstName as string,
        lastName: values.lastName as string,
        emailAddress: values.emailAddress as string,
        professionalTitle: values.professionalTitle as string | undefined,
        yearsOfExperience: values.yearsOfExperience as string | undefined,
        clinicName: values.clinicName as string | undefined,
        clinicAddress: values.clinicAddress as string | undefined,
        bio: values.bio as string | undefined,
        profilePhotoId: initialProfilePhotoId || null,
        profilePhoto: profilePhoto || undefined,
      });

      if (result.success) {
        // Clear the file state since it's now saved
        if (onClearProfilePhoto) {
          onClearProfilePhoto();
        }
        // Fetch fresh presigned URL if we have a profilePhotoId
        const photoIdToFetch =
          result.data?.profilePhotoId || initialProfilePhotoId;
        if (photoIdToFetch && typeof photoIdToFetch === "string") {
          try {
            const photoUrl = await getProfilePhotoUrlAction(photoIdToFetch);
            if (onProfilePhotoUpdate) {
              onProfilePhotoUpdate(photoUrl);
            }
          } catch (error) {
            console.error("Failed to fetch profile photo URL:", error);
            if (onProfilePhotoUpdate) {
              onProfilePhotoUpdate(null);
            }
          }
        } else {
          if (onProfilePhotoUpdate) {
            onProfilePhotoUpdate(null);
          }
        }
        // Refresh session to update profilePhotoId in header
        await updateSession();
        toast.success("Profile saved and marked as complete");
        // Call onMarkComplete if provided
        if (onMarkComplete) {
          onMarkComplete();
        }
        // Close the step
        onComplete();
        return true; // Indicate success for mark as complete
      } else {
        toast.error(result.message || "Failed to update profile");
        return false;
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    handleMarkComplete,
    loading,
  };
}
