import ErrorMessages from '@/constants/ErrorMessages';
import iMEReferralService from '../imeReferral.service';
import { type IMEFormData } from '@/store/useIMEReferralStore';

const createIMEReferral = async (data: IMEFormData) => {
  if (!data.step1 || !data.step2 || !data.step3 || !data.step4) {
    throw new Error(ErrorMessages.STEPS_REQUIRED);
  }

  const result = iMEReferralService.createIMEReferralWithClaimant({
    firstName: data.step1.firstName,
    lastName: data.step1.lastName,
    dob: data.step1.dob,
    gender: data.step1.gender,
    phone: data.step1.phone,
    email: data.step1.email,
    addressLookup: data.step1.addressLookup,
    street: data.step1.street,
    apt: data.step1.apt,
    city: data.step1.city,
    postalCode: data.step1.postalCode,
    province: data.step1.province,
    reason: data.step2.reason,
    caseType: data.step2.caseType,
    urgencyLevel: data.step2.urgencyLevel,
    examFormat: data.step2.examFormat,
    requestedSpecialty: data.step2.requestedSpecialty,
    preferredLocation: data.step2.preferredLocation,
    files: data.step3.files,
    consentConfirmation: data.step4.consentConfirmation,
  });

  return { success: true, result };
};

export default createIMEReferral;
