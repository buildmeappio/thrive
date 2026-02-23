'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import useRouter from '@/hooks/useRouter';
import { URLS } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { acceptInvitation } from '@/domains/organization/actions';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import ErrorMessages from '@/constants/ErrorMessages';
import log from '@/utils/log';

interface InvitationData {
  invitationId: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: string;
  expiresAt: Date;
}

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  officialEmailAddress: string;
  jobTitle?: string;
  department: string;
}

interface PasswordData {
  password: string;
  confirmPassword: string;
}

interface SuccessScreenProps {
  organizationName?: string;
  onContinue?: () => void;
  token?: string;
  invitationData?: InvitationData;
  personalInfo?: PersonalInfoData;
  passwordData?: PasswordData;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  organizationName,
  token,
  invitationData,
  personalInfo,
  passwordData,
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processRegistration = async () => {
      // Only process if we have token and invitation data (for invitation flow)
      if (!token || !invitationData) {
        // For non-invitation flows, redirect to dashboard
        router.push(URLS.DASHBOARD);
        return;
      }

      // Check if we have required data
      if (!personalInfo || !passwordData) {
        log.error('Missing required information:', {
          hasPersonalInfo: !!personalInfo,
          hasPasswordData: !!passwordData,
        });
        setError(
          'Missing required information. Please go back and complete the registration form.'
        );
        toast.error('Missing required information. Please go back and complete all steps.');
        return;
      }

      try {
        log.debug('Processing registration for email:', invitationData.email);

        // Step 1: Accept invitation (save to DB)
        log.debug('Accepting invitation...');
        const result = await acceptInvitation({
          token,
          password: passwordData.password,
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          phoneNumber: personalInfo.phoneNumber,
          departmentId: personalInfo.department,
        });

        // If invitation was already accepted or user already exists,
        // that means registration was successful before
        // In this case, just sign in the user
        const isAlreadyAccepted =
          !result.success &&
          result.error &&
          (result.error.toLowerCase().includes('already been accepted') ||
            result.error.toLowerCase().includes('already exists') ||
            result.error.toLowerCase().includes('user with this email already exists'));

        if (!result.success && !isAlreadyAccepted) {
          throw new Error(result.error || 'Failed to accept invitation');
        }

        if (isAlreadyAccepted) {
          log.debug('Invitation was already accepted or user exists, proceeding to sign in...');
        } else {
          log.debug('Invitation accepted successfully');
        }

        // Step 2: Sign in the user (create session)
        log.debug('Signing in user...');
        const signInResult = await signIn('credentials', {
          email: invitationData.email,
          password: passwordData.password,
          redirect: false,
        });

        if (!signInResult?.ok) {
          // If sign-in fails, show appropriate error
          const signInError = signInResult?.error || ErrorMessages.LOGIN_FAILED;
          if (isAlreadyAccepted) {
            throw new Error(`Account already exists. ${signInError}`);
          }
          throw new Error(signInError);
        }

        log.debug('User signed in successfully');

        // Step 3: Redirect to dashboard immediately after successful completion
        // Keep loading state visible during redirect
        router.push(URLS.DASHBOARD);
      } catch (error) {
        log.error('Error processing registration:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An error occurred while processing your registration';

        // Check if this is an "already accepted" or "already exists" error
        const isHandledError =
          errorMessage.toLowerCase().includes('already been accepted') ||
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('user with this email already exists');

        // If it's a handled error, try to sign in the user
        if (isHandledError && passwordData?.password) {
          try {
            log.debug('Attempting to sign in user after already accepted error...');
            const signInResult = await signIn('credentials', {
              email: invitationData.email,
              password: passwordData.password,
              redirect: false,
            });

            if (signInResult?.ok) {
              log.debug('User signed in successfully after already accepted error');
              // Redirect immediately, keep loading visible
              router.push(URLS.DASHBOARD);
              return;
            } else {
              // Sign-in failed - show error
              const signInError = signInResult?.error || ErrorMessages.LOGIN_FAILED;
              setError('Account already exists. ' + signInError);
              toast.error('Account already exists. Please check your password.');
              return;
            }
          } catch (signInError) {
            log.error('Sign-in failed after already accepted error:', signInError);
            setError('Account already exists. Please sign in with your existing password.');
            toast.error('Account already exists. Please sign in with your existing password.');
            return;
          }
        }

        // For other errors, show the error message
        if (!isHandledError) {
          toast.error(errorMessage);
        }

        setError(errorMessage);
      }
    };

    processRegistration();
  }, [token, invitationData, personalInfo, passwordData, router]);

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white px-[10px] pb-6 md:min-h-[350px] md:w-[970px] md:rounded-[30px] md:px-[75px] md:py-12"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        {error ? (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-12 w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
                Registration Failed
              </h2>
              <p className="mt-4 text-sm text-red-600">{error}</p>
            </div>

            <div className="mt-8">
              <Button
                onClick={() => router.push(URLS.LOGIN)}
                className="rounded-full bg-[#000080] px-8 py-6 text-base font-medium hover:bg-[#000066]"
              >
                Go to Login
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
                Creating Your Account...
              </h2>
              {organizationName && (
                <p className="mt-2 text-lg text-gray-600">
                  Setting up your account for{' '}
                  <span className="font-semibold">{organizationName}</span>
                </p>
              )}
              <p className="mt-4 text-sm text-gray-500">
                Please wait while we complete your registration.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SuccessScreen;
