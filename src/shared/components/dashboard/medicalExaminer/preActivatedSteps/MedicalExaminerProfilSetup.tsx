"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Check } from 'lucide-react';
import React, { useState } from 'react'
import ProfileForm from './ProfileForm';
import { medicalExaminerProfileSteps } from '@/shared/config/medicalExaminerdashboard/profileSetup/ProfileSteps';

const MedicalExaminerProfilSetup = () => {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const handleComplete = (id: string) => {
    if (!completedSteps.includes(id)) {
      setCompletedSteps([...completedSteps, id])
    }
    const nextStep = (parseInt(id) + 1).toString()
    if (medicalExaminerProfileSteps.find((s) => s.id === nextStep)) {
      setActiveStep(nextStep)
    } else {
      setActiveStep(null)
    }
  }

  const allCompleted = completedSteps.length === medicalExaminerProfileSteps.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Welcome, <span className="text-[#00A8FF]">Dr Sarah!</span>
        </h1>
        <p className="text-gray-600 text-[18px]">
          Let's complete a few steps to activate your dashboard.
        </p>
      </div>
      <Accordion
        type='single'
        collapsible
        value={allCompleted ? "" : activeStep || undefined}
        className='space-y-3'
        onValueChange={(val) => {
          if (allCompleted) {
            return;
          }
          if (!val) {
            setActiveStep(null);
            return;
          }
          const stepNum = parseInt(val);
          const prevStepCompleted = stepNum === 1 || completedSteps.includes((stepNum - 1).toString());
          if (completedSteps.includes(val) || prevStepCompleted) {
            setActiveStep(val);
          }
        }}
      >
        {
          medicalExaminerProfileSteps.map((step) => {
            const isCompleted = completedSteps.includes(step.id)
            const isActive = activeStep === step.id
            const stepNum = parseInt(step.id)
            const prevStepCompleted = stepNum === 1 || completedSteps.includes((stepNum - 1).toString())
            const isDisabled = !prevStepCompleted && !isCompleted

            return (
              <AccordionItem
                key={step.id}
                value={step.id}
                className={`rounded-2xl border bg-white ${isDisabled || (allCompleted && !isActive) ? "opacity-50 pointer-events-none" : ""}`}
              >
                <AccordionTrigger className="flex items-center px-6 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-sm font-medium rounded-full bg-[#9CDDFF] px-5 py-1 text-black">
                      {step.stepNumber}
                    </div>
                    <h3
                      className={`text-[20px] font-normal transition-colors ${isCompleted ? 'line-through text-black' : 'text-black'
                        }`}
                    >
                      {step.title}
                    </h3>
                  </div>

                  {!isCompleted && isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete(step.id);
                      }}
                      className="flex items-center gap-2 px-4 py-1 border border-[#C4C4C4] text-[#6D6D6D] text-[16px] font-normal rounded-full"
                    >
                      Mark as Complete
                      <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#AFAFAF]">
                        <Check size={14} className="text-white" />
                      </span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                      <Check size={20} />
                    </div>
                  )}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  {step.id === '1' && <ProfileForm />}
                  {step.id === '2' && (
                    <div className="p-4 text-gray-500">
                      Choose Your Specialty & IME Preferences content
                    </div>
                  )}
                  {step.id === '3' && (
                    <div className="p-4 text-gray-500">Set Your Availability content</div>
                  )}
                  {step.id === '4' && (
                    <div className="p-4 text-gray-500">Set Up Payout Details content</div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })
        }
      </Accordion>
    </div>
  )
}

export default MedicalExaminerProfilSetup;