export const SignedView = () => {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-[#F4FBFF] p-4">
      <div className="w-full max-w-2xl">
        <div
          className="rounded-[20px] bg-white p-8 text-center md:p-12"
          style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-semibold text-[#140047] md:text-4xl">
            Contract Signed Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for signing the agreement. Your contract has been submitted and is now
            awaiting admin review and confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};
