'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    caseSummary.examinationId,
    caseSummary.claimantId
  );
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'appointments' | 'examiners' | 'confirmation'>(
    'examiners'
  );
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const hasSubmittedRef = useRef(false);

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

  const handleSubmit = useCallback(
    async (data: ClaimantAvailabilityFormData) => {
      try {
        const result = await submitAvailability(data);
        if (result.success) {
          // Only redirect to success page after successful submission
          router.push(URLS.SUCCESS);
        } else {
          // If submission fails, go back to examiners step
          setCurrentStep('examiners');
          hasSubmittedRef.current = false; // Reset so it can try again
        }
      } catch (error) {
        toast.error('Failed to submit availability. Please try again.');
        console.error(error);
        // Go back to examiners step on error
        setCurrentStep('examiners');
        hasSubmittedRef.current = false; // Reset so it can try again
      }
    },
    [submitAvailability, router]
  );

  const onError = useCallback(
    (errors: any) => {
      // Only show errors if we're actually trying to submit (not just on page load)
      // Check if we have an appointment selected - if not, we're probably still in selection phase
      if (currentStep === 'confirmation' || form.getValues('appointments')?.length > 0) {
        const firstError = Object.values(errors)[0] as any;
        if (firstError?.message) {
          toast.error(firstError.message);
        }
      }
    },
    [currentStep, form]
  );

  // Update form when appointment is selected and auto-submit
  useEffect(() => {
    // Only auto-submit if we have an appointment but haven't submitted yet
    // Don't require currentStep to be 'confirmation' - we'll set that after success
    if (selectedAppointment && !hasSubmittedRef.current && currentStep !== 'confirmation') {
      // Validate that selectedAppointment has required fields
      if (!selectedAppointment.examinerId || !selectedAppointment.slotStart) {
        console.error('Selected appointment missing required fields:', {
          examinerId: selectedAppointment.examinerId,
          slotStart: selectedAppointment.slotStart,
          fullAppointment: selectedAppointment,
        });
        toast.error('Invalid appointment selection. Please try again.');
        return;
      }

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

      // Store the appointment with actual slot times and service provider IDs for transformation
      const appointmentData = {
        date: formattedDate,
        time: timeBand,
        timeLabel: formattedTime,
        // Store actual slot times for the transform function (will be used if available)
        slotStart: selectedAppointment.slotStart.toISOString(),
        slotEnd: selectedAppointment.slotEnd.toISOString(),
        // Store service provider IDs
        examinerId: selectedAppointment.examinerId,
        interpreterId: selectedAppointment.interpreterId,
        chaperoneId: selectedAppointment.chaperoneId,
        transporterId: selectedAppointment.transporterId,
      } as any;

      // Set form values with shouldValidate: false to avoid immediate validation
      form.setValue('appointments', [appointmentData], { shouldValidate: false });

      // Auto-submit the form when moving to confirmation step
      // Use setTimeout to ensure form values are set before submission
      hasSubmittedRef.current = true;

      // Wait for React Hook Form to update, then submit
      // Use requestAnimationFrame to ensure DOM and form state are updated
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Get the current form values
          const formValues = form.getValues();
          const appointment = (formValues.appointments?.[0] as any) || {};

          // Debug: log the appointment data
          console.log('Attempting to submit with appointment:', {
            examinerId: appointment.examinerId,
            slotStart: appointment.slotStart,
            hasExaminerId: !!appointment.examinerId,
            hasSlotStart: !!appointment.slotStart,
            appointmentKeys: Object.keys(appointment),
            fullAppointment: appointment,
          });

          // Verify required fields are present
          // slotStart might be a string (ISO format) or could be undefined
          if (appointment.examinerId && appointment.slotStart) {
            // Show loading state - change to confirmation step to show "submitting" state
            setCurrentStep('confirmation');
            // Use a small delay to ensure step change is rendered
            setTimeout(() => {
              form.handleSubmit(handleSubmit, onError)();
            }, 50);
          } else {
            // If values aren't set yet, wait a bit more and try again
            console.warn('Form values not ready, retrying...', {
              appointment,
              formState: form.formState,
            });
            setTimeout(() => {
              const retryValues = form.getValues();
              const retryAppointment = (retryValues.appointments?.[0] as any) || {};
              console.log('Retry attempt - appointment:', retryAppointment);
              if (retryAppointment.examinerId && retryAppointment.slotStart) {
                setCurrentStep('confirmation');
                setTimeout(() => {
                  form.handleSubmit(handleSubmit, onError)();
                }, 50);
              } else {
                console.error('Failed to set form values after retry:', {
                  retryAppointment,
                  allFormValues: retryValues,
                });
                toast.error('Failed to submit booking. Please try again.');
                // Reset so user can try again
                setSelectedAppointment(null);
                hasSubmittedRef.current = false;
              }
            }, 300);
          }
        }, 100);
      });
    }
  }, [selectedAppointment, currentStep, form, handleSubmit, onError]);

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
                // Validate appointment data before proceeding
                if (!appointmentData.examinerId || !appointmentData.slotStart) {
                  toast.error('Invalid appointment selection. Please try again.');
                  return;
                }
                // Set appointment and trigger form submission
                // Don't change step yet - wait for successful submission
                setSelectedAppointment(appointmentData);
                // The useEffect will handle form submission and step change
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
