"use client";
import React from "react";
import { Input } from "@/components/ui";
import { FormField } from "@/components/form";
import { UseFormRegisterReturn } from "@/lib/form";
import { MaskedInput } from "./masked-input";

const DirectDepositTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Legal Name<span className="text-red-500">*</span>
        </label>
        <FormField name="legalName">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <Input
              {...field}
              placeholder="Enter your legal name"
              className="bg-[#F9F9F9] flex-1 h-[40px]"
            />
          )}
        </FormField>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          SIN<span className="text-red-500">*</span>
        </label>
        <FormField name="sin">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <MaskedInput
              {...field}
              placeholder="123456789"
              maxLength={9}
              className="bg-[#F9F9F9] text-center tracking-widest flex-1 h-[40px]"
            />
          )}
        </FormField>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Institution Number<span className="text-red-500">*</span>
        </label>
        <FormField name="institutionNumber">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <Input
              {...field}
              placeholder="004"
              maxLength={3}
              className="bg-[#F9F9F9] text-center tracking-widest flex-1 h-[40px]"
              validationType="banking"
            />
          )}
        </FormField>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Transit Number<span className="text-red-500">*</span>
        </label>
        <FormField name="transitNumber">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <Input
              {...field}
              placeholder="88888"
              maxLength={5}
              className="bg-[#F9F9F9] text-center tracking-widest flex-1 h-[40px]"
              validationType="banking"
            />
          )}
        </FormField>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Account Number<span className="text-red-500">*</span>
        </label>
        <FormField name="accountNumber">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <Input
              {...field}
              placeholder="0800333"
              maxLength={12}
              className="bg-[#F9F9F9] text-center tracking-widest flex-1 h-[40px]"
              validationType="banking"
            />
          )}
        </FormField>
      </div>
    </div>
  );
};

export default DirectDepositTab;
