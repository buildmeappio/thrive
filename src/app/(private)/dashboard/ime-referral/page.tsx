import { getExaminationTypes } from '@/domains/auth/actions';
import { getExamTypes } from '@/domains/ime-referral/actions';
import IMEReferral from '@/domains/ime-referral/components';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create IME Referral | Thrive',
  description: 'Create a new IME Referral - Thrive',
};

export const dynamic = 'force-dynamic';

const IMEReferralPage = async () => {
  const [examTypes, examinationTypes] = await Promise.all([getExaminationTypes(), getExamTypes()]);

  return <IMEReferral examinationTypes={examinationTypes.result} examTypes={examTypes.result} />;
};

export default IMEReferralPage;
