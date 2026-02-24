'use client';
import { useMemo } from 'react';
import {
  convertAvailabilityToUTC,
  convertAvailabilityToLocal,
  convertUTCToLocal,
} from '@/utils/timeConversion';
import { timeOptions } from '@/constants/options';
import { AvailabilityPreferencesInput } from '../schemas/onboardingSteps.schema';
import { availabilityInitialValues } from '../constants/initialValues';

interface InitialAvailabilityData {
  weeklyHours?: any;
  overrideHours?: any[];
  bookingOptions?: {
    maxIMEsPerWeek?: string;
    minimumNotice?: string;
  };
}

/**
 * Hook for handling availability time conversion and data processing
 * Converts UTC times from database to local times for display
 */
export function useAvailabilityTimeConversion(initialData?: InitialAvailabilityData) {
  const formInitialData = useMemo(() => {
    // Check if we have valid data from DB
    const hasDbData =
      initialData &&
      initialData.weeklyHours &&
      typeof initialData.weeklyHours === 'object' &&
      Object.keys(initialData.weeklyHours).length > 0;

    let dbData: Partial<AvailabilityPreferencesInput>;
    if (hasDbData) {
      // Convert UTC to local time for display (using browser's timezone)
      const converted = convertAvailabilityToLocal(initialData);

      // Double-check conversion: if times are still in UTC format (HH:mm), convert them manually
      let processedWeeklyHours = converted.weeklyHours;
      if (processedWeeklyHours) {
        const days = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ] as const;
        const newWeeklyHours: any = {};

        days.forEach(day => {
          const dayData = processedWeeklyHours?.[day];
          if (dayData) {
            newWeeklyHours[day] = {
              enabled: dayData.enabled,
              timeSlots: dayData.timeSlots.map((slot: { startTime: string; endTime: string }) => {
                // Check if times are in UTC format (HH:mm) - if so, convert to local
                let startTime = slot.startTime;
                let endTime = slot.endTime;

                // If time is in UTC format (HH:mm like "13:00"), convert it using browser's timezone
                if (/^\d{1,2}:\d{2}$/.test(startTime) && !timeOptions.includes(startTime)) {
                  startTime = convertUTCToLocal(startTime);
                }
                if (/^\d{1,2}:\d{2}$/.test(endTime) && !timeOptions.includes(endTime)) {
                  endTime = convertUTCToLocal(endTime);
                }

                return { startTime, endTime };
              }),
            };
          }
        });
        processedWeeklyHours = newWeeklyHours;
      }

      dbData = {
        weeklyHours: processedWeeklyHours,
        overrideHours: converted.overrideHours,
        bookingOptions: converted.bookingOptions
          ? {
              maxIMEsPerWeek: (converted.bookingOptions as any).maxIMEsPerWeek || '',
              minimumNotice: (converted.bookingOptions as any).minimumNotice || '',
            }
          : undefined,
      };
    } else {
      // No DB data, use initial values
      dbData = availabilityInitialValues;
    }

    // Ensure bookingOptions has the correct type from DB
    const dbBookingOptions = dbData.bookingOptions
      ? {
          maxIMEsPerWeek: (dbData.bookingOptions as any).maxIMEsPerWeek || '',
          minimumNotice: (dbData.bookingOptions as any).minimumNotice || '',
        }
      : undefined;

    return {
      weeklyHours: dbData.weeklyHours || availabilityInitialValues.weeklyHours,
      overrideHours: dbData.overrideHours || [],
      bookingOptions: (dbBookingOptions || {
        maxIMEsPerWeek: '',
        minimumNotice: '',
      }) as { maxIMEsPerWeek: string; minimumNotice: string },
    };
  }, [initialData]);

  // Ensure all days have proper structure with valid time slots
  const ensuredFormData = useMemo(() => {
    const weeklyHours = {
      sunday: formInitialData.weeklyHours?.sunday || {
        enabled: false,
        timeSlots: [],
      },
      monday: formInitialData.weeklyHours?.monday || {
        enabled: true,
        timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
      },
      tuesday: formInitialData.weeklyHours?.tuesday || {
        enabled: true,
        timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
      },
      wednesday: formInitialData.weeklyHours?.wednesday || {
        enabled: true,
        timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
      },
      thursday: formInitialData.weeklyHours?.thursday || {
        enabled: true,
        timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
      },
      friday: formInitialData.weeklyHours?.friday || {
        enabled: true,
        timeSlots: [{ startTime: '8:00 AM', endTime: '11:00 AM' }],
      },
      saturday: formInitialData.weeklyHours?.saturday || {
        enabled: false,
        timeSlots: [],
      },
    };

    // Clean up time slots - ensure they have valid non-empty values and are in the correct format
    Object.keys(weeklyHours).forEach(day => {
      const dayKey = day as keyof typeof weeklyHours;
      const dayData = weeklyHours[dayKey];

      if (dayData.timeSlots && dayData.timeSlots.length > 0) {
        // Filter out invalid slots and ensure valid values that match timeOptions
        dayData.timeSlots = dayData.timeSlots
          .map(slot => {
            // Check if times are in the timeOptions array (12-hour format)
            // If not, they might be in UTC format (HH:mm) and need conversion
            let startTime = slot.startTime && slot.startTime.trim() ? slot.startTime : '8:00 AM';
            let endTime = slot.endTime && slot.endTime.trim() ? slot.endTime : '11:00 AM';

            // If startTime is not in timeOptions, it might be in UTC format - try to convert
            if (!timeOptions.includes(startTime) && /^\d{1,2}:\d{2}$/.test(startTime)) {
              // It's in UTC format (HH:mm), convert to local
              const converted = convertUTCToLocal(startTime);
              startTime = timeOptions.includes(converted) ? converted : '8:00 AM';
            } else if (!timeOptions.includes(startTime)) {
              // Not in timeOptions and not UTC format, use default
              startTime = '8:00 AM';
            }

            // Same for endTime
            if (!timeOptions.includes(endTime) && /^\d{1,2}:\d{2}$/.test(endTime)) {
              // It's in UTC format (HH:mm), convert to local
              const converted = convertUTCToLocal(endTime);
              endTime = timeOptions.includes(converted) ? converted : '11:00 AM';
            } else if (!timeOptions.includes(endTime)) {
              // Not in timeOptions and not UTC format, use default
              endTime = '11:00 AM';
            }

            return { startTime, endTime };
          })
          .filter(
            slot =>
              slot.startTime &&
              slot.endTime &&
              timeOptions.includes(slot.startTime) &&
              timeOptions.includes(slot.endTime)
          );

        // If enabled but no valid slots after filtering, add default
        if (dayData.enabled && dayData.timeSlots.length === 0) {
          dayData.timeSlots = [{ startTime: '8:00 AM', endTime: '11:00 AM' }];
        }
      } else if (dayData.enabled) {
        // Enabled but no slots, add default
        dayData.timeSlots = [{ startTime: '8:00 AM', endTime: '11:00 AM' }];
      }
    });

    return {
      weeklyHours,
      overrideHours: formInitialData.overrideHours || [],
      bookingOptions: formInitialData.bookingOptions || {
        maxIMEsPerWeek: '',
        minimumNotice: '',
      },
    };
  }, [formInitialData]);

  return {
    ensuredFormData,
    convertToUTC: convertAvailabilityToUTC,
  };
}
