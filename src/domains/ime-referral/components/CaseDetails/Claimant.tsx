import { formatDate } from '@/utils/dateTime';
import { formatAddress } from '@/utils/formatAddress';
import { showPhoneFax } from '@/utils/showPhoneFax';
import { getCaseDetails } from '../../actions';

type ClaimantProps = {
  claimantDetails: Awaited<ReturnType<typeof getCaseDetails>>['result']['case']['claimant'];
};

const Claimant = ({ claimantDetails }: ClaimantProps) => {
  console.log(claimantDetails);

  const fields = [
    {
      label: 'Type of Claim',
      value: claimantDetails?.claimType?.name,
      key: 'claimType',
    },
    {
      label: 'First Name',
      value: claimantDetails?.firstName,
      key: 'firstName',
    },
    {
      label: 'Last Name',
      value: claimantDetails?.lastName,
      key: 'lastName',
    },
    {
      label: 'Date of Birth',
      value: formatDate(claimantDetails?.dateOfBirth),
      key: 'dateOfBirth',
    },
    {
      label: 'Gender',
      value: claimantDetails?.gender,
      key: 'gender',
    },
    {
      label: 'Phone',
      value: showPhoneFax(claimantDetails?.phoneNumber),
      key: 'phoneNumber',
    },
    {
      label: 'Email Address',
      value: claimantDetails?.emailAddress,
      key: 'emailAddress',
    },
    {
      label: 'Address Lookup',
      value: formatAddress(claimantDetails?.address),
      key: 'address',
    },
    {
      label: 'Related Cases',
      value: claimantDetails?.relatedCasesDetails,
      key: 'relatedCasesDetails',
    },
    {
      label: 'Family Doctor',
      value: claimantDetails?.familyDoctorName,
      key: 'familyDoctorName',
    },
    {
      label: 'Family Doctor Email Address',
      value: claimantDetails?.familyDoctorEmailAddress,
      key: 'familyDoctorEmailAddress',
    },
    {
      label: 'Family Doctor Phone',
      value: showPhoneFax(claimantDetails?.familyDoctorPhoneNumber),
      key: 'familyDoctorPhoneNumber',
    },
    {
      label: 'Family Doctor Fax',
      value: showPhoneFax(claimantDetails?.familyDoctorFaxNumber),
      key: 'familyDoctorFaxNumber',
    },
  ];

  const visibleFields = fields.filter(field => field.value);

  return (
    <div className="space-y-2">
      {visibleFields.length > 0 ? (
        visibleFields.map(field => (
          <div
            key={field.key}
            className="flex w-full justify-between rounded-md bg-[#F6F6F6] px-4 py-2"
          >
            <span className="text-[18px] font-normal text-[#4E4E4E]">{field.label}</span>
            <span className="ml-4 text-right text-[18px] font-normal text-[#000080]">
              {field.value}
            </span>
          </div>
        ))
      ) : (
        <div className="py-4 text-center text-gray-500">No claimant details available</div>
      )}
    </div>
  );
};

export default Claimant;
