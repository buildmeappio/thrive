'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import AppointmentOptions from './AppointmentOptions'; // Commented out - Step 1 is disabled
import ExaminerOptions from './ExaminerOptions';
import AppointmentConfirmation from './AppointmentConfirmation';
import UserInfo from './UserInfo';
import { useClaimantAvailability } from '@/hooks/useCliamantAvailability';
import { toast } from 'sonner';
import { type getLanguages } from '../actions';
import {
  type ClaimantAvailabilityFormData,
  claimantAvailabilityInitialValues,
  claimantAvailabilitySchema,
} from '../schemas/claimantAvailability';
import { URLS } from '@/constants/routes';
import useRouter from '@/hooks/useRouter';

type ClaimantAvailabilityProps = {
  caseSummary: {
    caseId: string;
    claimantId: string;
    claimantFirstName: string | null;
    claimantLastName: string | null;
    organizationName?: string | null;
    examinationId: string;
  };
};

type ClaimantAvailabilityComponentProps = ClaimantAvailabilityProps & {
  languages: Awaited<ReturnType<typeof getLanguages>>['result'];
};

const ClaimantAvailability: React.FC<ClaimantAvailabilityComponentProps> = ({ caseSummary }) => {
  const { isSubmitting: _isSubmitting, submitAvailability } = useClaimantAvailability(
    caseSummary.caseId,
    caseSummary.claimantId
  );
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'appointments' | 'examiners' | 'confirmation'>(
    'examiners'
  );
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const form = useForm<ClaimantAvailabilityFormData>({
    resolver: zodResolver(claimantAvailabilitySchema),
    defaultValues: claimantAvailabilityInitialValues,
    mode: 'onChange',
  });

  const handleSubmit = async (data: ClaimantAvailabilityFormData) => {
    try {
      const result = await submitAvailability(data);
      if (result.success) {
        router.push(URLS.SUCCESS);
      }
    } catch (error) {
      toast.error('Failed to submit availability. Please try again.');
      console.error(error);
    }
  };

  const onError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  return (
    <div>
      {/* Heading */}
      {currentStep !== 'confirmation' && (
        <h1 className="py-4 text-center text-2xl leading-tight font-semibold tracking-normal capitalize sm:text-3xl lg:text-[36px]">
          Help Us Schedule Your IME
        </h1>
      )}

      {/* User Info - Only show for appointments and examiners steps */}
      {currentStep !== 'confirmation' && (
        <UserInfo
          caseId={caseSummary.caseId}
          claimantFirstName={caseSummary.claimantFirstName ?? ''}
          claimantLastName={caseSummary.claimantLastName ?? ''}
          organizationName={caseSummary.organizationName ?? ''}
        />
      )}

      {/* Form container */}
      <form onSubmit={form.handleSubmit(handleSubmit, onError)}>
        <div className="mx-auto w-full space-y-8">
          {/* Step 1 - Appointments (commented out for now) */}
          {/* {currentStep === 'appointments' ? (
            <AppointmentOptions form={form} onCheckExaminers={() => setCurrentStep('examiners')} />
          ) : currentStep === 'examiners' ? ( */}
          {currentStep === 'examiners' ? (
            <ExaminerOptions
              examId={caseSummary.examinationId}
              caseId={caseSummary.caseId}
              onSelectAppointment={appointmentData => {
                setSelectedAppointment(appointmentData);
                setCurrentStep('confirmation');
              }}
              onBack={() => setCurrentStep('appointments')}
            />
          ) : (
            <AppointmentConfirmation
              appointment={selectedAppointment}
              claimantName={caseSummary.claimantFirstName || 'Johnathan'}
              onBack={() => setCurrentStep('examiners')}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default ClaimantAvailability;
