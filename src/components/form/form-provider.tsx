"use client";
import React from "react";
import {
  FormProvider as RHFFormProvider,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
} from "@/lib/form";

interface FormProviderProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: React.ReactNode;
  id?: string;
}

const FormProvider = <TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  id,
}: FormProviderProps<TFieldValues>) => {
  return (
    <RHFFormProvider {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        {children}
      </form>
    </RHFFormProvider>
  );
};

export default FormProvider;
