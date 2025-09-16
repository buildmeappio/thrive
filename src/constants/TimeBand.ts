export const TimeBand = Object.freeze({
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EITHER: 'either',
} as const);

export type RoleType = (typeof TimeBand)[keyof typeof TimeBand];
