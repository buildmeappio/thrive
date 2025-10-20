"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui";
import {
  Mail,
  // MapPin,
  User,
  CircleCheck,
  PhoneCall,
} from "lucide-react";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import {
  FormProvider,
  FormField,
  FormDropdown,
  FormPhoneInput,
  FormGoogleMapsInput,
} from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { provinceOptions } from "@/constants/options";
import { updateExaminerProfileAction } from "../../server/actions";
import {
  profileInfoSchema,
  ProfileInfoInput,
} from "../../schemas/onboardingSteps.schema";
import { uploadFileToS3 } from "@/lib/s3";
import { toast } from "sonner";

interface ProfileInfoFormProps {
  examinerProfileId: string | null;
  initialData: any;
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
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(
    initialData?.profilePhotoUrl || null
  );

  const form = useForm<ProfileInfoInput>({
    schema: profileInfoSchema,
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phoneNumber: initialData?.phoneNumber || "",
      landlineNumber: initialData?.landlineNumber || "",
      emailAddress: initialData?.emailAddress || "",
      provinceOfResidence: initialData?.provinceOfResidence || "",
      mailingAddress: initialData?.mailingAddress || "",
      bio: initialData?.bio || "",
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
      let uploadedPhotoId = initialData?.profilePhotoId || null;

      // Upload profile photo if a new one was selected
      if (profilePhoto) {
        const uploadResult = await uploadFileToS3(profilePhoto);

        if (uploadResult.success) {
          uploadedPhotoId = uploadResult.document.id;

          // Update preview URL (construct CDN URL)
          const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
          if (cdnUrl) {
            const uploadedUrl = `${cdnUrl}/documents/examiner/${uploadResult.document.name}`;
            setProfilePhotoUrl(uploadedUrl);
          }
        } else {
          toast.error(uploadResult.error || "Failed to upload profile photo");
          setLoading(false);
          return;
        }
      }

      const result = await updateExaminerProfileAction({
        examinerProfileId,
        ...values,
        profilePhotoId: uploadedPhotoId,
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
        <h2 className="text-2xl font-medium">
          Confirm or Complete Your Profile Info
        </h2>
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
          {/* First Row - First Name, Last Name, Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField name="firstName" label="First Name" required>
              {(field) => (
                <Input
                  {...field}
                  placeholder="Dr. Sarah"
                  icon={User}
                  className="bg-[#F9F9F9]"
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
                />
              )}
            </FormField>

            <FormPhoneInput
              name="phoneNumber"
              label="Phone Number"
              required
              className="bg-[#F9F9F9]"
            />
          </div>

          {/* Second Row - Landline Number, Email, Province */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormPhoneInput
              name="landlineNumber"
              label="Landline Number"
              className="bg-[#F9F9F9]"
              required
              icon={PhoneCall}
            />

            <FormField name="emailAddress" label="Email Address" required>
              {(field) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="s.ahmed@precisionmed.ca"
                  icon={Mail}
                  className="bg-[#F9F9F9]"
                />
              )}
            </FormField>

            <FormDropdown
              name="provinceOfResidence"
              label="Province of Residence"
              required
              options={provinceOptions}
              placeholder="Select Province"
              from="profile-info-form"
            />
          </div>

          {/* Third Row - Mailing Address */}
          <div className="grid grid-cols-1 gap-4">
            <FormGoogleMapsInput
              name="mailingAddress"
              label="Mailing Address"
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
                currentPhotoUrl={profilePhotoUrl}
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
                  placeholder="I am Dr. Sarah Ahmed is a board-certified orthopedic surgeon..."
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
