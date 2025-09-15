import AddOnServices from './AddonServices';
import AppointmentOptions from './AppointmentOptions';
import UserInfo from './UserInfo';

type ClaimantAvailabilityProps = {
  caseId: string;
  claimantFirstName: string | null;
  claimantLastName: string | null;
  organizationName?: string | null;
};
const ClaimantAvailability: React.FC<ClaimantAvailabilityProps> = ({
  caseId,
  claimantFirstName,
  claimantLastName,
  organizationName,
}) => {
  return (
    <div>
      <div className="space-y-12">
        <h1 className="mt-4 text-center text-[36px] leading-[100%] font-semibold tracking-normal capitalize">
          Help Us Schedule Your IME
        </h1>
        <UserInfo
          caseId={caseId}
          claimantFirstName={claimantFirstName ?? ''}
          claimantLastName={claimantLastName ?? ''}
          organizationName={organizationName ?? ''}
        />
        <div className="mx-auto max-w-[1020px]">
          <AppointmentOptions />
          <AddOnServices />
        </div>
      </div>
    </div>
  );
};

export default ClaimantAvailability;
