export const DeclinedView = () => {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-[#F4FBFF] p-4">
      <div className="w-full max-w-2xl">
        <div
          className="rounded-[20px] bg-white p-8 text-center md:p-12"
          style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-semibold text-[#140047] md:text-4xl">
            Contract Declined
          </h1>
          <p className="text-lg text-gray-600">
            You have declined the contract. The admin team has been notified of your decision.
          </p>
        </div>
      </div>
    </div>
  );
};
