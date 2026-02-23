/* eslint-disable react/no-unescaped-entities */
'use client';

import { Button } from '@/components/ui';
import { AlertCircle, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { URLS } from '@/constants/routes';
import useRouter from '@/hooks/useRouter';

const NoOrganizationAccess = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: URLS.LOGIN });
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <div className="w-full max-w-[640px] rounded-[25px] bg-white px-4 py-6 sm:px-8 lg:px-14">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>

          <h1 className="text-xl font-semibold tracking-[-0.01em] text-[#000093] sm:text-2xl lg:text-[30px]">
            Access Restricted
          </h1>

          <p className="font-poppins mt-2 text-sm font-normal tracking-[-0.03em] text-[#585858] sm:text-base md:text-[16px]">
            Your account has been removed from the organization. You no longer have access to this
            organization's dashboard or resources.
          </p>

          <p className="font-poppins mt-4 text-sm font-normal tracking-[-0.03em] text-[#585858] sm:text-base md:text-[16px]">
            If you believe this is an error, please contact your organization administrator or
            support.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-full bg-[#000093] px-8 text-[11px] font-medium tracking-[-0.03em] text-[#ffffff] hover:bg-[#000066] sm:px-10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <Button
              onClick={() => router.push(URLS.LOGIN)}
              variant="outline"
              className="rounded-full border-[#000093] px-8 text-[11px] font-medium tracking-[-0.03em] text-[#000093] hover:bg-gray-50 sm:px-10"
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoOrganizationAccess;
