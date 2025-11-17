"use client";

import React, { useState } from "react";
import { FormProvider, FormField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { useForm } from "@/hooks/use-form-hook";
import { UseFormRegisterReturn } from "@/lib/form";
import { z } from "zod";
import { toast } from "sonner";
import changePassword from "@/domains/auth/actions/changePassword";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface ChangePasswordSectionProps {
  userId: string;
}

const ChangePasswordSection: React.FC<ChangePasswordSectionProps> = ({
  userId,
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<PasswordFormData>({
    schema: passwordSchema,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: PasswordFormData) => {
    setLoading(true);
    try {
      const result = await changePassword({
        userId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      if (result.success) {
        toast.success("Password changed successfully");
        form.reset();
      } else {
        toast.error(result.message || "Failed to change password");
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
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Change Password</h2>

      <FormProvider form={form} onSubmit={onSubmit}>
        <div className="space-y-4 mb-6 max-w-md">
          <FormField
            name="currentPassword"
            label="Current Password"
            required>
            {(field: UseFormRegisterReturn & { error?: boolean }) => (
              <PasswordInput
                {...field}
                placeholder="Enter current password"
                className="bg-[#F9F9F9]"
              />
            )}
          </FormField>

          <FormField
            name="newPassword"
            label="New Password"
            required
            hint="Must be at least 6 characters with one uppercase letter, one lowercase letter, and one number">
            {(field: UseFormRegisterReturn & { error?: boolean }) => (
              <PasswordInput
                {...field}
                placeholder="Enter new password"
                className="bg-[#F9F9F9]"
              />
            )}
          </FormField>

          <FormField
            name="confirmPassword"
            label="Confirm Password"
            required>
            {(field: UseFormRegisterReturn & { error?: boolean }) => (
              <PasswordInput
                {...field}
                placeholder="Confirm new password"
                className="bg-[#F9F9F9]"
              />
            )}
          </FormField>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="px-6 rounded-md bg-[#00A8FF] hover:bg-[#0096E6] text-white">
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </FormProvider>
    </div>
  );
};

export default ChangePasswordSection;

