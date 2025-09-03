'use client';
import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const ConsentInfo = () => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="rounded-4xl items-center justify-center bg-[#FFFFFF] p-4 sm:p-8">
      <div className="">
        {/* Header */}
        <div className='mb-6 sm:mb-8'>
        <h1 className="text-2xl sm:text-[36.02px] font-bold text-gray-900">Consent Confirmation</h1>
           
        </div>
        {/* Checkbox Section */}
        <div className="mb-20 sm:mb-40">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked: boolean) => setIsChecked(checked as boolean)}
              className="mt-1"
              style={{
                backgroundColor: isChecked ? '#000080' : 'transparent',
                borderColor: isChecked ? '#000080' : '#d1d5db'
              }}
            />
            <div
              className="cursor-pointer text-sm leading-relaxed text-gray-700"
              onClick={() => setIsChecked(!isChecked)}
            >
              I confirm that the claimant has provided informed consent for this medical
              examination, and I am authorized<span className="hidden sm:inline"><br/></span> to submit this referral on their behalf.
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Legal Disclaimer</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            By submitting this referral, you acknowledge that the claimant has been informed of the
            purpose and scope of the<span className="hidden sm:inline"><br/></span> independent medical examination (IME), and has consented to the
            collection, use, and disclosure of their personal<span className="hidden sm:inline"><br/></span> health information in accordance with
            applicable privacy legislation. Thrive Assessment & Care is not liable for any<span className="hidden sm:inline"><br/></span> referrals
            submitted without proper authorization.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 mt-8 sm:mt-12 space-y-4 sm:space-y-0">
          <Button variant="outline" className="flex items-center border border-[#000080] rounded-3xl space-x-2 px-6 sm:px-10 py-1 w-full sm:w-auto justify-center order-1 sm:order-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-3 w-full sm:w-auto order-2 sm:order-2">
            <Button variant="outline" className="flex items-center bg-[#0000BA] text-white rounded-3xl space-x-2 px-6 sm:px-10 py-1 w-full sm:w-auto justify-center">
              <span>Save as Draft</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              className="flex items-center space-x-2 bg-[#000080] px-6 sm:px-10 py-1 rounded-3xl w-full sm:w-auto justify-center"
            >
              <span>Submit</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentInfo;