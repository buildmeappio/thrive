type UserInfoProps = {
  caseId: string;
  claimantFirstName: string;
  claimantLastName: string;
  organizationName?: string;
};

const UserInfo: React.FC<UserInfoProps> = ({
  caseId,
  claimantFirstName,
  claimantLastName,
  organizationName,
}) => {
  return (
    <div className="bg-[#FAFAFF] px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1020px]">
        {/* Top section */}
        <div className="mb-6 flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p>
              <span className="text-lg font-semibold text-black sm:text-[18.87px]">Case ID:</span>{' '}
              {caseId}
            </p>
          </div>
          <div>
            <p className="text-center sm:text-right">
              <span className="text-lg font-semibold text-black sm:text-[18.87px]">
                Referring Organization:
              </span>{' '}
              {organizationName || 'N/A'}
            </p>
          </div>
        </div>

        {/* Message section */}
        <div className="flex w-full flex-col items-center px-2 text-center sm:px-6">
          <h2 className="mb-6 text-2xl font-semibold sm:text-3xl lg:text-[36px]">
            Hi {claimantFirstName} {claimantLastName},
          </h2>
          <p className="mb-8 text-base font-light sm:text-lg lg:text-[18.87px]">
            We’ve received a request to schedule your independent medical examination (IME). Please
            tell us when you&apos;re available.
            <br className="hidden sm:inline" />
            This will help us match you with the right specialist.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
