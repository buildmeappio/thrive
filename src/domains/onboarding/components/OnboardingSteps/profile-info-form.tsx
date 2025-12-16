"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui";
import {
  Mail,
  // MapPin,
  User,
  CircleCheck,
  Briefcase,
} from "lucide-react";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import {
  FormProvider,
  FormField,
  FormDropdown,
  FormGoogleMapsInput,
} from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { professionalTitleOptions } from "@/constants/options";
import { updateExaminerProfileAction } from "@/domains/setting/server/actions";
import {
  profileInfoSchema,
  ProfileInfoInput,
} from "../../schemas/onboardingSteps.schema";
import { toast } from "sonner";
import authActions from "@/domains/auth/actions";
import { getProfilePhotoUrlAction } from "@/server/actions/getProfilePhotoUrl";
import { useSession } from "next-auth/react";

import type { ProfileInfoFormProps } from "../../types";

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
  onMarkComplete,
  onStepEdited,
  isCompleted = false,
  isSettingsPage = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(
    typeof initialData?.profilePhotoUrl === "string"
      ? initialData.profilePhotoUrl
      : null
  );
  const [yearsOfExperienceOptions, setYearsOfExperienceOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loadingYears, setLoadingYears] = useState(true);
  const { update: updateSession } = useSession();

  // Update profilePhotoUrl when initialData changes (e.g., after save or when navigating back)
  // Always fetch presigned URL if we have a profilePhotoId
  useEffect(() => {
    const loadProfilePhoto = async () => {
      // Always fetch presigned URL if we have a profilePhotoId
      if (
        typeof initialData?.profilePhotoId === "string" &&
        initialData.profilePhotoId.trim() !== ""
      ) {
        try {
          const photoUrl = await getProfilePhotoUrlAction(
            initialData.profilePhotoId
          );
          if (photoUrl) {
            setProfilePhotoUrl(photoUrl);
          } else {
            // If presigned URL fetch fails, clear the URL
            setProfilePhotoUrl(null);
          }
        } catch (error) {
          console.error("Failed to fetch profile photo URL:", error);
          setProfilePhotoUrl(null);
        }
      } else {
        // No photo ID, but don't clear the URL if we already have one (user might have uploaded but not saved yet)
        // Only clear if we explicitly don't have a photo ID
        if (!initialData?.profilePhotoId) {
          // Only clear if we don't have a local photo file either
          if (!profilePhoto) {
            setProfilePhotoUrl(null);
          }
        }
      }
    };

    void loadProfilePhoto();
  }, [initialData?.profilePhotoId, profilePhoto]);

  // Use initial data directly
  const defaultValues = useMemo<ProfileInfoInput>(() => {
    return {
      firstName: (initialData?.firstName as string) || "",
      lastName: (initialData?.lastName as string) || "",
      emailAddress: (initialData?.emailAddress as string) || "",
      professionalTitle: (initialData?.professionalTitle as string) || "",
      yearsOfExperience: (initialData?.yearsOfExperience as string) || "",
      clinicName: (initialData?.clinicName as string) || "",
      clinicAddress: (initialData?.clinicAddress as string) || "",
      bio: (initialData?.bio as string) || "",
    };
  }, [initialData]);

  // Fetch years of experience options
  useEffect(() => {
    const fetchYearsOfExperience = async () => {
      try {
        setLoadingYears(true);
        const years = await authActions.getYearsOfExperience();
        const formattedYears = years.map((year) => ({
          value: year.id,
          label: year.name,
        }));
        setYearsOfExperienceOptions(formattedYears);
      } catch (error) {
        console.error("Failed to fetch years of experience:", error);
        toast.error("Failed to load years of experience options");
      } finally {
        setLoadingYears(false);
      }
    };

    fetchYearsOfExperience();
  }, []);

  const form = useForm<ProfileInfoInput>({
    schema: profileInfoSchema,
    defaultValues,
    mode: "onChange", // Change to onChange to track isDirty properly
  });

  const isDirty = form.formState.isDirty;
  const formValues = form.watch();
  const initialFormDataRef = React.useRef<string | null>(null);
  const isInitializedRef = React.useRef(false);

  // Reset form when defaultValues change and update initial data reference
  useEffect(() => {
    form.reset(defaultValues);

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
    }

    // Store initial data hash to detect changes - use defaultValues directly
    // This ensures we compare against the actual initial data, not form values
    const initialHash = JSON.stringify(defaultValues);
    initialFormDataRef.current = initialHash;
  }, [defaultValues, form]);

  // Check if form values have changed from initial saved values
  const hasFormChanged = useMemo(() => {
    if (!initialFormDataRef.current || !isInitializedRef.current) return false;
    const currentHash = JSON.stringify(formValues);
    const changed = currentHash !== initialFormDataRef.current;

    if (process.env.NODE_ENV === "development") {
      console.log("Profile Form Change Detection:", {
        currentHash,
        initialHash: initialFormDataRef.current,
        changed,
        formValues,
      });
    }

    return changed;
  }, [formValues]);

  // Validation is handled in handleMarkComplete via form.trigger()
  // Button is always enabled, validation happens on click

  // If form is dirty or has changed from initial values, and step is completed, mark as incomplete
  useEffect(() => {
    if ((isDirty || hasFormChanged) && isCompleted && onStepEdited) {
      onStepEdited();
    }
  }, [isDirty, hasFormChanged, isCompleted, onStepEdited]);

  // If profile photo is changed and step is completed, mark as incomplete
  useEffect(() => {
    if (profilePhoto && isCompleted && onStepEdited) {
      onStepEdited();
    }
  }, [profilePhoto, isCompleted, onStepEdited]);

  const handlePhotoChange = (file: File | null) => {
    setProfilePhoto(file);
  };

  const onSubmit = async (values: ProfileInfoInput) => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      const result = await updateExaminerProfileAction({
        examinerProfileId,
        ...values,
        profilePhotoId:
          (typeof initialData?.profilePhotoId === "string"
            ? initialData.profilePhotoId
            : undefined) || null,
        profilePhoto: profilePhoto || undefined,
      });

      if (result.success) {
        // Clear the file state since it's now saved
        setProfilePhoto(null);
        // Always fetch fresh presigned URL if we have a profilePhotoId (either from result or initialData)
        const photoIdToFetch =
          result.data?.profilePhotoId || initialData?.profilePhotoId;
        if (photoIdToFetch && typeof photoIdToFetch === "string") {
          try {
            const photoUrl = await getProfilePhotoUrlAction(photoIdToFetch);
            if (photoUrl) {
              setProfilePhotoUrl(photoUrl);
            } else {
              setProfilePhotoUrl(null);
            }
          } catch (error) {
            console.error("Failed to fetch profile photo URL:", error);
            setProfilePhotoUrl(null);
          }
        } else {
          // No photo ID, clear the URL
          setProfilePhotoUrl(null);
        }
        // Refresh session to update profilePhotoId in header
        await updateSession();
        toast.success("Profile saved successfully");
        onComplete();
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle "Mark as Complete" - saves and marks step as complete
  const handleMarkComplete = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix validation errors before marking as complete");
      return;
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
        profilePhotoId:
          (typeof initialData?.profilePhotoId === "string"
            ? initialData.profilePhotoId
            : undefined) || null,
        profilePhoto: profilePhoto || undefined,
      });

      if (result.success) {
        // Clear the file state since it's now saved
        setProfilePhoto(null);
        // Always fetch fresh presigned URL if we have a profilePhotoId (either from result or initialData)
        const photoIdToFetch =
          result.data?.profilePhotoId || initialData?.profilePhotoId;
        if (photoIdToFetch && typeof photoIdToFetch === "string") {
          try {
            const photoUrl = await getProfilePhotoUrlAction(photoIdToFetch);
            if (photoUrl) {
              setProfilePhotoUrl(photoUrl);
            } else {
              setProfilePhotoUrl(null);
            }
          } catch (error) {
            console.error("Failed to fetch profile photo URL:", error);
            setProfilePhotoUrl(null);
          }
        } else {
          // No photo ID, clear the URL
          setProfilePhotoUrl(null);
        }
        // Refresh session to update profilePhotoId in header
        await updateSession();

        // Update initial form data reference to current values so future changes are detected
        const currentHash = JSON.stringify(values);
        initialFormDataRef.current = currentHash;

        toast.success("Profile saved and marked as complete");
        // Mark step as complete
        if (onMarkComplete) {
          onMarkComplete();
        }
        // Close the step
        onComplete();
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl px-8 py-4 shadow-sm relative">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            {isSettingsPage
              ? "Profile Information"
              : "Complete Your Professional Profile"}
          </h2>
          {!isSettingsPage && (
            <p className="text-sm text-gray-500">
              Provide basic information about yourself. This will be visible to
              insurers referring IMEs.
            </p>
          )}
        </div>
        {/* Mark as Complete Button - Top Right (Onboarding only) */}
        {!isSettingsPage && (
          <Button
            type="button"
            onClick={handleMarkComplete}
            variant="outline"
            className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}>
            <span>Mark as Complete</span>
            <CircleCheck className="w-5 h-5 text-gray-700" />
          </Button>
        )}
      </div>

      <FormProvider form={form} onSubmit={onSubmit} id="profile-form">
        <div className={`space-y-6 ${isSettingsPage ? "pb-20" : ""}`}>
          {/* First Row - First Name, Last Name, Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField name="firstName" label="First Name" required>
              {(field) => (
                <Input
                  {...field}
                  placeholder="Dr. Sarah"
                  icon={User}
                  className="bg-[#F9F9F9]"
                  validationType="name"
                />
              )}
            </FormField>

            <FormField name="lastName" label="Last Name" required>
              {(field) => (
                <Input
                  {...field}
                  placeholder="Ahmed"
                  icon={User}
                  className="bg-[#F9F9F9]"
                  validationType="name"
                />
              )}
            </FormField>

            <FormField name="emailAddress" label="Email Address" required>
              {(field) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="s.ahmed@precisionmed.ca"
                  icon={Mail}
                  className="bg-[#F9F9F9]"
                  disabled={true}
                />
              )}
            </FormField>
          </div>

          {/* Second Row - Professional Title, Years of Experience, Clinic Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormDropdown
              name="professionalTitle"
              label="Professional Title"
              required
              options={professionalTitleOptions}
              placeholder="Select Title"
              from="profile-info-form"
            />

            <FormDropdown
              name="yearsOfExperience"
              label="Years of Experience"
              required
              options={yearsOfExperienceOptions}
              placeholder={loadingYears ? "Loading years..." : "Select Years"}
              from="profile-info-form"
              disabled={loadingYears}
            />

            <FormField name="clinicName" label="Clinic Name" required>
              {(field) => (
                <Input
                  {...field}
                  placeholder="Precision Medical Clinic"
                  icon={Briefcase}
                  className="bg-[#F9F9F9]"
                />
              )}
            </FormField>
          </div>

          {/* Third Row - Clinic Address */}
          <div className="grid grid-cols-1 gap-4">
            <FormGoogleMapsInput
              name="clinicAddress"
              label="Clinic Address"
              required
              from="profile-info-form"
            />
          </div>

          {/* Profile Photo and Bio */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo*
              </label>
              <ProfilePhotoUpload
                currentPhotoUrl={profilePhotoUrl || null}
                onPhotoChange={(file) => {
                  handlePhotoChange(file);
                  // Don't clear profilePhotoUrl here - let the component handle preview
                  // The preview will be shown from FileReader data URL
                }}
                disabled={loading}
                size="md"
              />
            </div>

            {/* Bio */}
            <FormField name="bio" label="Add Bio">
              {(field) => (
                <textarea
                  {...field}
                  placeholder="Your bio helps insurers understand your expertise. Keep it short and professional."
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-[#F9F9F9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent resize-none"
                  disabled={loading}
                />
              )}
            </FormField>
          </div>
        </div>
      </FormProvider>
      {/* Save Changes Button - Bottom Right (Settings only) */}
      {isSettingsPage && (
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            type="button"
            onClick={() => form.handleSubmit(onSubmit)()}
            className="rounded-full bg-[#00A8FF] text-white hover:bg-[#0090d9] px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            disabled={loading}>
            <span>Save Changes</span>
            <CircleCheck className="w-5 h-5 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileInfoForm;
