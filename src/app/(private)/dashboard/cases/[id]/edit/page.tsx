import { getClaimTypes, getCaseTypes, getCaseData } from '@/domains/ime-referral/actions';
import { getExaminationTypes } from '@/domains/auth/server/handlers';
import { getLanguages } from '@/domains/claimant/actions';
import IMEReferralEdit from '@/domains/ime-referral/components/IMEReferralEdit';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: 'Edit Examination | Thrive',
  description: 'Edit Examination - Thrive',
};

const Page = async ({ params }: Props) => {
  const { id } = await params;

  const examinationData = await getCaseData(id);

  const [claimTypes, examinationTypes, caseTypes, languages] = await Promise.all([
    getClaimTypes(),
    getExaminationTypes(),
    getCaseTypes(),
    getLanguages(),
  ]);

  return (
    <IMEReferralEdit
      examinationId={id}
      claimTypes={claimTypes.result}
      examinationTypes={examinationTypes}
      caseTypes={caseTypes.result}
      languages={languages.result}
      mode="edit"
      initialData={examinationData.result}
    />
  );
};

export default Page;
