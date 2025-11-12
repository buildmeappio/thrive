import prisma from '@/lib/prisma';
import {
  type AvailabilitySettings,
  DEFAULT_SETTINGS,
} from '@/domains/claimant/types/examinerAvailability';

/**
 * Configuration keys in the database
 */
const CONFIG_KEYS = {
  NO_OF_DAYS_WINDOW: 'no_of_days_window_for_claimant',
  SLOT_DURATION: 'slot_duration',
  TOTAL_WORKING_HOURS: 'total_working_hours',
  START_WORKING_HOUR: 'start_working_hour_time',
  ORGANIZATION_DUE_DATE: 'organization_due_date_after',
} as const;

/**
 * Convert minutes since midnight to HH:MM format
 * @param minutes - Minutes since midnight (e.g., 480 = 08:00)
 */
function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Fetch availability settings from database configuration
 * Falls back to default settings if any configuration is missing
 */
export async function getAvailabilitySettings(): Promise<AvailabilitySettings> {
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
    const configMap = new Map(configs.map(c => [c.name, c.value]));

    // Build settings object with database values or fallback to defaults
    const settings: AvailabilitySettings = {
      noOfDaysForWindow:
        configMap.get(CONFIG_KEYS.NO_OF_DAYS_WINDOW) ?? DEFAULT_SETTINGS.noOfDaysForWindow,
      numberOfWorkingHours:
        configMap.get(CONFIG_KEYS.TOTAL_WORKING_HOURS) ?? DEFAULT_SETTINGS.numberOfWorkingHours,
      slotDurationMinutes:
        configMap.get(CONFIG_KEYS.SLOT_DURATION) ?? DEFAULT_SETTINGS.slotDurationMinutes,
      startOfWorking: configMap.has(CONFIG_KEYS.START_WORKING_HOUR)
        ? minutesToTimeString(configMap.get(CONFIG_KEYS.START_WORKING_HOUR)!)
        : DEFAULT_SETTINGS.startOfWorking,
    };

    console.log('[Configuration Service] Loaded availability settings:', settings);

    return settings;
  } catch (error) {
    console.error('[Configuration Service] Error fetching configuration, using fallback:', error);
    return DEFAULT_SETTINGS;
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
    console.error(`[Configuration Service] Error fetching config key "${key}":`, error);
    return null;
  }
}

/**
 * Get organization due date offset in days
 */
export async function getOrganizationDueDateOffset(): Promise<number> {
  const value = await getConfigValue(CONFIG_KEYS.ORGANIZATION_DUE_DATE);
  return value ?? 30; // Default to 30 days
}

const configurationService = {
  getAvailabilitySettings,
  getConfigValue,
  getOrganizationDueDateOffset,
};

export default configurationService;
