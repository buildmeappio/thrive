"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import forgotPassword from "../actions/forgotPassword";
import { URLS } from "@/constants/route";

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      const result = await forgotPassword({ email: values.email });

      if (result.success) {
        // Redirect to email sent page with email in query
        router.push(`/password/email-sent?email=${encodeURIComponent(values.email)}`);
      } else {
        toast.error(result.message || "Failed to send reset email");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Formik
        initialValues={{ email: "" }}
        validationSchema={forgotPasswordSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={false}>
        {({ values, errors, handleChange }) => (
          <Form>
            <div className="mb-3">
              <Label htmlFor="email" className="text-black">
                Email Address<span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                icon={Mail}
                className="border-none bg-[#F2F5F6] placeholder:text-[#9EA9AA] focus-visible:ring-1 focus-visible:ring-offset-0"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-[#00A8FF] hover:bg-[#0096E6] text-white h-11 text-base font-semibold">
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(URLS.LOGIN)}
              className="mt-4 w-full rounded-full border-2 border-[#00A8FF] text-[#00A8FF] hover:bg-[#E6F7FF] h-11 text-base font-semibold flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ForgotPasswordForm;

