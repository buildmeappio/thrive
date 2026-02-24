import { Button } from '@/components/ui';

const Welcome = () => {
  return (
    <div>
      <div className="min-h-[277px] w-full max-w-[640px] rounded-[25px] bg-white px-4 py-6 sm:px-8 lg:px-14">
        <h1 className="text-xl font-semibold tracking-[-0.01em] text-[#000093] sm:text-2xl lg:text-[30px]">
          Verification in progress!
        </h1>
        <p className="font-poppins mt-2 text-sm font-normal tracking-[-0.03em] text-[#585858] sm:text-base md:text-[16px]">
          Your organization account is currently under review. You can explore Thrive, but case
          submissions and sensitive data access are restricted until verification is complete.
        </p>

        <div className="mt-8">
          <span className="text-sm font-medium tracking-[-0.03em] text-[#000000] sm:text-base lg:text-[16px]">
            Estimated review time:{' '}
          </span>
          <span className="text-sm font-normal tracking-[-0.03em] text-[#585858] sm:text-base lg:text-[16px]">
            1 business day.
          </span>
        </div>
        <div className="mt-4 flex flex-row space-x-4 space-y-2 sm:items-center sm:space-y-0">
          <span className="flex items-center text-sm font-medium tracking-[-0.03em] text-[#000000] sm:text-base lg:text-[16px]">
            Need Help?
          </span>
          <Button className="w-fit rounded-full bg-[#000093] px-8 text-[11px] font-medium tracking-[-0.03em] text-[#ffffff] hover:bg-[#000093] sm:px-10">
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Welcome;
