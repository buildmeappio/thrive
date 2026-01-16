'use client';

import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import useRouter from '@/hooks/useRouter';
import { URLS } from '@/constants/routes';
import { Button } from '@/components/ui/button';

interface SuccessScreenProps {
  organizationName?: string;
  onContinue?: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ organizationName, onContinue }) => {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      if (onContinue) {
        onContinue();
      } else {
        router.push(URLS.DASHBOARD);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, onContinue]);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.push(URLS.DASHBOARD);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-[10px] pb-6 md:min-h-[350px] md:w-[970px] md:rounded-[30px] md:px-[75px] md:py-12"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
            Account Created Successfully!
          </h2>
          {organizationName && (
            <p className="mt-2 text-lg text-gray-600">
              Welcome to <span className="font-semibold">{organizationName}</span>
            </p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            You have been successfully set up as a Super Administrator.
          </p>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleContinue}
            className="rounded-full bg-[#000080] px-8 py-6 text-base font-medium hover:bg-[#000066]"
          >
            Go to Dashboard
          </Button>
        </div>

        <p className="text-xs text-gray-400">Redirecting automatically in a few seconds...</p>
      </div>
    </div>
  );
};

export default SuccessScreen;
