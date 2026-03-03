'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/PasswordInput';
import { signIn } from 'next-auth/react';
import { authClient } from '@/domains/auth/server/better-auth/client';
import { loginSchema, LoginInput } from '@/domains/auth/schemas/auth.schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { URLS } from '@/constants/route';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const onSubmit = async (values: LoginInput) => {
    const res = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
    });
    if (res?.ok) {
      toast.success('Login successful');
      router.push('/admin/dashboard-new');
      return;
    }
    const errorMessage = res?.error ?? 'Invalid email or password. Please try again.';
    toast.error(errorMessage);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <Label htmlFor="email" className="text-sm text-black md:text-[15px]">
          Email<span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          disabled={isSubmitting}
          className={`mt-1 h-11 border-none bg-[#F2F5F6] placeholder:text-[#9EA9AA] focus-visible:ring-1 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:h-12 ${
            errors.email ? 'ring-1 ring-red-500' : ''
          }`}
          {...register('email')}
        />
        <p className="min-h-[16px] text-xs text-red-500">{errors.email?.message}</p>
      </div>

      <div>
        <Label htmlFor="password" className="text-sm text-black md:text-[15px]">
          Password<span className="text-red-500">*</span>
        </Label>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          disabled={isSubmitting}
          className={`h-11 md:h-12 ${errors.password ? 'ring-1 ring-red-500' : ''}`}
          {...register('password')}
        />
        <p className="min-h-[16px] text-xs text-red-500">{errors.password?.message}</p>
      </div>

      <div className="flex justify-end">
        <Link
          href={URLS.PASSWORD_FORGOT}
          className="text-sm font-medium text-[#0069A0] hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        variant="default"
        size="default"
        disabled={isSubmitting}
        className="h-11 w-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 md:h-12"
      >
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="default"
        onClick={async () => {
          const host = window.location.hostname;
          const port = window.location.port ? `:${window.location.port}` : '';
          const parts = host.split('.');
          const slug = parts.length >= 2 && parts[0] !== 'www' ? parts[0] : null;

          if (slug) {
            const baseDomain = parts.slice(1).join('.');
            document.cookie = [
              `tenant-sso-slug=${slug}`,
              'path=/',
              'max-age=300',
              'SameSite=Lax',
            ].join('; ');

            // Construct callback URL with subdomain to redirect back to the correct tenant
            const protocol = window.location.protocol;
            const callbackUrl = `${protocol}//${slug}.${baseDomain}${port}/admin/dashboard-new`;

            // Use Better Auth Keycloak OAuth (for SSO)
            await authClient.signIn.oauth2({
              providerId: 'keycloak',
              callbackURL: callbackUrl,
            });
          } else {
            // Use Better Auth Keycloak OAuth (for SSO)
            await authClient.signIn.oauth2({
              providerId: 'keycloak',
              callbackURL: '/admin/dashboard-new',
            });
          }
        }}
        className="h-11 w-full border-slate-300 text-slate-700 hover:bg-slate-50 md:h-12"
      >
        Sign in with Keycloak
      </Button>
    </form>
  );
};

export default LoginForm;
