"use client";
import React from "react";
import {
  useForm as useReactHookForm,
  FormProvider as RHFProvider,
  UseFormReturn,
  FieldValues,
  UseFormProps,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export interface UseFormOptions<TFieldValues extends FieldValues>
  extends Omit<UseFormProps<TFieldValues>, "resolver"> {
  schema: z.ZodType<TFieldValues, any, any>;
}

export function useForm<TFieldValues extends FieldValues = FieldValues>(
  options: UseFormOptions<TFieldValues>
) {
  const { schema, ...restOptions } = options;
  return useReactHookForm<TFieldValues>({
    ...restOptions,
    resolver: zodResolver(schema),
  });
}

export interface FormProviderProps<TFieldValues extends FieldValues> {
  children: React.ReactNode;
  form: UseFormReturn<TFieldValues>;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
}

export function FormProvider<TFieldValues extends FieldValues>({
  children,
  form,
  onSubmit,
}: FormProviderProps<TFieldValues>) {
  return (
    <RHFProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
    </RHFProvider>
  );
}

export { useFormContext } from "react-hook-form";
