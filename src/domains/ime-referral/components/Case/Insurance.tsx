import { formatDate } from '@/utils/dateTime';
import { getCaseDetails } from '../../actions';
import { formatE164ForDisplay } from '@/utils/formatNumbers';

type InsuranceDetailsProps = {
  insuranceDetails: Awaited<ReturnType<typeof getCaseDetails>>['result']['case']['insurance'];
};

const InsuranceDetails = ({ insuranceDetails }: InsuranceDetailsProps) => {
  const fields = [
    {
      label: 'Company Name',
      value: insuranceDetails?.companyName,
      key: 'companyName',
    },
    {
      label: 'Contact Person Name',
      value: insuranceDetails?.contactPersonName,
      key: 'contactPersonName',
    },
    {
      label: 'Email Address',
      value: insuranceDetails?.emailAddress,
      key: 'emailAddress',
    },
    {
      label: 'Phone Number',
      value: formatE164ForDisplay(insuranceDetails?.phoneNumber),
      key: 'phoneNumber',
    },
    {
      label: 'Fax Number',
      value: formatE164ForDisplay(insuranceDetails?.faxNumber),
      key: 'faxNumber',
    },
    {
      label: 'Policy Number',
      value: insuranceDetails?.policyNumber,
      key: 'policyNumber',
    },
    {
      label: 'Claim Number',
      value: insuranceDetails?.claimNumber,
      key: 'claimNumber',
    },
    {
      label: 'Date of Loss',
      value: formatDate(insuranceDetails?.dateOfLoss),
      key: 'dateOfLoss',
    },
    {
      label: 'Policy Holder same as Claimant',
      value:
        insuranceDetails?.policyHolderIsClaimant !== undefined
          ? insuranceDetails.policyHolderIsClaimant
            ? 'Yes'
            : 'No'
          : null,
      key: 'policyHolderIsClaimant',
    },
    {
      label: 'Policy Holder First Name',
      value: insuranceDetails?.policyHolderFirstName,
      key: 'policyHolderFirstName',
    },
    {
      label: 'Policy Holder Last Name',
      value: insuranceDetails?.policyHolderLastName,
      key: 'policyHolderLastName',
    },
    {
      label: 'Address',
      value: insuranceDetails?.address?.address,
      key: 'address',
    },
  ];

  const visibleFields = fields.filter(field => field.value);

  return (
    <div className="space-y-2">
      {visibleFields.length > 0 ? (
        visibleFields.map(field => (
          <div key={field.key} className="flex w-full justify-between bg-[#F6F6F6] px-4 py-2">
            <span className="text-[12px] font-normal text-[#4E4E4E] md:text-[18px]">
              {field.label}
            </span>
            <span className="ml-4 text-right text-[12px] font-normal text-[#000080] md:text-[18px]">
              {field.value}
            </span>
          </div>
        ))
      ) : (
        <div className="py-4 text-center text-gray-500">No insurance details available</div>
      )}
    </div>
  );
};

export default InsuranceDetails;
