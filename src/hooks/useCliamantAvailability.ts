'use client';

import { createClaimantBooking } from '@/domains/claimant/actions';
import { type ClaimantAvailabilityFormData } from '@/domains/claimant/schemas/claimantAvailability';
import type { CreateClaimantBookingData } from '@/domains/claimant/types/claimantAvailability';
import { useState } from 'react';
import { toast } from 'sonner';

export function useClaimantAvailability(examinationId: string, claimantId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAvailability = async (formData: ClaimantAvailabilityFormData) => {
    setIsSubmitting(true);

    try {
      // Always use new booking flow - examinerId should always be present
      const firstAppointment = formData.appointments[0] as any;

      // Debug logging
      console.log('submitAvailability - formData:', formData);
      console.log('submitAvailability - firstAppointment:', firstAppointment);
      console.log('submitAvailability - examinerId:', firstAppointment?.examinerId);
      console.log('submitAvailability - slotStart:', firstAppointment?.slotStart);

      if (!firstAppointment?.examinerId || !firstAppointment?.slotStart) {
        console.error('Validation failed - missing fields:', {
          hasExaminerId: !!firstAppointment?.examinerId,
          hasSlotStart: !!firstAppointment?.slotStart,
          examinerId: firstAppointment?.examinerId,
          slotStart: firstAppointment?.slotStart,
          fullAppointment: firstAppointment,
        });
        toast.error('Please select an examiner and time slot');
        return { success: false, error: 'Missing booking information' };
      }

      const bookingData = transformFormDataToBookingFormat(formData, examinationId, claimantId);
      const result = await createClaimantBooking(bookingData);

      if (result.success) {
        toast.success('Your appointment has been booked successfully!');
        return { success: true };
      } else {
        toast.error('Failed to book appointment');
        return { success: false, error: 'Booking failed' };
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitAvailability,
  };
}

export function transformFormDataToBookingFormat(
  formData: ClaimantAvailabilityFormData,
  examinationId: string,
  claimantId: string
): CreateClaimantBookingData {
  // Get the first appointment (should only be one when booking)
  const appointment = formData.appointments[0] as any;

  if (!appointment?.slotStart || !appointment?.examinerId) {
    throw new Error('Missing required booking information');
  }

  const bookingTime = new Date(appointment.slotStart);
  const preference = formData.preference;

  return {
    examinationId,
    claimantId,
    examinerProfileId: appointment.examinerId,
    bookingTime,
    preference,
    accessibilityNotes: formData.accessibilityNotes || undefined,
    consentAck: formData.agreement || false,
    interpreterId: appointment.interpreterId || undefined,
    chaperoneId: appointment.chaperoneId || undefined,
    transporterId: appointment.transporterId || undefined,
  };
}
