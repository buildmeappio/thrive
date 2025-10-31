'use client';

import { createClaimantAvailability } from '@/domains/claimant/actions';
import { type ClaimantAvailabilityFormData } from '@/domains/claimant/schemas/claimantAvailability';
import type {
  ClaimantAvailabilityService,
  ClaimantAvailabilitySlot,
  CreateClaimantAvailabilityData,
} from '@/domains/claimant/types/claimantAvailability';
import { ClaimantPreference, TimeBand } from '@prisma/client';
import { useState } from 'react';
import { toast } from 'sonner';

export function useClaimantAvailability(caseId: string, claimantId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAvailability = async (formData: ClaimantAvailabilityFormData) => {
    setIsSubmitting(true);

    try {
      const transformedData = transformFormDataToDbFormat(formData, caseId, claimantId);
      const result = await createClaimantAvailability(transformedData);

      if (result.success) {
        toast.success('Your availability has been submitted successfully!');
        return { success: true };
      } else {
        toast.error('Failed to submit availability');
        return { success: false, error: 'Submission failed' };
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

export function transformFormDataToDbFormat(
  formData: ClaimantAvailabilityFormData,
  caseId: string,
  claimantId: string
): CreateClaimantAvailabilityData {
  const slots: ClaimantAvailabilitySlot[] = formData.appointments.map((apt: any) => {
    // If we have actual slot times from the selected appointment, use them
    if (apt.slotStart && apt.slotEnd) {
      const start = new Date(apt.slotStart);
      const end = new Date(apt.slotEnd);
      const date = new Date(start);
      date.setHours(0, 0, 0, 0);

      // Format times as HH:mm
      const startTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
      const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

      // Determine time band based on start hour
      let timeBand: TimeBand = TimeBand.EITHER;
      const hour = start.getHours();
      if (hour < 12) {
        timeBand = TimeBand.MORNING;
      } else if (hour < 17) {
        timeBand = TimeBand.AFTERNOON;
      } else {
        timeBand = TimeBand.EVENING;
      }

      return {
        date: date.toISOString().split('T')[0],
        startTime,
        endTime,
        start,
        end,
        timeBand,
      };
    }

    // Fallback to old logic for backward compatibility
    const [day, month, year] = apt.date.split('-');
    const date = new Date(parseInt(year), getMonthIndex(month), parseInt(day));

    let startTime = '08:00';
    let endTime = '17:00';
    let timeBand: TimeBand = TimeBand.EITHER;

    switch (apt.time) {
      case TimeBand.MORNING:
        startTime = '08:00';
        endTime = '12:00';
        timeBand = TimeBand.MORNING;
        break;
      case TimeBand.AFTERNOON:
        startTime = '12:00';
        endTime = '17:00';
        timeBand = TimeBand.AFTERNOON;
        break;
      default:
        timeBand = TimeBand.EITHER;
    }

    const start = new Date(date);
    start.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));

    const end = new Date(date);
    end.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));

    return {
      date: date.toISOString().split('T')[0],
      startTime,
      endTime,
      start,
      end,
      timeBand,
    };
  });

  // Convert services
  const services: ClaimantAvailabilityService[] = [];

  if (formData.interpreter) {
    services.push({
      type: 'interpreter',
      enabled: true,
      interpreter: formData.interpreterLanguage
        ? {
            languageId: formData.interpreterLanguage,
          }
        : undefined,
    });
  }

  if (formData.transportation) {
    services.push({
      type: 'transport',
      enabled: true,
      transport: {
        rawLookup: formData.pickupAddress || undefined,
        notes:
          [
            formData.streetAddress,
            formData.aptUnitSuite,
            formData.city,
            formData.postalCode,
            formData.province,
          ]
            .filter(Boolean)
            .join(', ') || undefined,
      },
    });
  }

  if (formData.chaperone) {
    services.push({
      type: 'chaperone',
      enabled: true,
    });
  }

  // Convert preference
  let preference: ClaimantPreference;
  switch (formData.preference) {
    case ClaimantPreference.IN_PERSON:
      preference = ClaimantPreference.IN_PERSON;
      break;
    case ClaimantPreference.VIRTUAL:
      preference = ClaimantPreference.VIRTUAL;
      break;
    default:
      preference = ClaimantPreference.EITHER;
  }

  return {
    caseId,
    claimantId,
    preference,
    accessibilityNotes: formData.accessibilityNotes || undefined,
    additionalNotes: formData.additionalNotesText || undefined,
    consentAck: formData.agreement || false,
    slots,
    services,
  };
}

function getMonthIndex(monthName: string): number {
  const months = [
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
  return months.indexOf(monthName);
}
