"use client";
import React, { useState, useEffect } from "react";
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
import { updateExaminerProfileAction } from "../../server/actions";
import {
  profileInfoSchema,
  ProfileInfoInput,
} from "../../schemas/onboardingSteps.schema";
import { toast } from "sonner";
import authActions from "@/domains/auth/actions";

import { InitialFormData } from "@/types/components";

interface ProfileInfoFormProps {
  examinerProfileId: string | null;
  initialData: InitialFormData;
  onComplete: () => void;
  onCancel?: () => void;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [yearsOfExperienceOptions, setYearsOfExperienceOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loadingYears, setLoadingYears] = useState(true);

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

  const form = useForm({
    schema: profileInfoSchema,
    defaultValues: {
      firstName:
        (typeof initialData?.firstName === "string"
          ? initialData.firstName
          : undefined) || "",
      lastName:
        (typeof initialData?.lastName === "string"
          ? initialData.lastName
          : undefined) || "",
      emailAddress:
        (typeof initialData?.emailAddress === "string"
          ? initialData.emailAddress
          : undefined) || "",
      professionalTitle:
        (typeof initialData?.professionalTitle === "string"
          ? initialData.professionalTitle
          : undefined) || "",
      yearsOfExperience:
        (typeof initialData?.yearsOfExperience === "string"
          ? initialData.yearsOfExperience
          : undefined) || "",
      clinicName:
        (typeof initialData?.clinicName === "string"
          ? initialData.clinicName
          : undefined) || "",
      clinicAddress:
        (typeof initialData?.clinicAddress === "string"
          ? initialData.clinicAddress
          : undefined) || "",
      bio:
        (typeof initialData?.bio === "string" ? initialData.bio : undefined) ||
        "",
    },
    mode: "onSubmit",
  });

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
        activationStep: "profile", // Mark step 1 as completed
      });

      if (result.success) {
        toast.success("Profile updated successfully");
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
    <div className="bg-white rounded-2xl px-8 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            Complete Your Professional Profile{" "}
          </h2>
          <p className="text-sm text-gray-500">
            Provide basic information about yourself. This will be visible to
            insurers referring IMEs.
          </p>
        </div>
        <Button
          type="submit"
          form="profile-form"
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0"
          disabled={loading}>
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      <FormProvider form={form} onSubmit={onSubmit} id="profile-form">
        <div className="space-y-6">
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
              placeholder={
                loadingYears
                  ? "Loading years..."
                  : "Select Years"
              }
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
                onPhotoChange={handlePhotoChange}
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
    </div>
  );
};

export default ProfileInfoForm;
