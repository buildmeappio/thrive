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
import { type getLanguages, reserveTimeSlot, releaseTimeSlot } from '../actions';
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
    caseNumber?: string | null;
    claimantId: string;
    claimantFirstName: string | null;
    claimantLastName: string | null;
    organizationName?: string | null;
    examinationId: string;
    approvedAt?: Date | string | null;
    existingBooking?: {
      id: string;
      examinerProfileId: string;
      examinerName: string | null;
      bookingTime: Date | string;
      interpreterId?: string | null;
      chaperoneId?: string | null;
      transporterId?: string | null;
    } | null;
  };
  initialAvailabilityData?: any | null;
  availabilityError?: string | null;
};

type ClaimantAvailabilityComponentProps = ClaimantAvailabilityProps & {
  languages: Awaited<ReturnType<typeof getLanguages>>['result'];
};

const ClaimantAvailability: React.FC<ClaimantAvailabilityComponentProps> = ({
  caseSummary,
  initialAvailabilityData,
  availabilityError,
}) => {
  const { isSubmitting: _isSubmitting, submitAvailability } = useClaimantAvailability(
    caseSummary.examinationId,
    caseSummary.claimantId
  );
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'appointments' | 'examiners' | 'confirmation'>(
    'examiners'
  );
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<string | null>(null);
  const isBackButtonClicked = useRef(false);

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
        }
      } catch (error) {
        toast.error('Failed to submit availability. Please try again.');
        console.error(error);
        // Go back to examiners step on error
        setCurrentStep('examiners');
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

  // Helper function to transform appointment to form format
  const transformAppointmentToFormData = (appointment: any) => {
    // Validate that selectedAppointment has required fields
    if (!appointment.examinerId || !appointment.slotStart) {
      console.error('Selected appointment missing required fields:', {
        examinerId: appointment.examinerId,
        slotStart: appointment.slotStart,
        fullAppointment: appointment,
      });
      toast.error('Invalid appointment selection. Please try again.');
      return null;
    }

    // Transform the selected appointment to the form format
    // Format: "DD-MonthName-YYYY" to match what transformFormDataToDbFormat expects
    const dateObj = new Date(appointment.date);
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
    const formattedTime = `${new Date(appointment.slotStart).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })} - ${new Date(appointment.slotEnd).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;

    // Determine time band based on slot time
    const hour = new Date(appointment.slotStart).getHours();
    let timeBand = 'EITHER';
    if (hour < 12) {
      timeBand = 'MORNING';
    } else if (hour < 17) {
      timeBand = 'AFTERNOON';
    } else {
      timeBand = 'EVENING';
    }

    // Store the appointment with actual slot times and service provider IDs for transformation
    return {
      date: formattedDate,
      time: timeBand,
      timeLabel: formattedTime,
      // Store actual slot times for the transform function (will be used if available)
      slotStart: appointment.slotStart.toISOString(),
      slotEnd: appointment.slotEnd.toISOString(),
      // Store service provider IDs
      examinerId: appointment.examinerId,
      interpreterId: appointment.interpreterId,
      chaperoneId: appointment.chaperoneId,
      transporterId: appointment.transporterId,
    } as any;
  };

  // Update form when appointment is selected (just set form values, don't submit)
  useEffect(() => {
    if (selectedAppointment && currentStep === 'confirmation') {
      const appointmentData = transformAppointmentToFormData(selectedAppointment);
      if (appointmentData) {
        // Set form values with shouldValidate: false to avoid immediate validation
        form.setValue('appointments', [appointmentData], { shouldValidate: false });
      }
    }
  }, [selectedAppointment, currentStep, form]);

  // No automatic cleanup - DynamoDB TTL will handle expired reservations
  // Manual release only happens via Back button or successful booking

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
          caseNumber={caseSummary.caseNumber || caseSummary.caseId}
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
              existingBooking={caseSummary.existingBooking}
              initialAvailabilityData={initialAvailabilityData}
              initialError={availabilityError}
              onSelectAppointment={async appointmentData => {
                // Validate appointment data before proceeding
                if (!appointmentData.examinerId || !appointmentData.slotStart) {
                  toast.error('Invalid appointment selection. Please try again.');
                  return;
                }

                // Reserve the time slot
                try {
                  const reservationResult = await reserveTimeSlot(
                    appointmentData.examinerId,
                    appointmentData.slotStart.toISOString(),
                    caseSummary.examinationId,
                    caseSummary.claimantId
                  );

                  if (reservationResult.success) {
                    // Store reservation expiry time and appointment data
                    setReservationExpiresAt(reservationResult.expiresAt || null);
                    setSelectedAppointment(appointmentData);
                    setCurrentStep('confirmation');
                  } else {
                    // Slot is no longer available
                    toast.error(reservationResult.message);
                  }
                } catch (error) {
                  console.error('Failed to reserve slot:', error);
                  toast.error('Failed to reserve time slot. Please try again.');
                }
              }}
              onBack={() => setCurrentStep('appointments')}
            />
          ) : (
            <AppointmentConfirmation
              appointment={selectedAppointment}
              claimantName={caseSummary.claimantFirstName || 'Johnathan'}
              onBack={async () => {
                // Only release if user explicitly clicked back (not React remounting)
                if (!isBackButtonClicked.current) {
                  isBackButtonClicked.current = true;

                  // Release the slot when going back
                  if (selectedAppointment && reservationExpiresAt) {
                    console.log('[Index] Back button clicked - releasing slot');
                    await releaseTimeSlot(
                      selectedAppointment.examinerId,
                      selectedAppointment.slotStart.toISOString(),
                      caseSummary.examinationId
                    );
                    setReservationExpiresAt(null);
                  }
                  setCurrentStep('examiners');
                  // Reset for next time
                  setTimeout(() => {
                    isBackButtonClicked.current = false;
                  }, 100);
                } else {
                  console.log('[Index] Back button already processing - skipping');
                }
              }}
              onSubmit={() => {
                // Ensure form values are set before submission
                if (selectedAppointment) {
                  const appointmentData = transformAppointmentToFormData(selectedAppointment);
                  if (appointmentData) {
                    form.setValue('appointments', [appointmentData], { shouldValidate: false });
                    // Submit the form when user clicks Confirm
                    setTimeout(() => {
                      form.handleSubmit(handleSubmit, onError)();
                    }, 50);
                  } else {
                    toast.error('Invalid appointment data. Please go back and try again.');
                  }
                } else {
                  toast.error('No appointment selected. Please go back and select an appointment.');
                }
              }}
              isSubmitting={form.formState.isSubmitting}
              reservationExpiresAt={reservationExpiresAt || undefined}
              examinationId={caseSummary.examinationId}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default ClaimantAvailability;
