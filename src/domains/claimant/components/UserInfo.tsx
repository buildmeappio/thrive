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
    <div className="bg-[#FAFAFF]">
      <div className="mx-auto max-w-[1020px]">
        <div className="mb-6 flex items-start justify-between py-6">
          <div>
            <p className="">
              <span className="text-[18.87px] leading-[100%] font-semibold tracking-normal text-[#000000]">
                Case ID:
              </span>{' '}
              {caseId}
            </p>
          </div>
          <div>
            <p className="">
              <span className="text-[18.87px] leading-[100%] font-semibold tracking-normal text-[#000000]">
                Referring Organization:
              </span>{' '}
              {organizationName}
            </p>
          </div>
        </div>
        <div className="flex w-[920px] flex-col justify-center">
          <h2 className="mb-8 text-center text-[36px] leading-[100%] font-semibold tracking-normal">
            Hi {claimantFirstName} {claimantLastName},
          </h2>
          <p className="mb-8 text-center text-[18.87px] leading-[100%] font-light tracking-normal">
            We've received a request to schedule your independent medical examination (IME). Please
            tell us when you're available. This will help us match you with the right specialist.
          </p>
        </div>
      </div>
    </div>
  );
};
export default UserInfo;
