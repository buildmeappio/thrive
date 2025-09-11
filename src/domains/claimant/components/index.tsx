import AddOnServices from './AddonServices';
import AppointmentOptions from './AppointmentOptions';
import UserInfo from './UserInfo';

const ClaimantAvailability: React.FC = () => {
  return (
    <div>
      <div className="space-y-12">
        <h1 className="mt-4 text-center text-[36px] leading-[100%] font-semibold tracking-normal capitalize">
          Help Us Schedule Your IME
        </h1>
        <UserInfo />
        <div className="mx-auto max-w-[1000px]">
          <AppointmentOptions />
          <AddOnServices />
        </div>
      </div>
    </div>
  );
};

export default ClaimantAvailability;
