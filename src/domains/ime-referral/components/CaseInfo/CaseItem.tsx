import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, X } from 'lucide-react';
import { type DropdownOption } from '../../types/CaseInfo';
import { type CaseInfo } from '@/shared/validation/imeReferral/imeReferralValidation';

type CaseItemProps = {
  caseItem: CaseInfo;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  caseTypes?: DropdownOption[];
  examFormats?: DropdownOption[];
  requestedSpecialties?: DropdownOption[];
  urgencyLevels?: DropdownOption[];
  preferredLocations?: DropdownOption[];
};

const CaseItem: React.FC<CaseItemProps> = ({
  caseItem,
  index,
  onEdit,
  onRemove,
  caseTypes = [],
  examFormats = [],
  requestedSpecialties = [],
  urgencyLevels = [],
  preferredLocations = [],
}) => {
  const findLabel = (options: DropdownOption[], value: string) => {
    if (!options || !Array.isArray(options) || !value) {
      return value;
    }
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const formatCasePreview = (caseItem: CaseInfo) => ({
    type: findLabel(caseTypes, caseItem.caseType),
    urgency: findLabel(urgencyLevels, caseItem.urgencyLevel),
    format: findLabel(examFormats, caseItem.examFormat),
    specialty: findLabel(requestedSpecialties, caseItem.requestedSpecialty),
    location: findLabel(preferredLocations, caseItem.preferredLocation),
  });

  const casePreview = formatCasePreview(caseItem);

  return (
    <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-gray-900">Case {index + 1}</h4>
          <p className="mt-1 text-sm break-words text-gray-600">{caseItem.reason}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
            <span>Type: {casePreview.type}</span>
            <span>Urgency: {casePreview.urgency}</span>
            <span>Format: {casePreview.format}</span>
            <span>Specialty: {casePreview.specialty}</span>
            <span>Location: {casePreview.location}</span>
          </div>
        </div>
        <div className="ml-4 flex space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(index)}
            className="h-8 w-8 p-0"
            aria-label={`Edit case ${index + 1}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            aria-label={`Remove case ${index + 1}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CaseItem;
