export const Language = Object.freeze({
  ENGLISH: "English",
  SPANISH: "Spanish",
  FRENCH: "French",
} as const);

export type Language = (typeof Language)[keyof typeof Language];
