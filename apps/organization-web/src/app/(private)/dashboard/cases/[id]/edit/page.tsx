import {
  getClaimTypes,
  getCaseTypes,
  getCaseData,
  getCaseStatusById,
} from '@/domains/ime-referral/actions';
import { getExaminationTypes } from '@/domains/auth/server/handlers';
import { getLanguages } from '@/domains/claimant/actions';
import IMEReferralEdit from '@/domains/ime-referral/components/IMEReferralEdit';
import { Metadata } from 'next';
import { CaseStatusToBeEdited } from '@/constants/caseStatusToBeEdited';
import OrganizationGuard from '@/components/OrganizationGuard';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: 'Edit Examination | Thrive',
  description: 'Edit Examination - Thrive',
};

const Page = async ({ params }: Props) => {
  const { id } = await params;

  const [caseStatus, examinationData, claimTypes, examinationTypes, caseTypes, languages] =
    await Promise.all([
      getCaseStatusById(id),
      getCaseData(id),
      getClaimTypes(),
      getExaminationTypes(),
      getCaseTypes(),
      getLanguages(),
    ]);

  const status = caseStatus.result?.name;

  if (!examinationData) {
    throw new Error('Can not get the Case');
  }

  if (!status) {
    throw new Error('Cannot get status');
  }

  const editableStatuses: CaseStatusToBeEdited[] = [
    CaseStatusToBeEdited.PENDING,
    CaseStatusToBeEdited.INFO_REQUIRED,
  ];

  if (editableStatuses.includes(status as CaseStatusToBeEdited)) {
    return (
      <OrganizationGuard>
        <IMEReferralEdit
          examinationId={id}
          claimTypes={claimTypes.result}
          examinationTypes={examinationTypes}
          caseTypes={caseTypes.result}
          languages={languages.result}
          mode="edit"
          initialData={examinationData.result}
        />
      </OrganizationGuard>
    );
  }

  return (
    <OrganizationGuard>
      <div className="flex h-[calc(100vh-17vh)] items-center justify-center">
        <h2 className="mb-6 text-[24px] font-semibold leading-[36.02px] tracking-[-0.02em] md:text-[36.02px]">
          You can not edit this case
        </h2>
      </div>
    </OrganizationGuard>
  );
};

export default Page;
