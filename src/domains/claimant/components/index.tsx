'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AddOnServices from './AddonServices';
import AppointmentOptions from './AppointmentOptions';
import UserInfo from './UserInfo';
import { useClaimantAvailability } from '@/hooks/useCliamantAvailability';
import { toast } from 'sonner';
import { type getLanguages } from '../actions';
import { convertToTypeOptions } from '@/utils/convertToTypeOptions';
import {
  type ClaimantAvailabilityFormData,
  claimantAvailabilityInitialValues,
  claimantAvailabilitySchema,
} from '../schemas/claimantAvailability';
import { URLS } from '@/constants/routes';
import useRouter from '@/hooks/useRouter';

type ClaimantAvailabilityProps = {
  caseSummary: {
    caseId: string;
    claimantId: string;
    claimantFirstName: string | null;
    claimantLastName: string | null;
    organizationName?: string | null;
  };
};

type ClaimantAvailabilityComponentProps = ClaimantAvailabilityProps & {
  languages: Awaited<ReturnType<typeof getLanguages>>['result'];
};

const ClaimantAvailability: React.FC<ClaimantAvailabilityComponentProps> = ({
  caseSummary,
  languages,
}) => {
  const { isSubmitting, submitAvailability } = useClaimantAvailability(
    caseSummary.caseId,
    caseSummary.claimantId
  );
  const router = useRouter();

  const form = useForm<ClaimantAvailabilityFormData>({
    resolver: zodResolver(claimantAvailabilitySchema),
    defaultValues: claimantAvailabilityInitialValues,
    mode: 'onChange',
  });

  const handleSubmit = async (data: ClaimantAvailabilityFormData) => {
    try {
      const result = await submitAvailability(data);
      if (result.success) {
        router.push(URLS.SUCCESS);
      }
    } catch (error) {
      toast.error('Failed to submit availability. Please try again.');
      console.error(error);
    }
  };

  const onError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  return (
    <div>
      {/* Heading */}
      <h1 className="py-4 text-center text-2xl leading-tight font-semibold tracking-normal capitalize sm:text-3xl lg:text-[36px]">
        Help Us Schedule Your IME
      </h1>

      {/* User Info */}
      <UserInfo
        caseId={caseSummary.caseId}
        claimantFirstName={caseSummary.claimantFirstName ?? ''}
        claimantLastName={caseSummary.claimantLastName ?? ''}
        organizationName={caseSummary.organizationName ?? ''}
      />

      {/* Form container */}
      <form onSubmit={form.handleSubmit(handleSubmit, onError)}>
        <div className="mx-auto w-full space-y-8">
          <AppointmentOptions form={form} />
          {/* <AddOnServices
            form={form}
            onSubmit={form.handleSubmit(handleSubmit, onError)}
            isSubmitting={isSubmitting}
            languages={convertToTypeOptions(languages)}
          /> */}
        </div>
      </form>
    </div>
  );
};

export default ClaimantAvailability;
