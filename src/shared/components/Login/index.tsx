'use client';

import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import Image from 'next/image';
import { PasswordInput } from '@/shared/components/ui/PasswordInput';
import { ArrowRight } from 'lucide-react';
import { Form, Formik } from 'formik';
import { loginInitialValues, loginSchema } from '@/shared/validation/login/loginValidation';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ErrorMessages from '@/constants/ErrorMessages';
import SuccessMessages from '@/constants/SuccessMessages';
import { toast } from 'sonner';
import { useState } from 'react';

const LoginForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: typeof loginInitialValues) => {
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
        toast.success(SuccessMessages.LOGIN_SUCCESS);
      } else {
        throw new Error(ErrorMessages.LOGIN_FAILED);
      }
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  };

  return (
    <div className="bg-[#F2F5F6] pt-10">
      <div className="flex flex-col justify-between md:min-h-screen md:flex-row">
        <div className="flex flex-1 flex-col justify-center px-6 md:px-0 md:pl-30">
          <h1 className="mb-4 text-center text-3xl font-bold md:text-left md:text-[44px]">
            Welcome To <span>Thrive</span>{' '}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="mb-4 text-right">
                    <a
                      href="#"
                      className={`text-sm font-medium hover:underline ${
                        isSubmitting
                          ? 'pointer-events-none cursor-not-allowed text-gray-400'
                          : 'text-[#140047]'
                      }`}
                    >
                      Forgot Password?
                    </a>
                  </div>

                  <Button
                    variant="organizationLogin"
                    size="organizationLogin"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}{' '}
                    <span>
                      <ArrowRight strokeWidth={3} color="white" />
                    </span>
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        <div className="pl- relative hidden flex-1 overflow-hidden md:block">
          <div className="absolute inset-0">
            <Image
              src="/images/org-gettingStarted.png"
              alt="Organization Dashboard Preview"
              width={200}
              height={200}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginForm;
