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
}

const FormProvider = <TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
}: FormProviderProps<TFieldValues>) => {
  return (
    <RHFFormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
    </RHFFormProvider>
  );
};

export default FormProvider;
