import { useForm as useRHFForm, zodResolver, z } from "@/lib/form";
import type { UseFormProps, FieldValues } from "@/lib/form";
import { ZodSchemaType } from "@/types/forms";

interface UseFormOptions<TFieldValues extends FieldValues>
  extends Omit<UseFormProps<TFieldValues>, "resolver"> {
  schema?: ZodSchemaType<TFieldValues>;
}

export function useForm<TFieldValues extends FieldValues>({
  schema,
  ...options
}: UseFormOptions<TFieldValues>) {
  return useRHFForm<TFieldValues>({
    ...options,
    resolver: schema ? zodResolver(schema) : undefined,
  });
}
