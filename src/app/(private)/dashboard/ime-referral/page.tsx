import { getExaminationTypes } from '@/domains/auth/actions';
import { getLanguages } from '@/domains/claimant/actions';
import { getCaseTypes } from '@/domains/ime-referral/actions';
import IMEReferral from '@/domains/ime-referral/components';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create IME Referral | Thrive',
  description: 'Create a new IME Referral - Thrive',
};

export const dynamic = 'force-dynamic';

const IMEReferralPage = async () => {
  const [examinationTypes, caseTypes, languageOptions] = await Promise.all([
    getCaseTypes(),
    getExaminationTypes(),
    getLanguages(),
  ]);

  return (
    <IMEReferral
      examinationTypes={examinationTypes.result}
      caseTypes={caseTypes.result}
      languages={languageOptions.result}
    />
  );
};

export default IMEReferralPage;
