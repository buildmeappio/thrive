'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/PasswordInput';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Form, Formik } from 'formik';
import { signIn } from 'next-auth/react';
import useRouter from '@/hooks/useRouter';
import ErrorMessages from '@/constants/ErrorMessages';
import SuccessMessages from '@/constants/SuccessMessages';
import { toast } from 'sonner';
import { useState } from 'react';
import { URLS } from '@/constants/routes';
import { loginInitialValues, loginSchema } from '../schemas/login';
import Link from 'next/link';

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
        router.push(URLS.DASHBOARD);
        toast.success(SuccessMessages.LOGIN_SUCCESS);
      } else {
        toast.error(ErrorMessages.LOGIN_FAILED);
        throw new Error(ErrorMessages.LOGIN_FAILED);
      }
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  };

  return (
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
            <Label
              htmlFor="email"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
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
            <Label
              htmlFor="password"
              className="font-poppins text-[14.78px] leading-[100%] font-normal tracking-[0em]"
            >
              Password<span className="text-red-500">*</span>
            </Label>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="mb-4 text-right">
            <Link
              href={URLS.PASSWORD_FORGOT}
              className={`text-sm font-medium hover:underline ${
                isSubmitting
                  ? 'pointer-events-none cursor-not-allowed text-gray-400'
                  : 'text-[#140047]'
              }`}
            >
              Forgot Password?
            </Link>
          </div>

          <Button variant="organizationLogin" size="organizationLogin" disabled={isSubmitting}>
            Login
            <span>
              {isSubmitting ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
              ) : (
                <ArrowRight className="cup ml-2 h-4 w-4 text-white transition-all duration-300 ease-in-out" />
              )}
            </span>
          </Button>
        </Form>
      )}
    </Formik>
  );
};
export default LoginForm;
