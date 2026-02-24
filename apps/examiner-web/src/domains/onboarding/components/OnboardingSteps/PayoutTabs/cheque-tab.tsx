'use client';
import React from 'react';
import { Input } from '@/components/ui';
import { FormField } from '@/components/form';
import { UseFormRegisterReturn } from '@/lib/form';

const ChequeTab: React.FC = () => {
  return (
    <div className="space-y-4 bg-white px-6 pb-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <label className="text-sm font-medium text-gray-700 md:min-w-[140px]">
          Mailing Address<span className="text-red-500">*</span>
        </label>
        <FormField name="chequeMailingAddress">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <Input
              {...field}
              placeholder="Enter mailing address for cheque delivery"
              className="h-[40px] flex-1 bg-[#F9F9F9]"
              validationType="address"
            />
          )}
        </FormField>
      </div>
    </div>
  );
};

export default ChequeTab;
