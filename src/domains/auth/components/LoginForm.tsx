"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { ArrowRight } from "lucide-react";
import { Form, Formik } from "formik";
import { loginInitialValues } from "@/domains/auth/constants/initialValues";
import Link from "next/link";
import { createRoute, URLS } from "@/constants/route";
import { LoginInput, loginSchema } from "@/domains/auth/schemas/auth.schemas";
import { signIn } from "next-auth/react";
import { useState } from "react";
import ErrorMessages from "@/constants/ErrorMessages";
import { toast } from "sonner";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: LoginInput) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(ErrorMessages.INVALID_CREDENTIALS);
      } else {
        // Redirect to dashboard on success
        window.location.href = createRoute(URLS.DASHBOARD);
      }
    } catch {
      toast.error(ErrorMessages.LOGIN_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Formik
      initialValues={loginInitialValues}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}>
      {({ values, errors, handleChange }) => (
        <Form>
          <div className="mb-6">
            <Label htmlFor="email" className="text-black">
              Email<span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className=" border-none bg-[#F2F5F6] placeholder:text-[#9EA9AA] focus-visible:ring-1 focus-visible:ring-offset-0"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="password" className="text-black">
              Password<span className="text-red-500">*</span>
            </Label>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange}
              className=""
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>
          <div className="mb-4 text-right">
            <Link
              href={createRoute(URLS.PASSWORD_FORGOT)}
              className="text-sm font-bold text-[#0097E5] underline">
              Forgot Password?
            </Link>
          </div>
          <Button
            onClick={() => {
              handleSubmit(values);
            }}
            className="w-full bg-[#00A8FF] hover:bg-[#0097E5] text-white text-xl font-semibold py-7 px-3 rounded-full flex items-center justify-center gap-2"
            disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
            {!isLoading && <ArrowRight strokeWidth={3} color="white" />}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
