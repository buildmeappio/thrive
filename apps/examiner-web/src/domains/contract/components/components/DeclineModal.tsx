import { DeclineModalProps } from '../../types/contract.types';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-[20px] bg-white p-8"
        style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
      >
        <div className="mb-6 border-b-2 border-[#00A8FF] pb-3">
          <h3 className="text-2xl font-semibold text-[#140047]">Decline Agreement</h3>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          Please provide a reason for declining this agreement:
        </p>
        <textarea
          value={declineReason}
          onChange={e => onReasonChange(e.target.value)}
          placeholder="Enter your reason..."
          className="h-32 w-full resize-none rounded-[10px] border-2 border-gray-200 p-3 text-sm focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF]/30"
        />
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeclining}
            className="flex-1 rounded-[10px] border-2 border-[#00A8FF] bg-white px-4 py-3 font-semibold text-[#00A8FF] transition-colors hover:bg-[#F7FCFF] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeclining || !declineReason.trim()}
            className="flex-1 rounded-[10px] px-4 py-3 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background:
                isDeclining || !declineReason.trim()
                  ? '#9CA3AF'
                  : 'linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)',
            }}
          >
            {isDeclining ? 'Declining...' : 'Confirm Decline'}
          </button>
        </div>
      </div>
    </div>
  );
};
