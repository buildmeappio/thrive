import { getCaseTypes, getExamFormats, getRequestedSpecialties } from '@/domains/auth/actions';
import IMEReferral from '@/domains/ime-referral/components';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create IME Referral | Thrive',
  description: 'Create a new IME Referral - Thrive',
};

export const dynamic = 'force-dynamic';

const IMEReferralPage = async () => {
  const [caseTypes, examFormats, requestedSpecialties] = await Promise.all([
    getCaseTypes(),
    getExamFormats(),
    getRequestedSpecialties(),
  ]);

  return (
    <IMEReferral
      caseTypes={caseTypes.result}
      examFormats={examFormats.result}
      requestedSpecialties={requestedSpecialties.result}
    />
  );
};

export default IMEReferralPage;
