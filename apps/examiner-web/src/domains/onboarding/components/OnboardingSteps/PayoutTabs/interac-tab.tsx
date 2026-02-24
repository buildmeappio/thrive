'use client';
import React from 'react';
import { Input } from '@/components/ui';
import { FormField } from '@/components/form';
import { UseFormRegisterReturn, useFormContext } from '@/lib/form';

const InteracTab: React.FC = () => {
  const form = useFormContext();
  const autodepositEnabled = form.watch('autodepositEnabled') ?? false;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Email Address<span className="text-red-500">*</span>
        </label>
        <FormField name="interacEmail">
          {(field: UseFormRegisterReturn & { error?: boolean }) => (
            <Input
              {...field}
              type="email"
              placeholder="your.email@example.com"
              className="h-[40px] flex-1 bg-[#F9F9F9]"
            />
          )}
        </FormField>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Autodeposit Enabled?</label>
        <FormField name="autodepositEnabled">
          {_field => (
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="autodepositEnabled"
                  value="yes"
                  checked={autodepositEnabled === true}
                  onChange={() => {
                    form.setValue('autodepositEnabled', true);
                  }}
                  className="h-4 w-4 text-[#00A8FF] focus:ring-[#00A8FF]"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="autodepositEnabled"
                  value="no"
                  checked={autodepositEnabled === false}
                  onChange={() => {
                    form.setValue('autodepositEnabled', false);
                  }}
                  className="h-4 w-4 text-[#00A8FF] focus:ring-[#00A8FF]"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          )}
        </FormField>
      </div>
    </div>
  );
};

export default InteracTab;
