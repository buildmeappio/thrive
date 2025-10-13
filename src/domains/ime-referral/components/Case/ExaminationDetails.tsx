import { formatDate } from '@/utils/dateTime';
import { getCaseDetails } from '../../actions';

type ExaminationDetailsProps = {
  examinationDetails: Awaited<ReturnType<typeof getCaseDetails>>['result'];
};

const ExaminationDetails = ({ examinationDetails }: ExaminationDetailsProps) => {
  console.log(examinationDetails);

  const fields = [
    {
      label: 'Examination Type',
      value: examinationDetails?.examinationType?.name,
      key: 'examinationType',
    },
    {
      label: 'Due Date',
      value: formatDate(examinationDetails?.dueDate),
      key: 'dueDate',
    },
    {
      label: 'Urgency Level',
      value: examinationDetails?.urgencyLevel,
      key: 'urgencyLevel',
    },
    {
      label: 'Preference',
      value: examinationDetails?.preference,
      key: 'preference',
    },
    {
      label: 'Support Person',
      value:
        examinationDetails?.supportPerson !== undefined
          ? examinationDetails.supportPerson
            ? 'Yes'
            : 'No'
          : null,
      key: 'supportPerson',
    },
    {
      label: 'Status',
      value: examinationDetails?.status?.name,
      key: 'status',
    },
    {
      label: 'Examiner',
      value:
        examinationDetails?.examiner?.user?.firstName &&
        examinationDetails?.examiner?.user?.lastName
          ? `${examinationDetails.examiner.user.firstName} ${examinationDetails.examiner.user.lastName}`
          : null,
      key: 'examiner',
    },
    {
      label: 'Assigned To',
      value:
        examinationDetails?.assignTo?.user?.firstName &&
        examinationDetails?.assignTo?.user?.lastName
          ? `${examinationDetails.assignTo.user.firstName} ${examinationDetails.assignTo.user.lastName}`
          : null,
      key: 'assignTo',
    },
    {
      label: 'Assigned At',
      value: formatDate(examinationDetails?.assignedAt),
      key: 'assignedAt',
    },
    {
      label: 'Notes',
      value: examinationDetails?.notes,
      key: 'notes',
    },
    {
      label: 'Additional Notes',
      value: examinationDetails?.additionalNotes,
      key: 'additionalNotes',
    },
  ];

  const visibleFields = fields.filter(field => field.value);

  const services = examinationDetails?.services || [];
  const enabledServices = services.filter(service => service.enabled);

  return (
    <div className="space-y-4">
      {/* Examination Details */}
      <div className="space-y-2">
        {visibleFields.length > 0 ? (
          visibleFields.map(field => (
            <div key={field.key} className="flex w-full justify-between bg-[#F6F6F6] px-4 py-2">
              <span className="text-[14px] font-normal text-[#4E4E4E] md:text-[18px]">
                {field.label}
              </span>
              <span className="ml-4 text-right text-[14px] font-normal text-[#000080] md:text-[18px]">
                {field.value}
              </span>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-gray-500">No examination details available</div>
        )}
      </div>

      {/* Examination Services */}
      {enabledServices.length > 0 && (
        <div className="space-y-2">
          <h3 className="px-4 text-[20px] font-semibold text-[#4E4E4E]">Services</h3>
          {enabledServices.map(service => (
            <div key={service.id} className="space-y-2">
              <div className="flex w-full justify-between bg-[#F6F6F6] px-4 py-2">
                <span className="text-[18px] font-normal text-[#4E4E4E]">Service Type</span>
                <span className="ml-4 text-right text-[18px] font-normal text-[#000080]">
                  {service.type}
                </span>
              </div>

              {/* Interpreter Details */}
              {service.type === 'INTERPRETER' && service.interpreter && (
                <div className="flex w-full justify-between bg-[#F6F6F6] px-4 py-2">
                  <span className="text-[18px] font-normal text-[#4E4E4E]">Language</span>
                  <span className="ml-4 text-right text-[18px] font-normal text-[#000080]">
                    {service.interpreter.language?.name}
                  </span>
                </div>
              )}

              {/* Transport Details */}
              {service.type === 'TRANSPORT' && service.transport && (
                <>
                  {service.transport.pickupAddress?.address && (
                    <div className="flex w-full justify-between bg-[#F6F6F6] px-4 py-2">
                      <span className="text-[18px] font-normal text-[#4E4E4E]">Pickup Address</span>
                      <span className="ml-4 text-right text-[18px] font-normal text-[#000080]">
                        {service.transport.pickupAddress.address}
                      </span>
                    </div>
                  )}
                  {service.transport.rawLookup && (
                    <div className="flex w-full justify-between bg-[#F6F6F6] px-4 py-2">
                      <span className="text-[18px] font-normal text-[#4E4E4E]">Raw Lookup</span>
                      <span className="ml-4 text-right text-[18px] font-normal text-[#000080]">
                        {service.transport.rawLookup}
                      </span>
                    </div>
                  )}
                  {service.transport.notes && (
                    <div className="flex w-full justify-between bg-[#F6F6F6] px-4 py-2">
                      <span className="text-[18px] font-normal text-[#4E4E4E]">
                        Transport Notes
                      </span>
                      <span className="ml-4 text-right text-[18px] font-normal text-[#000080]">
                        {service.transport.notes}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExaminationDetails;
