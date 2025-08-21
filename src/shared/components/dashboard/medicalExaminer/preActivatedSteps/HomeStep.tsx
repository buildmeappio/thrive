'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import ProfileForm from '../ProfileForm';

const SimpleStepsWithAccordion = () => {
 const steps = [
    { id: '1', title: 'Confirm or Complete Your Profile Info', stepNumber: 'Step 1', status: 'Mark as Complete' },
    { id: '2', title: 'Choose Your Specialty & IME Preferences', stepNumber: 'Step 2' },
    { id: '3', title: 'Set Your Availability', stepNumber: 'Step 3' },
    { id: '4', title: 'Set Up Payout Details', stepNumber: 'Step 4' },
  ];

  return (
    <div className="mx-auto ">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Welcome, <span className="text-[#00A8FF]">Dr Sarah!</span>
        </h1>
        <p className="text-gray-600 text-[18px]">
          Let's complete a few steps to activate your dashboard.
        </p>
      </div>

      <Accordion type="single" collapsible defaultValue="1" className="space-y-2">
        {steps.map((step) => (
          <AccordionItem
            key={step.id}
            value={step.id}
            className="rounded-lg border border-gray-200 bg-white overflow-hidden"
          >
            <AccordionTrigger className="flex items-center  px-6 py-4 hover:no-underline [&[data-state=open]>div:first-child>h3]:text-black">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-sm font-medium rounded-full bg-[#9CDDFF] px-5 py-1 text-black">
                  {step.stepNumber}
                </div>
                <h3 className="text-[20px] font-medium text-gray-400 transition-colors">
                  {step.title}
                </h3>
              </div>
              {step.status && (
                <div className="flex items-right gap-2 text-sm text-gray-500">
                  <span>{step.status}</span>
                  <div className="w-4 h-4 rounded border border-gray-300"></div>
                </div>
              )}
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6">
              {step.id === '1' && <ProfileForm />}
              {step.id === '2' && <div className="p-4 text-gray-500">Choose Your Specialty & IME Preferences content</div>}
              {step.id === '3' && <div className="p-4 text-gray-500">Set Your Availability content</div>}
              {step.id === '4' && <div className="p-4 text-gray-500">Set Up Payout Details content</div>}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SimpleStepsWithAccordion;
