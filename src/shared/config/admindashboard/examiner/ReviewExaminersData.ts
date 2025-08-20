import { IReviewExaminerAction, IReviewExaminerData, IReviewExaminerField } from '@/shared/types';

export const examinerData: IReviewExaminerData = {
    name: 'Dr. Sarah Ahmed',
    specialty: 'Orthopedic Surgery',
    phone: '(647) 555-1923',
    email: 's.ahmed@precisionmed.ca',
    province: 'Ontario',
    address: '125 Bay Street, Suite 600',
  };

export const personalContactInfo: IReviewExaminerField[] = [
    { label: 'Name', value: examinerData.name, type: 'text' },
    { label: 'Medical Specialties', value: examinerData.specialty, type: 'specialty' },
    { label: 'Phone Number', value: examinerData.phone, type: 'text' },
    { label: 'Email', value: examinerData.email, type: 'text' },
    { label: 'Province', value: examinerData.province, type: 'text' },
    { label: 'Mailing Address', value: examinerData.address, type: 'text' },
  ];

export const medicalCredentials: IReviewExaminerField[] = [
    { label: 'License Number', value: 'CPSO #09234', type: 'text' },
    { label: 'Province of Licensure', value: 'Ontario', type: 'text' },
    { label: 'License Expiry Date', value: 'December 31, 2025', type: 'text' },
    { label: 'CV / Resume', value: 'Download', type: 'download' },
    { label: 'Medical License', value: 'Download', type: 'download' },
  ];

export const imeExperience: IReviewExaminerField[] = [
    { label: 'Languages Spoken', value: 'English, Urdu', type: 'text' },
    { label: 'Years of IME Experience', value: '12', type: 'text' },
  ];

export const experienceDetails: string = `I am Dr. Sarah Ahmed, a board-certified orthopedic surgeon with over 12 years of experience conducting Independent Medical Evaluations (IMEs) across personal injury, workplace disability, and accident benefit cases. She has completed more than 350 IMEs to date, serving clients from both plaintiff and defense sides.`;

export  const legalCompliance: IReviewExaminerField[] = [
    { label: 'Insurance Proof', value: 'Download', type: 'download' },
    { label: 'Signed NDA', value: 'Download', type: 'download' },
  ];

export const actions: IReviewExaminerAction[] = [
    {
      label: 'Approve Examiner',
      type: 'primary',
      color: 'cursor-pointer bg-gradient-to-l from-emerald-300 to-sky-500 bg-clip-text text-transparent border-2 border-cyan-400',
    },
    {
      label: 'Request More Info',
      type: 'secondary',
      color: 'cursor-pointer bg-white border-2 border-[#000093] text-[#000093] hover:bg-blue-50',
    },
    {
      label: 'Reject Examiner',
      type: 'danger',
      color: 'cursor-pointer bg-[#B90000] text-white border-2 border-[#B90000]',
    },
  ];
