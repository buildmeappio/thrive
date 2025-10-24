import { getExaminationTypes } from '@/domains/auth/server/handlers';
import { getLanguages } from '@/domains/claimant/actions';
import { getCaseTypes, getClaimTypes } from '@/domains/ime-referral/actions';
import IMEReferral from '@/domains/ime-referral/components';
import { removeUUIDLanguages } from '@/utils/filterLanguages';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create IME Referral | Thrive',
  description: 'Create a new IME Referral - Thrive',
};

export const dynamic = 'force-dynamic';

const IMEReferralPage = async () => {
  const [claimTypes, caseTypes, examinationTypes, languageOptions] = await Promise.all([
    getClaimTypes(),
    getCaseTypes(),
    getExaminationTypes(),
    getLanguages(),
  ]);

  const filteredLanguages = removeUUIDLanguages(languageOptions);

  return (
    <IMEReferral
      claimTypes={claimTypes.result}
      examinationTypes={examinationTypes}
      caseTypes={caseTypes.result}
      languages={filteredLanguages.result}
    />
  );
};

export default IMEReferralPage;
