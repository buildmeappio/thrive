import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Form, Formik } from 'formik';
import { loginInitialValues, loginSchema } from '@/shared/validation/login/loginValidation';
export function AdminLoginComponent() {
  const handleSubmit = (values: typeof loginInitialValues) => {
    console.log(values);
  };
  return (
    <div className="bg-[#F2F5F6]">
      <div className="flex min-h-screen flex-col justify-between md:flex-row">
        <div className="flex flex-1 flex-col justify-center px-4 sm:px-8 md:px-0 md:pl-30">
          <h1 className="mb-4 text-center text-3xl font-bold md:text-left md:text-[44px]">
            Welcome To{' '}
            <span className="bg-gradient-to-r from-[#01F4C8] to-[#00A8FF] bg-clip-text text-transparent">
              Thrive
            </span>{' '}
            <br />
            Admin Dashboard
          </h1>
          <div className="w-full rounded-xl border-[#E9EDEE] bg-white p-6 shadow-xs md:w-[445px]">
            <h2 className="mb-6 text-[30px] font-semibold">Log In</h2>
            <Formik
              initialValues={loginInitialValues}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {({ values, errors, handleChange }) => (
                <Form>
                  <div className="mb-4 sm:mb-5">
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
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
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
                    <a href="#" className="text-sm font-medium text-[#0069A0] hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <Button >
                    Log In
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        <div className="pl- relative hidden flex-1 overflow-hidden md:block">
          <div className="absolute inset-0">
            <Image
              src="/images/adminLogin.png"
              alt="Admin Dashboard Preview"
              width={800}
              height={200}
              className="h-full w-full object-fill"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
