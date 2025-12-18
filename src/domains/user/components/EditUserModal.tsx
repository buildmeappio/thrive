"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { UserTableRow } from "../types/UserData";
import { requestPasswordReset, updateUser } from "../actions";

const schema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
});

type FormValues = z.infer<typeof schema>;

type EditUserModalProps = {
  isOpen: boolean;
  user: UserTableRow | null;
  onClose: () => void;
  onUserUpdated: (user: UserTableRow) => void;
};

const EditUserModal = ({
  isOpen,
  user,
  onClose,
  onUserUpdated,
}: EditUserModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [isOpen, user, reset]);

  const closeModal = () => {
    if (isSaving || isSendingReset) return;
    reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      setIsSaving(true);
      const result = await updateUser({
        id: user.id,
        ...values,
      });
      if (!result.success || !result.user) {
        throw new Error(result.error || "Failed to update user");
      }
      onUserUpdated(result.user);
      toast.success("User updated successfully.");
      closeModal();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    try {
      setIsSendingReset(true);
      const result = await requestPasswordReset({ email: user.email });
      if (!result.success) {
        throw new Error(result.error || "Failed to send reset email");
      }
      toast.success("Password reset email sent successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reset email",
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-2xl rounded-[32px] p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Edit User
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Update the user details or send them a password reset link.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  First Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  disabled={isSaving}
                  pattern="[a-zA-Z\s'-]+"
                  {...register("firstName")}
                  className={errors.firstName ? "ring-1 ring-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  Last Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  disabled={isSaving}
                  pattern="[a-zA-Z\s'-]+"
                  {...register("lastName")}
                  className={errors.lastName ? "ring-1 ring-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  disabled={isSaving}
                  {...register("email")}
                  className={errors.email ? "ring-1 ring-red-500" : ""}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-gray-700"
                >
                  Role
                </Label>
                <Input
                  id="role"
                  type="text"
                  disabled
                  value={user ? formatRole(user.role) : ""}
                  className="mt-1 bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetPassword}
                disabled={isSaving || isSendingReset}
                className="rounded-full border border-gray-300 px-6"
              >
                {isSendingReset ? "Sending..." : "Reset Password"}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-6 font-semibold text-white"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
