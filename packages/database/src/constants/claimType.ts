export const ClaimType = Object.freeze({
  FIRST_PARTY_CLAIM: "First Party Claim",
  THIRD_PARTY_CLAIM: "Third Party Claim",
  PROPERTY_DAMAGE_CLAIM: "Property Damage Claim",
  SUBROGATION_CLAIM: "Subrogation Claim",
  BODILY_INJURY_CLAIM: "Bodily Injury Claim",
  OTHER: "Other",
} as const);

export type ClaimTypeType = (typeof ClaimType)[keyof typeof ClaimType];
