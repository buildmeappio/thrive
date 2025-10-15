"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui";
import { Mail, MapPin, User, CircleCheck } from "lucide-react";
import {
  FormProvider,
  FormField,
  FormDropdown,
  FormPhoneInput,
} from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { provinceOptions } from "@/constants/options";
import { useSession } from "next-auth/react";
import {
  getExaminerProfileAction,
  updateExaminerProfileAction,
} from "../../server/actions";
import {
  profileInfoSchema,
  ProfileInfoInput,
} from "../../schemas/onboardingSteps.schema";

interface ProfileInfoFormProps {
  onComplete: () => void;
  onCancel?: () => void;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  onComplete,
  onCancel: _onCancel,
}) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [examinerProfileId, setExaminerProfileId] = useState<string | null>(
    null
  );

  const form = useForm<ProfileInfoInput>({
    schema: profileInfoSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      emailAddress: "",
      provinceOfResidence: "",
      mailingAddress: "",
      bio: "",
    },
    mode: "onSubmit",
  });

  // Fetch examiner profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.accountId) return;

      setLoading(true);
      try {
        const result = await getExaminerProfileAction(session.user.accountId);

        if (result.success && "data" in result && result.data) {
          setExaminerProfileId(result.data.id);
          form.reset({
            firstName: result.data.firstName || "",
            lastName: result.data.lastName || "",
            phoneNumber: result.data.phoneNumber || "",
            emailAddress: result.data.emailAddress || "",
            provinceOfResidence: result.data.provinceOfResidence || "",
            mailingAddress: result.data.mailingAddress || "",
            bio: result.data.bio || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [session, form]);

  const onSubmit = async (values: ProfileInfoInput) => {
    if (!examinerProfileId) {
      console.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      const result = await updateExaminerProfileAction({
        examinerProfileId,
        ...values,
        activationStep: "profile", // Mark step 1 as completed
      });

      if (result.success) {
        onComplete();
      } else {
        console.error("Failed to update profile:", result.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !examinerProfileId) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00A8FF] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium">
          Confirm or Complete Your Profile Info
        </h2>
        <Button
          type="submit"
          form="profile-form"
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center gap-2"
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
              disabled={loading}
            />
          </div>

          {/* Second Row - Email, Province, Mailing Address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className=""
            />

            <FormField name="mailingAddress" label="Mailing Address" required>
              {(field) => (
                <Input
                  {...field}
                  placeholder="125 Bay Street, Suite 600"
                  icon={MapPin}
                  className="bg-[#F9F9F9]"
                />
              )}
            </FormField>
          </div>

          {/* Profile Photo and Bio */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo*
              </label>
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <User size={40} className="text-gray-400" />
              </div>
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
