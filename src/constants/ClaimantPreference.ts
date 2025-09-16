export const ClaimantPreference = Object.freeze({
  IN_PERSON: 'in_person',
  VIRTUAL: 'virtual',
  EITHER: 'either',
} as const);

export type RoleType = (typeof ClaimantPreference)[keyof typeof ClaimantPreference];
