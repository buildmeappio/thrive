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
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ErrorMessages from "@/constants/ErrorMessages";
import { toast } from "sonner";
import { checkSuspensionByEmail } from "@/app/actions/checkSuspensionByEmail";
import { toFormikValidationSchema } from "zod-formik-adapter";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasShownResetToast = useRef(false);

  // Show success message if password was reset
  useEffect(() => {
    if (!hasShownResetToast.current && searchParams.get("reset") === "success") {
      hasShownResetToast.current = true;
      toast.success("Password reset successfully! You can now login with your new password.");

      const params = new URLSearchParams(searchParams.toString());
      params.delete("reset");
      const query = params.toString();
      router.replace(query ? `/login?${query}` : "/login");
    }
  }, [router, searchParams]);

  const onSubmit = async (values: LoginInput) => {
    setIsLoading(true);

    try {
      // Check if account is suspended before attempting login
      console.log("LoginForm: Checking suspension for email:", values.email);
      const suspensionCheck = await checkSuspensionByEmail(values.email.toLowerCase());
      console.log("LoginForm: Suspension check result:", suspensionCheck);
      
      if (suspensionCheck.isSuspended) {
        console.log("LoginForm: Account is suspended, blocking login");
        toast.error("Your account is suspended. Please contact administrator.", {
          position: "top-right",
        });
        setIsLoading(false);
        return; // Early return prevents login attempt
      }

      console.log("LoginForm: Account not suspended, proceeding with login");
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(ErrorMessages.INVALID_CREDENTIALS);
      } else {
        window.location.href = createRoute(URLS.DASHBOARD);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(ErrorMessages.LOGIN_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Formik
      initialValues={loginInitialValues}
      validationSchema={toFormikValidationSchema(loginSchema)}
      onSubmit={onSubmit}
      validateOnChange={false}
      validateOnBlur={false}
      enableReinitialize>
      {({ values, errors, handleChange, touched }) => (
        <Form>
          <div className="mb-6">
            <Label htmlFor="email" className="text-black">
              Email<span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
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
              name="password"
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
              href={URLS.PASSWORD_FORGOT}
              className="text-sm font-bold text-[#0097E5] underline">
              Forgot Password?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#00A8FF] hover:bg-[#0097E5] text-white text-xl font-semibold py-7 px-3 rounded-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
            {!isLoading && <ArrowRight strokeWidth={3} color="white" />}
          </Button>
          {/* Debug: Show validation errors if form was touched */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="mt-2 text-xs text-red-500">
              Please fix the errors above to continue.
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;
