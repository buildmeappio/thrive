import { AvailabilityPreferencesInput } from "../schemas/onboardingSteps.schema";

export const availabilityInitialValues: AvailabilityPreferencesInput = {
  weeklyHours: {
    sunday: { enabled: false, timeSlots: [] },
    monday: {
      enabled: true,
      timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
    },
    tuesday: {
      enabled: true,
      timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
    },
    wednesday: {
      enabled: true,
      timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
    },
    thursday: {
      enabled: true,
      timeSlots: [
        { startTime: "8:00 AM", endTime: "11:00 AM" },
        { startTime: "5:00 PM", endTime: "9:00 PM" },
      ],
    },
    friday: {
      enabled: true,
      timeSlots: [{ startTime: "8:00 AM", endTime: "11:00 AM" }],
    },
    saturday: { enabled: false, timeSlots: [] },
  },
  overrideHours: [],
  bookingOptions: {
    maxIMEsPerWeek: "",
    minimumNotice: "",
  },
};

