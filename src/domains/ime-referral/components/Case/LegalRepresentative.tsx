import { formatE164ForDisplay } from '@/utils/formatNumbers';
import { getCaseDetails } from '../../actions';

type LegalRepresentativeDetailsProps = {
  legalRepresentativeDetails: Awaited<
    ReturnType<typeof getCaseDetails>
  >['result']['case']['legalRepresentative'];
};

const LegalRepresentative = ({ legalRepresentativeDetails }: LegalRepresentativeDetailsProps) => {
  const fields = [
    {
      label: 'Company Name',
      value: legalRepresentativeDetails?.companyName,
      key: 'companyName',
    },
    {
      label: 'Contact Person Name',
      value: legalRepresentativeDetails?.contactPersonName,
      key: 'contactPersonName',
    },
    {
      label: 'Phone Number',
      value: formatE164ForDisplay(legalRepresentativeDetails?.phoneNumber),
      key: 'phoneNumber',
    },
    {
      label: 'Fax Number',
      value: formatE164ForDisplay(legalRepresentativeDetails?.faxNumber),
      key: 'faxNumber',
    },
    {
      label: 'Address',
      value: legalRepresentativeDetails?.address?.address,
      key: 'address',
    },
  ];

  const visibleFields = fields.filter(field => field.value);

  return (
    <div className="space-y-2">
      {visibleFields.length > 0 ? (
        visibleFields.map(field => (
          <div key={field.key} className="flex w-full justify-between bg-[#F6F6F6] px-4 py-2">
            <span className="text-[18px] font-normal text-[#4E4E4E]">{field.label}</span>
            <span className="ml-4 text-right text-[18px] font-normal text-[#000080]">
              {field.value}
            </span>
          </div>
        ))
      ) : (
        <div className="py-4 text-center text-gray-500">
          No legal representative details available
        </div>
      )}
    </div>
  );
};

export default LegalRepresentative;
