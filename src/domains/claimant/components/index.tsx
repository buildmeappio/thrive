'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AppointmentOptions from './AppointmentOptions';
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
  };
};

type ClaimantAvailabilityComponentProps = ClaimantAvailabilityProps & {
  languages: Awaited<ReturnType<typeof getLanguages>>['result'];
};

const ClaimantAvailability: React.FC<ClaimantAvailabilityComponentProps> = ({ caseSummary }) => {
  const { isSubmitting, submitAvailability } = useClaimantAvailability(
    caseSummary.caseId,
    caseSummary.claimantId
  );
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'appointments' | 'examiners' | 'confirmation'>(
    'appointments'
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
          {currentStep === 'appointments' ? (
            <AppointmentOptions form={form} onCheckExaminers={() => setCurrentStep('examiners')} />
          ) : currentStep === 'examiners' ? (
            <ExaminerOptions
              onSelectAppointment={appointmentId => {
                // Find the selected appointment from the data
                const appointmentData = {
                  id: appointmentId,
                  date: 'May 10, 2025',
                  time: '11:30 AM',
                  doctor: {
                    name: 'Dr. Mark Thompson',
                    specialty: 'Cardiologist',
                    credentials: 'FACC, ABIM',
                  },
                  clinic: 'Heart Health Institute',
                  requirements: {
                    interpreter: 'Required',
                    transport: 'MedTransit',
                    chaperone: 'Required',
                  },
                };
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
