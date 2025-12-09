/**
 * Form-related types
 */

import { z } from "zod";

/**
 * Zod schema type for form validation
 */
export type ZodSchemaType<TFieldValues> = z.ZodType<
  TFieldValues,
  z.ZodTypeDef,
  z.ZodTypeDef
>;

/**
 * Form field path type for dynamic form operations
 */
export type FormFieldPath = string;

