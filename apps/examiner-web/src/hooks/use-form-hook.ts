import { useForm as useRHFForm, zodResolver } from "@/lib/form";
import type { UseFormProps, FieldValues, UseFormReturn } from "@/lib/form";
import { ZodSchemaType } from "@/types/forms";

interface UseFormOptions<TFieldValues extends FieldValues> extends Omit<
  UseFormProps<TFieldValues>,
  "resolver"
> {
  schema?: ZodSchemaType<TFieldValues>;
}

export function useForm<TFieldValues extends FieldValues>({
  schema,
  ...options
}: UseFormOptions<TFieldValues>) {
  const form = useRHFForm<TFieldValues>({
    ...options,
    resolver: schema ? zodResolver(schema as any) : undefined,
  });
  return form as UseFormReturn<TFieldValues, unknown, TFieldValues>;
}
