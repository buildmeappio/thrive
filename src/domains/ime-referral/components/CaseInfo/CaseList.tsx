import React from 'react';
import CaseItem from './CaseItem';
import AddCaseButton from './AddCaseButton';
import { type CaseInfo } from '../../schemas/imeReferral';
import { type DropdownOption } from '../../types/CaseInfo';

type CaseListProps = {
  cases: CaseInfo[];
  onEdit: (index: number) => void;
  handleAddNewCase: () => void;
  onRemove: (index: number) => void;
  caseTypes: DropdownOption[];
  examFormats: DropdownOption[];
  requestedSpecialties: DropdownOption[];
};

const CaseList: React.FC<CaseListProps> = ({
  cases,
  onEdit,
  handleAddNewCase,
  onRemove,
  caseTypes,
  examFormats,
  requestedSpecialties,
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium text-gray-900">Added Cases ({cases.length})</h3>
        <AddCaseButton onClick={handleAddNewCase} />
      </div>
      {cases.map((caseItem, index) => (
        <CaseItem
          key={index}
          caseItem={caseItem}
          index={index}
          onEdit={onEdit}
          onRemove={onRemove}
          caseTypes={caseTypes}
          examFormats={examFormats}
          requestedSpecialties={requestedSpecialties}
        />
      ))}
    </div>
  );
};

export default CaseList;
