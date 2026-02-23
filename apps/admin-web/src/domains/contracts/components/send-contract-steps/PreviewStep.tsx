"use client";

import type { ContractVariables } from "../SendContractDialog";

type Props = {
  contractId: string;
  variables: ContractVariables;
  onBack: () => void;
  onSendSuccess: () => void;
};

export function PreviewStep({
  contractId,
  variables,
  onBack,
  onSendSuccess,
}: Props) {
  return (
    <div className="p-6">
      <p className="text-gray-600">Preview Step - Not implemented</p>
      <div className="mt-4 flex gap-2">
        <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded">
          Back
        </button>
      </div>
    </div>
  );
}
