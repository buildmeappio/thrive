import React from 'react';
import CaseItem from './CaseItem';
import { type CaseListProps } from '../../types/CaseInfo';

const CaseList: React.FC<CaseListProps> = ({ cases, onEdit, onRemove, isDisabled = false }) => {
  return (
    <div className="mb-6 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Added Cases ({cases.length})</h3>
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
