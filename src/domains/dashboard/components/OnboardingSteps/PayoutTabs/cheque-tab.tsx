"use client";
import React from "react";
import { Input } from "@/components/ui";
import { FormField } from "@/components/form";
import { UseFormRegisterReturn } from "@/lib/form";

const ChequeTab: React.FC = () => {
  return (
    <div className="px-6 pb-4 bg-white space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <label className="text-sm font-medium text-gray-700 md:min-w-[140px]">
          Mailing Address<span className="text-red-500">*</span>
        </label>
        <FormField name="chequeMailingAddress">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <Input
              {...field}
              placeholder="Enter mailing address for cheque delivery"
              className="bg-[#F9F9F9] flex-1 h-[40px]"
            />
          )}
        </FormField>
      </div>
    </div>
  );
};

export default ChequeTab;
