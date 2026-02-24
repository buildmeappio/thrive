'use client';
import React from 'react';
import {
  FormProvider as RHFFormProvider,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
} from '@/lib/form';

interface FormProviderProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
> {
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  onSubmit: SubmitHandler<TTransformedValues>;
  children: React.ReactNode;
  id?: string;
}

const FormProvider = <
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  form,
  onSubmit,
  children,
  id,
}: FormProviderProps<TFieldValues, TContext, TTransformedValues>) => {
  return (
    <RHFFormProvider {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(onSubmit as SubmitHandler<TTransformedValues>)}
        noValidate
      >
        {children}
      </form>
    </RHFFormProvider>
  );
};

export default FormProvider;
