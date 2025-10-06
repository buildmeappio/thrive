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

const LoginForm = () => {
  const handleSubmit = (values: LoginInput) => {
    console.log(values);
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
              className="mt-1 border-none bg-[#F2F5F6] placeholder:text-[#9EA9AA] focus-visible:ring-1 focus-visible:ring-offset-0"
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
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>
          <div className="mb-4 text-right">
            <Link
              href={createRoute(URLS.PASSWORD_FORGOT)}
              className="text-sm font-medium text-[#0097E5] hover:underline">
              Forgot Password?
            </Link>
          </div>
          <Button
            className="w-full bg-[#00A8FF] hover:bg-[#0097E5] text-white font-semibold py-5 px-3 rounded-xl flex items-center justify-center gap-2"
            type="submit">
            Login
            <ArrowRight strokeWidth={3} color="white" />
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
