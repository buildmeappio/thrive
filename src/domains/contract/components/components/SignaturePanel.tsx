import { SignaturePanelProps } from "../../types/contract.types";

export const SignaturePanel = ({
  sigName,
  sigDate,
  signatureImage,
  canvasRef,
  clearSignature,
  agree,
  setAgree,
  checkboxGroups,
  checkboxValues,
  onCheckboxChange,
  onSign,
  onDecline,
  isSigning,
}: SignaturePanelProps) => {
  return (
    <div
      className="w-full lg:w-96 lg:min-w-[384px] bg-white p-6 md:p-8 rounded-[20px] flex flex-col shrink-0"
      style={{
        boxShadow: "0px 0px 36.35px 0px #00000008",
      }}
    >
      <div className="border-b-2 border-[#00A8FF] pb-3 mb-6">
        <h2 className="text-2xl md:text-[24px] font-semibold text-black">
          Sign Agreement
        </h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Full Name
          </label>
          <input
            disabled
            type="text"
            value={sigName}
            placeholder="Dr. Jane Doe"
            className="mt-2 flex h-[55px] w-full items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm text-[#333] placeholder:text-[14px] placeholder:text-[#9EA9AA] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Effective Date
          </label>
          <input
            type="date"
            value={sigDate}
            disabled
            className="mt-2 flex h-[55px] w-full items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm text-[#333] placeholder:text-[14px] placeholder:text-[#9EA9AA] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Draw Your Signature
          </label>
          <div className="border-2 border-[#00A8FF] rounded-[10px] p-1 bg-white">
            <canvas
              ref={canvasRef}
              width={320}
              height={140}
              className="w-full cursor-crosshair bg-[#F2F5F6] rounded-[8px]"
              style={{ touchAction: "none" }}
            />
          </div>
          <button
            onClick={clearSignature}
            className="mt-2 text-sm text-[#00A8FF] hover:text-[#0088CC] font-semibold underline transition-colors"
          >
            Clear Signature
          </button>
        </div>

        {checkboxGroups.length > 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-black mb-2">
              Select Options
            </label>
            {checkboxGroups.map((group) => (
              <div
                key={group.variableKey}
                className="border-2 border-[#E9EDEE] rounded-[10px] p-4 bg-white"
              >
                <label className="block text-sm font-semibold text-black mb-3">
                  {group.label}
                </label>
                <div className="space-y-2">
                  {group.options.map((option) => {
                    const isChecked =
                      checkboxValues[group.variableKey]?.includes(
                        option.value,
                      ) || false;
                    return (
                      <label
                        key={option.value}
                        className="flex items-start gap-3 cursor-pointer hover:bg-[#F2F5F6] p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            onCheckboxChange(
                              group.variableKey,
                              option.value,
                              e.target.checked,
                            )
                          }
                          className="mt-0.5 w-5 h-5 text-[#00A8FF] border-2 border-[#9EA9AA] rounded focus:ring-2 focus:ring-[#00A8FF]/30 focus-visible:outline-none cursor-pointer"
                        />
                        <span className="text-sm text-[#333] leading-relaxed">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-2 border-[#E9EDEE] rounded-[10px] p-4 bg-[#F2F5F6]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 w-5 h-5 text-[#00A8FF] border-2 border-[#9EA9AA] rounded focus:ring-2 focus:ring-[#00A8FF]/30 focus-visible:outline-none cursor-pointer"
            />
            <span className="text-xs text-[#333] leading-relaxed font-medium">
              I agree that this electronic signature is the legal equivalent of
              my handwritten signature and I accept all terms and conditions of
              this agreement.
            </span>
          </label>
        </div>

        <button
          onClick={onSign}
          disabled={
            !agree || !sigName || !sigDate || !signatureImage || isSigning
          }
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white text-base transition-all ${
            agree && sigName && sigDate && signatureImage && !isSigning
              ? "cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          style={
            agree && sigName && sigDate && signatureImage && !isSigning
              ? {
                  background:
                    "linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)",
                }
              : {}
          }
        >
          {isSigning ? "Processing..." : "Sign Agreement"}
        </button>

        <button
          onClick={onDecline}
          disabled={isSigning}
          className="w-full py-3 px-4 rounded-lg font-semibold text-red-600 text-base transition-all border-2 border-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Decline Agreement
        </button>
      </div>
    </div>
  );
};
