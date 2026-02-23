import prisma from "@/lib/db";

/**
 * Configuration keys in the database
 */
const CONFIG_KEYS = {
  NO_OF_DAYS_WINDOW: "no_of_days_window_for_claimant",
  SLOT_DURATION: "slot_duration",
  TOTAL_WORKING_HOURS: "total_working_hours",
  START_WORKING_HOUR: "start_working_hour_time",
} as const;

/**
 * Convert minutes since midnight to HH:MM format
 * @param minutes - Minutes since midnight (e.g., 480 = 08:00)
 */
function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Fetch availability settings from database configuration
 * Falls back to default settings if any configuration is missing
 */
export async function getAvailabilitySettings(): Promise<{
  noOfDaysForWindow: number;
  numberOfWorkingHours: number;
  slotDurationMinutes: number;
  startOfWorking: string;
  startOfWorkingMinutes: number | null;
}> {
  try {
    // Fetch all configuration values in one query
    const configs = await prisma.configuration.findMany({
      where: {
        name: {
          in: [
            CONFIG_KEYS.NO_OF_DAYS_WINDOW,
            CONFIG_KEYS.SLOT_DURATION,
            CONFIG_KEYS.TOTAL_WORKING_HOURS,
            CONFIG_KEYS.START_WORKING_HOUR,
          ],
        },
        deletedAt: null,
      },
      select: {
        name: true,
        value: true,
      },
    });

    // Create a map for easy lookup
    const configMap = new Map(configs.map((c) => [c.name, c.value]));

    // Get UTC minutes from database
    const startOfWorkingMinutesUTC = configMap.get(
      CONFIG_KEYS.START_WORKING_HOUR,
    );

    // Build settings object with database values or fallback to defaults
    const settings = {
      noOfDaysForWindow: configMap.get(CONFIG_KEYS.NO_OF_DAYS_WINDOW) ?? 30,
      numberOfWorkingHours: configMap.get(CONFIG_KEYS.TOTAL_WORKING_HOURS) ?? 8,
      slotDurationMinutes: configMap.get(CONFIG_KEYS.SLOT_DURATION) ?? 60,
      startOfWorking: minutesToTimeString(startOfWorkingMinutesUTC ?? 480),
      startOfWorkingMinutes: startOfWorkingMinutesUTC ?? 480,
    };

    console.log(
      "[Configuration Service] Loaded availability settings:",
      settings,
    );
    console.log(
      "[Configuration Service] UTC minutes:",
      startOfWorkingMinutesUTC,
    );

    return settings;
  } catch (error) {
    console.error(
      "[Configuration Service] Error fetching configuration, using fallback:",
      error,
    );
    return {
      noOfDaysForWindow: 30,
      numberOfWorkingHours: 8,
      slotDurationMinutes: 24,
      startOfWorking: "08:00",
      startOfWorkingMinutes: null,
    };
  }
}

/**
 * Parse SLOT_DURATION to get duration options array
 * Supports both comma-separated string and single number
 */
function parseSlotDurationOptions(
  slotDuration: number | string | null,
): number[] {
  // Default fallback
  const defaultOptions = [30, 45, 60];

  if (!slotDuration) {
    return defaultOptions;
  }

  // If it's a string (comma-separated)
  if (typeof slotDuration === "string") {
    const parsed = slotDuration
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    if (parsed.length > 0) {
      return parsed.sort((a, b) => a - b); // Sort ascending
    }
  }

  // If it's a number, generate options around it
  if (typeof slotDuration === "number") {
    const primary = slotDuration;
    const half = Math.floor(primary / 2);
    const threeQuarter = Math.floor(primary * 0.75);

    // Generate: [half, threeQuarter, primary] rounded to nearest 15
    const options = [
      Math.round(half / 15) * 15, // Round to nearest 15
      Math.round(threeQuarter / 15) * 15,
      primary,
    ].filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates

    return options.length > 0 ? options : defaultOptions;
  }

  return defaultOptions;
}

export type InterviewSettings = {
  minDaysAhead: number;
  maxDaysAhead: number;
  durationOptions: number[];
  startWorkingHourUTC: number;
  totalWorkingHours: number;
  endWorkingHourUTC: number;
};

/**
 * Fetch interview-specific settings from database configuration
 * Falls back to default settings if any configuration is missing
 */
export async function getInterviewSettings(): Promise<InterviewSettings> {
  try {
    // Fetch all configuration values in one query
    const configs = await prisma.configuration.findMany({
      where: {
        name: {
          in: [
            CONFIG_KEYS.NO_OF_DAYS_WINDOW,
            CONFIG_KEYS.SLOT_DURATION,
            CONFIG_KEYS.TOTAL_WORKING_HOURS,
            CONFIG_KEYS.START_WORKING_HOUR,
          ],
        },
        deletedAt: null,
      },
      select: {
        name: true,
        value: true,
      },
    });

    // Create a map for easy lookup
    const configMap = new Map(configs.map((c) => [c.name, c.value]));

    // Get UTC minutes from database
    const startWorkingHourUTC =
      configMap.get(CONFIG_KEYS.START_WORKING_HOUR) ?? 480; // Default: 8 AM UTC
    const totalWorkingHours =
      configMap.get(CONFIG_KEYS.TOTAL_WORKING_HOURS) ?? 8; // Default: 8 hours
    const maxDaysAhead = configMap.get(CONFIG_KEYS.NO_OF_DAYS_WINDOW) ?? 180; // Default: 180 days (6 months)
    const slotDuration = configMap.get(CONFIG_KEYS.SLOT_DURATION) ?? null;

    // Calculate end working hour in UTC minutes
    const endWorkingHourUTC = startWorkingHourUTC + totalWorkingHours * 60;

    // Parse duration options
    const durationOptions = parseSlotDurationOptions(slotDuration);

    const settings = {
      minDaysAhead: 1, // Hardcoded: minimum 1 day (tomorrow)
      maxDaysAhead,
      durationOptions,
      startWorkingHourUTC,
      totalWorkingHours,
      endWorkingHourUTC,
    };

    console.log("[Configuration Service] Loaded interview settings:", settings);

    return settings;
  } catch (error) {
    console.error(
      "[Configuration Service] Error fetching interview configuration, using fallback:",
      error,
    );
    return {
      minDaysAhead: 1,
      maxDaysAhead: 180,
      durationOptions: [30, 45, 60],
      startWorkingHourUTC: 480, // 8 AM UTC
      totalWorkingHours: 8,
      endWorkingHourUTC: 960, // 4 PM UTC (8 AM + 8 hours)
    };
  }
}

/**
 * Get a single configuration value by key
 */
export async function getConfigValue(key: string): Promise<number | null> {
  try {
    const config = await prisma.configuration.findFirst({
      where: {
        name: key,
        deletedAt: null,
      },
      select: {
        value: true,
      },
    });

    return config?.value ?? null;
  } catch (error) {
    console.error(
      `[Configuration Service] Error fetching config key "${key}":`,
      error,
    );
    return null;
  }
}

const configurationService = {
  getAvailabilitySettings,
  getInterviewSettings,
  getConfigValue,
};

export default configurationService;
