export const RequestedSpeciality = Object.freeze({
  ORTHOPEDIC_SURGERY: "Orthopedic Surgery",
  NEUROLOGY: "Neurology",
  PSYCHIATRY: "Psychiatry",
  PSYCHOLOGY: "Psychology",
  PHYSICAL_MEDICINE_REHABILITATION: "Physical Medicine & Rehabilitation",
  PAIN_MANAGEMENT: "Pain Management",
} as const);

export type RoleType =
  (typeof RequestedSpeciality)[keyof typeof RequestedSpeciality];
