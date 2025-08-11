import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { PasswordInput } from "~/components/ui/PasswordInput";
import { ArrowRight } from "lucide-react";
import { Form, Formik } from "formik";
import {
  loginInitialValues,
  loginSchema,
} from "~/validation/login/loginValidation";
export function MedicalExaminerLoginComponent() {
  const handleSubmit = (values: typeof loginInitialValues) => {
    console.log(values);
  };
  return (
    <div className="flex min-h-screen flex-col justify-between md:flex-row">
      <div className="flex flex-1 flex-col items-center justify-center px-6 md:mt-14 md:flex-1 md:items-start md:justify-start md:px-0 md:pl-40">
        <h1 className="mb-8 text-center text-3xl font-bold md:text-left md:text-4xl">
          Welcome To <span className="text-[#00A8FF]">Thrive</span>{" "}
        </h1>
        <div className="w-full max-w-sm rounded-xl border-[#E9EDEE] bg-white p-6 shadow-xs">
          <h2 className="mb-6 text-lg font-semibold">Log In</h2>
          <Formik
            initialValues={loginInitialValues}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ values, errors, handleChange, submitForm }) => (
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
                  <PasswordInput id="password"
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="mb-4 text-right">
                  <a
                    href="#"
                    className="text-sm font-medium text-[#0097E5] hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <Button
                  variant="medicalExaminerLogin"
                  size="medicalExaminerLogin"
                >
                  Login{" "}
                  <span>
                    <ArrowRight strokeWidth={3} color="white" />
                  </span>
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <div className="relative mt-10 hidden w-[38%] overflow-hidden md:block">
        <div className="absolute inset-0">
          <Image
            src="/doctor-gettingStarted.png"
            alt="Admin Dashboard Preview"
            width={200}
            height={200}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
