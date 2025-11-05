"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Chaperone,
  CreateChaperoneInput,
  UpdateChaperoneInput,
} from "../types/Chaperone";
import Dropdown from "@/components/Dropdown";
import { genderOptions } from "@/config/GenderOptions";
import PhoneInput from "@/components/PhoneNumber";
import { ChaperoneFormData, chaperoneFormSchema } from "../schemas/chaperones";

type ChaperoneFormProps = {
  mode: "create" | "edit";
  chaperone?: Chaperone;
  onSubmit: (data: CreateChaperoneInput | UpdateChaperoneInput) => void;
  isSubmitting: boolean;
};

const ChaperoneForm: React.FC<ChaperoneFormProps> = ({
  mode,
  chaperone,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ChaperoneFormData>({
    resolver: zodResolver(chaperoneFormSchema),
    defaultValues: {
      firstName: chaperone?.firstName || "",
      lastName: chaperone?.lastName || "",
      email: chaperone?.email || "",
      phone: chaperone?.phone || "",
      gender: chaperone?.gender || "",
    },
  });

  const gender = watch("gender");
  const phone = watch("phone");

  useEffect(() => {
    if (chaperone) {
      setValue("firstName", chaperone.firstName);
      setValue("lastName", chaperone.lastName);
      setValue("email", chaperone.email);
      setValue("phone", chaperone.phone || "");
      setValue("gender", chaperone.gender || "");
    }
  }, [chaperone, setValue]);

  const handleFormSubmit = (data: ChaperoneFormData) => {
    const submitData: CreateChaperoneInput | UpdateChaperoneInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || undefined,
      gender: data.gender || undefined,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            {...register("firstName")}
            placeholder="Enter first name"
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            {...register("lastName")}
            placeholder="Enter last name"
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="Enter email address"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <PhoneInput
          name="phoneNumber"
          value={phone}
          onChange={(value) => setValue("phone", value.target.value)}
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Dropdown
          label="Gender"
          id="gender"
          options={genderOptions}
          value={gender}
          onChange={(value) => setValue("gender", value)}
          placeholder="Select gender"
        />
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-md">
          {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default ChaperoneForm;