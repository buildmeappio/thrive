"use client";
import React from "react";
import { Input } from "@/components/ui";
import { FormField } from "@/components/form";
import { UseFormRegisterReturn } from "@/lib/form";

const DirectDepositTab: React.FC = () => {
  return (
    <div className="px-6 pb-4 bg-white space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <label className="text-sm font-medium text-gray-700 md:min-w-[140px]">
          Transit No.<span className="text-red-500">*</span>
        </label>
        <FormField name="transitNumber">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <Input
              {...field}
              placeholder="88888"
              maxLength={5}
              className="bg-[#F9F9F9] text-center tracking-widest flex-1 h-[40px]"
            />
          )}
        </FormField>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <label className="text-sm font-medium text-gray-700 md:min-w-[140px]">
          Institution No.<span className="text-red-500">*</span>
        </label>
        <FormField name="institutionNumber">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <Input
              {...field}
              placeholder="004"
              maxLength={3}
              className="bg-[#F9F9F9] text-center tracking-widest flex-1 h-[40px]"
            />
          )}
        </FormField>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <label className="text-sm font-medium text-gray-700 md:min-w-[140px]">
          Account Number<span className="text-red-500">*</span>
        </label>
        <FormField name="accountNumber">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <Input
              {...field}
              placeholder="0 800 333"
              maxLength={12}
              className="bg-[#F9F9F9] text-center tracking-widest flex-1 h-[40px]"
            />
          )}
        </FormField>
      </div>
    </div>
  );
};

export default DirectDepositTab;
