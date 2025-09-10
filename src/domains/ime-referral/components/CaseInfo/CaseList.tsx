import React from 'react';
import CaseItem from './CaseItem';
import AddCaseButton from './AddCaseButton';
import { type CaseInfo } from '@/shared/validation/imeReferral/imeReferralValidation';

type CaseListProps = {
  cases: CaseInfo[];
  onEdit: (index: number) => void;
  handleAddNewCase: () => void;
  onRemove: (index: number) => void;
  isDisabled?: boolean;
};

const CaseList: React.FC<CaseListProps> = ({
  cases,
  onEdit,
  handleAddNewCase,
  onRemove,
  isDisabled = false,
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium text-gray-900">Added Cases ({cases.length})</h3>

        <AddCaseButton onClick={handleAddNewCase} isDisabled={false} />
      </div>
      {cases.map((caseItem, index) => (
        <CaseItem
          key={index}
          caseItem={caseItem}
          index={index}
          onEdit={onEdit}
          onRemove={onRemove}
          isDisabled={isDisabled}
        />
      ))}
    </div>
  );
};

export default CaseList;
