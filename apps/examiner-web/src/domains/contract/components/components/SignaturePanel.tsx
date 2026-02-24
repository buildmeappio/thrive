import { SignaturePanelProps } from '../../types/contract.types';

export const SignaturePanel = ({
  sigName,
  sigDate,
  signatureImage,
  canvasRef,
  clearSignature,
  agree,
  setAgree,
  onSign,
  onDecline,
  isSigning,
}: SignaturePanelProps) => {
  return (
    <div
      className="flex w-full shrink-0 flex-col rounded-[20px] bg-white p-6 md:p-8 lg:w-96 lg:min-w-[384px]"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <div className="mb-6 border-b-2 border-[#00A8FF] pb-3">
        <h2 className="text-2xl font-semibold text-black md:text-[24px]">Sign Agreement</h2>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-black">Full Name</label>
          <input
            disabled
            type="text"
            value={sigName}
            placeholder="Dr. Jane Doe"
            className="mt-2 flex h-[55px] w-full items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm text-[#333] placeholder:text-[14px] placeholder:text-[#9EA9AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-black">Effective Date</label>
          <input
            type="date"
            value={sigDate}
            disabled
            className="mt-2 flex h-[55px] w-full items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm text-[#333] placeholder:text-[14px] placeholder:text-[#9EA9AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-black">Draw Your Signature</label>
          <div className="rounded-[10px] border-2 border-[#00A8FF] bg-white p-1">
            <canvas
              ref={canvasRef}
              width={320}
              height={140}
              className="w-full cursor-crosshair rounded-[8px] bg-[#F2F5F6]"
              style={{ touchAction: 'none' }}
            />
          </div>
          <button
            onClick={clearSignature}
            className="mt-2 text-sm font-semibold text-[#00A8FF] underline transition-colors hover:text-[#0088CC]"
          >
            Clear Signature
          </button>
        </div>

        <div className="rounded-[10px] border-2 border-[#E9EDEE] bg-[#F2F5F6] p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agree}
              onChange={e => setAgree(e.target.checked)}
              className="mt-0.5 h-5 w-5 cursor-pointer rounded border-2 border-[#9EA9AA] text-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF]/30 focus-visible:outline-none"
            />
            <span className="text-xs font-medium leading-relaxed text-[#333]">
              I agree that this electronic signature is the legal equivalent of my handwritten
              signature and I accept all terms and conditions of this agreement.
            </span>
          </label>
        </div>

        <button
          onClick={onSign}
          disabled={!agree || !sigName || !sigDate || !signatureImage || isSigning}
          className={`w-full rounded-lg px-4 py-3 text-base font-semibold text-white transition-all ${
            agree && sigName && sigDate && signatureImage && !isSigning
              ? 'cursor-pointer shadow-md hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40'
              : 'cursor-not-allowed bg-gray-400'
          }`}
          style={
            agree && sigName && sigDate && signatureImage && !isSigning
              ? {
                  background: 'linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)',
                }
              : {}
          }
        >
          {isSigning ? 'Processing...' : 'Sign Agreement'}
        </button>

        <button
          onClick={onDecline}
          disabled={isSigning}
          className="w-full rounded-lg border-2 border-red-600 bg-white px-4 py-3 text-base font-semibold text-red-600 transition-all hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Decline Agreement
        </button>
      </div>
    </div>
  );
};
