import { formatLabel } from '@/utils/labelFormat';

export type SelectableItem = {
  id: string;
  name: string;
};

export type SelectOption = {
  value: string;
  label: string;
};

export const convertToSelectOptions = <T extends SelectableItem>(items: T[]): SelectOption[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(item => ({
    value: item.id,
    label: formatLabel(item.name),
  }));
};

export const convertToTypeOptions = convertToSelectOptions;
