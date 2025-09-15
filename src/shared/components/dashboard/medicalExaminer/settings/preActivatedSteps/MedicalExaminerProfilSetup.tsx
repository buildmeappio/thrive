"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Check } from 'lucide-react';
import React, { useState } from 'react'
import { MedicalExaminerProfileSteps } from '@/shared/config/medicalExaminerdashboard/profileSetup/ProfileSteps';
import MedicalExaminerProfileStep1 from './MedicalExaminerProfileStep1';
import MedicalExaminerProfileStep2 from './MedicalExaminerProfileStep2';
import MedicalExaminerProfileStep3 from './MedicalExaminerProfileStep3';
import MedicalExaminerProfileStep4 from './MedicalExaminerProfileStep4';

const MedicalExaminerProfilSetup = () => {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const handleComplete = (id: string) => {
    if (!completedSteps.includes(id)) {
      setCompletedSteps([...completedSteps, id])
    }
    const nextStep = (parseInt(id) + 1).toString()
    if (MedicalExaminerProfileSteps.find((s) => s.id === nextStep)) {
      setActiveStep(nextStep)
    } else {
      setActiveStep(null)
    }
  }

  const allCompleted = completedSteps.length === MedicalExaminerProfileSteps.length;

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
          MedicalExaminerProfileSteps.map((step) => {
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
                <AccordionTrigger className="flex flex-col md:flex-row md:items-center px-6 py-3 hover:no-underline gap-2 md:gap-0">
                  {/* Left Section: step number + title */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div
                      className={`text-xs md:text-sm font-medium rounded-md md:rounded-full bg-[#9CDDFF] px-2 md:px-5 py-1 text-black transition-opacity ${isCompleted ? 'opacity-50' : 'opacity-100'}`}
                    >
                      {step.stepNumber}
                    </div>

                    <h3
                      className={`text-sm md:text-[20px] font-normal transition-colors ${isCompleted ? 'line-through text-black' : 'text-black'}`}
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
                      className="flex items-center justify-center md:justify-start gap-2 px-4 py-1 border border-[#C4C4C4] text-[#6D6D6D] text-sm md:text-[16px] font-normal rounded-full w-full md:w-auto"
                    >
                      Mark as Complete
                      <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#AFAFAF]">
                        <Check size={14} className="text-white" />
                      </span>
                    </button>
                  )}
                  {isCompleted && (
                    <div className="w-full md:w-auto flex justify-center md:justify-end mt-2 md:mt-0">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                        <Check size={20} />
                      </div>
                    </div>
                  )}

                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  {step.id === '1' && <MedicalExaminerProfileStep1 />}
                  {step.id === '2' && (
                    <MedicalExaminerProfileStep2 />
                  )}
                  {step.id === '3' && (
                    <MedicalExaminerProfileStep3 />
                  )}
                  {step.id === '4' && (
                    <MedicalExaminerProfileStep4 />
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