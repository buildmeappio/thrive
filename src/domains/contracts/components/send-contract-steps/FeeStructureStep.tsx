"use client";

type Props = {
  applicationId: string;
  onNext: (feeStructureId: string, createdContractId: string) => void;
  onCancel: () => void;
};

export function FeeStructureStep({ applicationId, onNext, onCancel }: Props) {
  return (
    <div className="p-6">
      <p className="text-gray-600">Fee Structure Step - Not implemented</p>
      <button onClick={onCancel} className="mt-4 px-4 py-2 bg-gray-200 rounded">
        Cancel
      </button>
    </div>
  );
}
