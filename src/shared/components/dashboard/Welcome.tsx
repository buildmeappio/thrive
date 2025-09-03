import { Button } from '@/shared/components/ui';

const Welcome = () => {
  return (
    <div>
      {/* <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl lg:text-[40px] font-semibold tracking-[-0.03em] text-[#000000]">
        Welcome, <span className="text-[#000093]">Sarah</span> from Desjardins!
      </h1> */}
      <div className="w-full max-w-[640px] min-h-[270px] rounded-[25px] bg-white px-6 sm:px-8 lg:px-12 py-6">
        <h1 className="text-xl sm:text-2xl lg:text-[30px] font-semibold tracking-[-0.01em] text-[#000093]">
          Verification in progress!
        </h1>
        <p className="mt-2 text-sm sm:text-base lg:text-[16px] font-normal tracking-[-0.03em] text-[#585858]">
          Your organization account is currently under review. You can explore Thrive, but case
          submissions and sensitive data access are restricted until verification is complete.
        </p>

        <div className='mt-4'>
          <span className="text-sm sm:text-base lg:text-[16px] font-medium tracking-[-0.03em] text-[#000000]">
            Estimated review time: {" "}
          </span>
          <span className="text-sm sm:text-base lg:text-[16px] font-normal tracking-[-0.03em] text-[#585858]">
            1 business day.
          </span>
        </div>
        <div className="mt-2 flex flex-row sm:items-center space-x-4 space-y-2 sm:space-y-0">
          <span className="flex items-center text-sm sm:text-base lg:text-[16px] font-medium tracking-[-0.03em] text-[#000000]">
            Need Help?
          </span>
          <Button className="rounded-full bg-[#000093] hover:bg-[#000093] px-8 sm:px-10 text-[11px] font-medium tracking-[-0.03em] text-[#ffffff] w-fit">
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Welcome;