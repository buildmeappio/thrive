/**
 * Form-related types
 */

import { z } from "zod";

/**
 * Zod schema type for form validation
 */
export type ZodSchemaType<TFieldValues> = z.ZodType<TFieldValues>;

/**
 * Form field path type for dynamic form operations
 */
export type FormFieldPath = string;

