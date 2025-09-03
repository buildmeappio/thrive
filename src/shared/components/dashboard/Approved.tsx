import { Button } from '@/shared/components/ui';

const Approved = () => {
  return (
    <div>
      {/* <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl lg:text-[40px] font-semibold tracking-[-0.03em] text-[#000000]">
        Welcome, <span className="text-[#000093]">Sarah</span> from Desjardins!
      </h1> */}
      <div className="w-full max-w-[725px] min-h-[385px] rounded-[25px] bg-white px-6 sm:px-8 lg:px-12 py-6 lg:py-8">
        <h1 className="text-xl sm:text-2xl lg:text-[30px] font-semibold tracking-[-0.01em] text-[#000093] mb-2">
          Congratulations!
        </h1>
        <p className="text-sm sm:text-base lg:text-[16px] font-normal tracking-[-0.03em] text-[#585858] mb-6">
          Your organization account is now fully active.
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex items-start space-x-3">
            <span className="text-lg">✚</span>
            <span className="text-sm sm:text-base lg:text-[16px] font-normal tracking-[-0.03em] text-[#585858]">
              Create a new IME request
            </span>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-lg">🔍</span>
            <span className="text-sm sm:text-base lg:text-[16px] font-normal tracking-[-0.03em] text-[#585858]">
              Get matched with the right medical expert using our AI-powered engine
            </span>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-lg">📄</span>
            <span className="text-sm sm:text-base lg:text-[16px] font-normal tracking-[-0.03em] text-[#585858]">
              Upload documents and track all your active cases in real time
            </span>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-lg">📊</span>
            <span className="text-sm sm:text-base lg:text-[16px] font-normal tracking-[-0.03em] text-[#585858]">
              Access reports, invoices, and case history — all in one place
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm sm:text-base lg:text-[16px] font-medium tracking-[-0.03em] text-[#000000]">
            Let's get your first independent medical examination started.
          </p>
          <Button className="rounded-full bg-[#000093] hover:bg-[#000093] px-6 sm:px-8 lg:px-12 py-2 text-xs sm:text-sm lg:text-[11px] font-medium tracking-[-0.03em] text-[#ffffff] w-fit">
            ✚ New IME Referral
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Approved;