"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createUser } from "../actions";
import type { CreateUserInput } from "../actions/createUser";
import type { UserTableRow } from "../types/UserData";
import { z } from "zod";

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: UserTableRow) => void;
};

const AddUserModal = ({
  isOpen,
  onClose,
  onUserCreated,
}: AddUserModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const payload: CreateUserInput = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
      };

      const result = await createUser(payload);
      if (!result.success || !result.user) {
        throw new Error(result.error || "Unable to create user");
      }

      onUserCreated(result.user);
      toast.success("User created and invite email sent.");
      handleClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create user";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg rounded-3xl p-0">
        <DialogHeader className="border-b border-gray-100 px-8 py-4">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Add User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-8 py-6">
          <div>
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700"
            >
              First Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              disabled={isSubmitting}
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
              placeholder="Enter last name"
              disabled={isSubmitting}
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

          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email<span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@thrivenetwork.ca"
              disabled={isSubmitting}
              {...register("email")}
              className={errors.email ? "ring-1 ring-red-500" : ""}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-6 flex flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="rounded-full border border-gray-300 px-6"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-6 font-semibold text-white"
            >
              {isSubmitting ? "Creating..." : "Create & Send Email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
