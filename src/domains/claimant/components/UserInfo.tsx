const UserInfo = () => {
  return (
    <div className="bg-[#FAFAFF]">
      <div className="mx-auto max-w-[1020px]">
        <div className="mb-6 flex items-start justify-between py-6">
          <div>
            <p className="">
              <span className="text-[18.87px] leading-[100%] font-semibold tracking-normal text-[#000000]">
                Case ID:
              </span>{' '}
              IME-20240501-013
            </p>
          </div>
          <div>
            <p className="">
              <span className="text-[18.87px] leading-[100%] font-semibold tracking-normal text-[#000000]">
                Referring Organization:
              </span>{' '}
              ShieldCare Insurance Ltd.
            </p>
          </div>
        </div>
        <div className="flex w-[920px] flex-col justify-center">
          <h2 className="mb-8 text-center text-[36px] leading-[100%] font-semibold tracking-normal">
            Hi Johnathan,
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
