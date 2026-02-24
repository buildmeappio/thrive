import { Examination, UrgencyLevel } from '@thrive/database';
import { CaseRowDTO } from '../../types/dashboard.types';

export const toUrgency = (u: UrgencyLevel): 'Urgent' | 'Normal' =>
  u === 'HIGH' ? 'Urgent' : 'Normal';

export const toCaseRowDTO = (
  e: Examination & {
    status: { name: string };
    referral: {
      claimant: { firstName: string; lastName: string } | null;
      organization: { name: string } | null;
    };
  }
): CaseRowDTO => ({
  id: e.id,
  caseNo: e.caseNumber,
  claimant: e.referral?.claimant
    ? `${e.referral.claimant.firstName} ${e.referral.claimant.lastName}`
    : 'Unknown',
  organization: e.referral?.organization?.name ?? 'Unknown',
  urgency: toUrgency(e.urgencyLevel),
  status:
    e.status.name === 'Accepted'
      ? 'Accepted'
      : e.status.name === 'Rejected'
        ? 'Rejected'
        : 'Pending',
});
