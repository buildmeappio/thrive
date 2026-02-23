export const DeclinedView = () => {
  return (
    <div className="bg-[#F4FBFF] min-h-[calc(100vh-80px)] overflow-hidden p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div
          className="bg-white rounded-[20px] p-8 md:p-12 text-center"
          style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}
        >
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-red-600"
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
          <h1 className="text-3xl md:text-4xl font-semibold text-[#140047] mb-4">
            Contract Declined
          </h1>
          <p className="text-lg text-gray-600">
            You have declined the contract. The admin team has been notified of
            your decision.
          </p>
        </div>
      </div>
    </div>
  );
};
