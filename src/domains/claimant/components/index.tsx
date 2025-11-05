'use client';
import React, { useState, useEffect } from 'react';
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
    defaultValues: {
      ...claimantAvailabilityInitialValues,
      agreement: true, // Pre-check agreement since we're not showing the checkbox in this flow
    },
    mode: 'onSubmit', // Only validate on submit
    reValidateMode: 'onSubmit', // Only re-validate on submit after first validation
    shouldFocusError: false, // Don't focus on error fields
  });

  // Update form when appointment is selected
  useEffect(() => {
    if (selectedAppointment) {
      // Transform the selected appointment to the form format
      // Format: "DD-MonthName-YYYY" to match what transformFormDataToDbFormat expects
      const dateObj = new Date(selectedAppointment.date);
      const day = dateObj.getDate().toString().padStart(2, '0');
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const month = monthNames[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      const formattedTime = `${new Date(selectedAppointment.slotStart).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })} - ${new Date(selectedAppointment.slotEnd).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;

      // Determine time band based on slot time
      const hour = new Date(selectedAppointment.slotStart).getHours();
      let timeBand = 'EITHER';
      if (hour < 12) {
        timeBand = 'MORNING';
      } else if (hour < 17) {
        timeBand = 'AFTERNOON';
      } else {
        timeBand = 'EVENING';
      }

      // Store the appointment with actual slot times for transformation
      form.setValue('appointments', [
        {
          date: formattedDate,
          time: timeBand,
          timeLabel: formattedTime,
          // Store actual slot times for the transform function (will be used if available)
          slotStart: selectedAppointment.slotStart.toISOString(),
          slotEnd: selectedAppointment.slotEnd.toISOString(),
        } as any,
      ]);
    }
  }, [selectedAppointment, form]);

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
    // Only show errors if we're actually trying to submit (not just on page load)
    // Check if we have an appointment selected - if not, we're probably still in selection phase
    if (currentStep === 'confirmation' || form.getValues('appointments')?.length > 0) {
      const firstError = Object.values(errors)[0] as any;
      if (firstError?.message) {
        toast.error(firstError.message);
      }
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
