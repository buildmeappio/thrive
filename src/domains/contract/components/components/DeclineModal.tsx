import { DeclineModalProps } from "../../types/contract.types";

export const DeclineModal = ({
  show,
  declineReason,
  isDeclining,
  onReasonChange,
  onConfirm,
  onCancel,
}: DeclineModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-[20px] p-8 max-w-md w-full"
        style={{ boxShadow: "0px 0px 36.35px 0px #00000008" }}
      >
        <div className="border-b-2 border-[#00A8FF] pb-3 mb-6">
          <h3 className="text-2xl font-semibold text-[#140047]">
            Decline Agreement
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Please provide a reason for declining this agreement:
        </p>
        <textarea
          value={declineReason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Enter your reason..."
          className="w-full h-32 p-3 border-2 border-gray-200 rounded-[10px] focus:ring-2 focus:ring-[#00A8FF]/30 focus:border-[#00A8FF] resize-none text-sm"
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isDeclining}
            className="flex-1 py-3 px-4 rounded-[10px] font-semibold text-[#00A8FF] border-2 border-[#00A8FF] bg-white hover:bg-[#F7FCFF] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeclining || !declineReason.trim()}
            className="flex-1 py-3 px-4 rounded-[10px] font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                isDeclining || !declineReason.trim()
                  ? "#9CA3AF"
                  : "linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)",
            }}
          >
            {isDeclining ? "Declining..." : "Confirm Decline"}
          </button>
        </div>
      </div>
    </div>
  );
};
