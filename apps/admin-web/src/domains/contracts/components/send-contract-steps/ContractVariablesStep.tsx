'use client';

import type { ContractVariables } from '../SendContractDialog';

type Props = {
  contractId: string;
  initialValues?: ContractVariables;
  onNext: (variables: ContractVariables) => void;
  onBack: () => void;
};

export function ContractVariablesStep({ contractId, initialValues, onNext, onBack }: Props) {
  return (
    <div className="p-6">
      <p className="text-gray-600">Contract Variables Step - Not implemented</p>
      <div className="mt-4 flex gap-2">
        <button onClick={onBack} className="rounded bg-gray-200 px-4 py-2">
          Back
        </button>
      </div>
    </div>
  );
}
