"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { ContinueButton } from "@/components";
import { PasswordInput } from "@/components/PasswordInput";
import {
  step9PasswordSchema,
  Step9PasswordInput,
} from "@/domains/auth/schemas/auth.schemas";
import { step9InitialValues } from "@/domains/auth/constants/initialValues";
import setPassword from "@/domains/auth/actions/setPassword";
import { useRouter } from "next/navigation";
import { FormProvider } from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";

type Step9PasswordProps = {
  token: string;
};

const SetPasswordForm: React.FC<Step9PasswordProps> = ({ token }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const form = useForm<Step9PasswordInput>({
    schema: step9PasswordSchema,
    defaultValues: step9InitialValues,
    mode: "onSubmit",
  });

  const onSubmit = async (values: Step9PasswordInput) => {
    try {
      setLoading(true);
      setError("");
      const result = await setPassword({
        password: values.password,
        confirmPassword: values.confirmPassword,
        token: token,
      });

      if (result.success) {
        router.push("/create-account/success");
      } else {
        setError(result.message || "Failed to set password");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to set password";
      setError(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider form={form} onSubmit={onSubmit}>
      <div className="py-auto flex flex-col items-center space-y-6 px-4 md:px-0">
        <div className="w-full max-w-md pt-1 md:w-3/5 md:max-w-none md:pt-0">
          <div className="mt-0 md:mt-8">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-6 md:space-y-6">
              <div className="space-y-3 md:space-y-2">
                <Label
                  htmlFor="password"
                  className="text-base text-black md:text-base">
                  Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <PasswordInput
                    {...form.register("password")}
                    id="password"
                    placeholder="Enter your password"
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-3 md:space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-base text-black md:text-base">
                  Confirm Password<span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <PasswordInput
                    {...form.register("confirmPassword")}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                  />
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end md:mt-14">
            <ContinueButton
              disabled={loading || form.formState.isSubmitting}
              gradientFrom="#89D7FF"
              gradientTo="#00A8FF"
              loading={loading || form.formState.isSubmitting}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default SetPasswordForm;
